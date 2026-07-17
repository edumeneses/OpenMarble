"""
MarbleOS Backend — FastAPI proxy to the SHARP Gradio app running on port 7860.

Run with:
    uvicorn main:app --host 0.0.0.0 --port 8000
"""

from __future__ import annotations

import copy
import json
import logging
import os
import shutil
import signal
import subprocess
import time
import traceback
import uuid
from pathlib import Path

import httpx
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from gradio_client import Client, handle_file

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("marbleos")

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
GRADIO_URL = "http://localhost:7860"
WORLDGEN_URL = "http://localhost:7861"
WORLDGEN_TIMEOUT_S = 600.0  # first request also pays ~10s model load

UPLOADS_DIR = Path(__file__).resolve().parent / "uploads"
OUTPUTS_DIR = Path(__file__).resolve().parent / "outputs"
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
OUTPUTS_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp"}
IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"]

# ---------------------------------------------------------------------------
# FlashWorld (engine #3) — a 3DGS scene generator run as a detached, per-job
# subprocess rather than a persistent HTTP service. A scene takes ~13 min and
# the model needs the whole 16GB GPU, so it cannot coexist with SHARP/WorldGen
# and cannot fit inside a synchronous HTTP request. Instead /api/generate
# launches the job and returns a job id; the frontend polls /api/jobs/{id}.
FLASHWORLD_DIR = Path("/media/Storage/FlashWorld")
FLASHWORLD_PYTHON = FLASHWORLD_DIR / ".venv/bin/python"
FLASHWORLD_TEMPLATE = Path(__file__).resolve().parent / "flashworld_template.json"
FLASHWORLD_JOBS_DIR = Path(__file__).resolve().parent / "flashworld_jobs"
FLASHWORLD_JOBS_DIR.mkdir(parents=True, exist_ok=True)
# .env.storage keeps HF/torch caches on the big disk (root is near full).
ENV_STORAGE = Path("/media/Storage/OpenMarble/.env.storage")

# In-memory job registry. Lost on restart — acceptable for a single-box dev
# tool; the .ply files themselves survive in OUTPUTS_DIR and show in the
# gallery. Maps job_id -> dict(status, pid, ply_src, video_src, thumbnail, log).
JOBS: dict[str, dict] = {}
# FlashWorld is single-GPU; serialize its jobs. Holds the job_id currently
# occupying the GPU, or None.
_flashworld_active: str | None = None

# ---------------------------------------------------------------------------
# App
# ---------------------------------------------------------------------------
app = FastAPI(title="MarbleOS API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3080",
        "http://localhost:3090",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve generated .ply / .mp4 files
app.mount("/files", StaticFiles(directory=str(OUTPUTS_DIR)), name="files")


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------


@app.get("/api/health")
async def health():
    sharp_ok = False
    worldgen_ok = False
    try:
        client = Client(GRADIO_URL)
        _ = client.view_api(print_info=False)
        sharp_ok = True
    except Exception:
        pass
    try:
        async with httpx.AsyncClient(timeout=5.0) as hc:
            r = await hc.get(f"{WORLDGEN_URL}/health")
            worldgen_ok = r.status_code == 200
    except Exception:
        pass
    return {
        "status": "ok" if sharp_ok else "degraded",
        "gradio_connected": sharp_ok,
        "worldgen_connected": worldgen_ok,
    }


async def _generate_worldgen(
    upload_path: Path,
    upload_id: str,
    ext: str,
    prompt: str,
    pano: str = "auto",
    format: str = "splat",
) -> JSONResponse:
    """Route a generation to the WorldGen service (engine #2, 360° worlds)."""
    logger.info("[worldgen] Sending %s to %s ...", upload_path, WORLDGEN_URL)
    async with httpx.AsyncClient(timeout=WORLDGEN_TIMEOUT_S) as hc:
        with open(upload_path, "rb") as f:
            resp = await hc.post(
                f"{WORLDGEN_URL}/generate",
                files={"image": (upload_path.name, f)},
                data={"prompt": prompt, "pano": pano, "format": format},
            )
    if resp.status_code != 200:
        detail = resp.text[:500]
        logger.error("[worldgen] Service error %s: %s", resp.status_code, detail)
        raise HTTPException(status_code=502, detail=f"WorldGen service: {detail}")

    payload = resp.json()
    ply_source = Path(payload["ply_path"])
    if not ply_source.exists():
        raise HTTPException(
            status_code=500,
            detail=f"WorldGen reported output at {ply_source} but file is missing",
        )

    # Keep the service's extension: .ply for splats, .glb for meshes.
    ply_filename = f"{upload_id}{ply_source.suffix}"
    shutil.copy2(ply_source, OUTPUTS_DIR / ply_filename)

    thumbnail_filename = f"{upload_id}{ext}"
    shutil.copy2(upload_path, OUTPUTS_DIR / thumbnail_filename)

    logger.info(
        "[worldgen] Done in %ss — %s", payload.get("elapsed_seconds"), ply_filename
    )
    return JSONResponse(
        {
            "id": upload_id,
            "engine": "worldgen",
            "ply_url": f"http://localhost:8000/files/{ply_filename}",
            "ply_filename": ply_filename,
            "video_url": None,
            "thumbnail_url": f"http://localhost:8000/files/{thumbnail_filename}",
        }
    )


def _storage_env() -> dict:
    """Base env for FlashWorld: inherit ours, overlay .env.storage exports and
    the CUDA allocator hint that keeps 16GB fragmentation in check."""
    env = dict(os.environ)
    env["PYTORCH_CUDA_ALLOC_CONF"] = "expandable_segments:True"
    if ENV_STORAGE.exists():
        for line in ENV_STORAGE.read_text().splitlines():
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            line = line.removeprefix("export ").strip()
            if "=" in line:
                key, _, val = line.partition("=")
                env[key.strip()] = val.strip().strip('"').strip("'")
    return env


def _launch_flashworld(
    upload_path: Path, upload_id: str, ext: str, prompt: str
) -> JSONResponse:
    """Build a FlashWorld job input and spawn cli.py detached. Returns
    immediately with status=processing; the client polls /api/jobs/{id}."""
    global _flashworld_active

    # Reject if another FlashWorld job still owns the GPU.
    if _flashworld_active and _flashworld_active in JOBS:
        active = JOBS[_flashworld_active]
        if active["status"] == "processing" and _proc_alive(active.get("pid")):
            raise HTTPException(
                status_code=409,
                detail=(
                    "FlashWorld is busy with another scene "
                    f"(job {_flashworld_active}). Try again when it finishes."
                ),
            )

    if not FLASHWORLD_PYTHON.exists():
        raise HTTPException(
            status_code=503,
            detail=f"FlashWorld venv not found at {FLASHWORLD_PYTHON}",
        )

    job_dir = FLASHWORLD_JOBS_DIR / upload_id
    input_dir = job_dir / "input"
    output_dir = job_dir / "output"
    input_dir.mkdir(parents=True, exist_ok=True)
    output_dir.mkdir(parents=True, exist_ok=True)

    # FlashWorld accepts image_prompt as a filesystem path, so copy the upload
    # into the job dir (the transient /uploads file is deleted after this call).
    image_dest = job_dir / f"source{ext}"
    shutil.copy2(upload_path, image_dest)

    # Reuse the canonical 24-camera trajectory; the model rescales intrinsics
    # to the input image, so only the image + text prompt change per job.
    scene = json.loads(FLASHWORLD_TEMPLATE.read_text())
    scene["image_prompt"] = str(image_dest)
    scene["text_prompt"] = prompt or ""
    # cli.py names the output subdir after the json stem.
    (input_dir / "scene.json").write_text(json.dumps(scene))

    log_path = job_dir / "run.log"
    cmd = [
        str(FLASHWORLD_PYTHON), "cli.py",
        "--input_dir", str(input_dir),
        "--output_dir", str(output_dir),
        "--offload_t5", "--offload_vae",  # required on 16GB
        "--ply", "--video",
    ]
    logger.info("[flashworld] launching job %s: %s", upload_id, " ".join(cmd))
    with open(log_path, "wb") as log_f:
        proc = subprocess.Popen(
            cmd,
            cwd=str(FLASHWORLD_DIR),
            env=_storage_env(),
            stdout=log_f,
            stderr=subprocess.STDOUT,
            start_new_session=True,  # detach: survives if this request dies
        )

    # Persist a thumbnail immediately so the gallery/preview has the source.
    thumbnail_filename = f"{upload_id}{ext}"
    shutil.copy2(upload_path, OUTPUTS_DIR / thumbnail_filename)

    JOBS[upload_id] = {
        "status": "processing",
        "engine": "flashworld",
        "pid": proc.pid,
        "ply_src": output_dir / "scene" / "gaussians.ply",
        "video_src": output_dir / "scene" / "video.mp4",
        "log": log_path,
        "ext": ext,
        "thumbnail_filename": thumbnail_filename,
        "started": time.time(),
    }
    _flashworld_active = upload_id

    return JSONResponse(
        {
            "id": upload_id,
            "engine": "flashworld",
            "status": "processing",
            "job_id": upload_id,
            "poll_url": f"http://localhost:8000/api/jobs/{upload_id}",
        }
    )


def _proc_alive(pid: int | None) -> bool:
    if not pid:
        return False
    try:
        os.kill(pid, 0)
    except ProcessLookupError:
        return False  # no such process → dead
    except PermissionError:
        return True  # exists but owned by another user → alive
    except OSError:
        return False
    return True


def _publish_flashworld(job_id: str, job: dict) -> dict:
    """Copy a finished job's .ply/.mp4 into OUTPUTS_DIR and build the result."""
    ply_filename = f"{job_id}.ply"
    shutil.copy2(job["ply_src"], OUTPUTS_DIR / ply_filename)

    video_url = None
    if job["video_src"].exists():
        video_filename = f"{job_id}.mp4"
        shutil.copy2(job["video_src"], OUTPUTS_DIR / video_filename)
        video_url = f"http://localhost:8000/files/{video_filename}"

    thumbnail_url = f"http://localhost:8000/files/{job['thumbnail_filename']}"
    result = {
        "id": job_id,
        "engine": "flashworld",
        "status": "completed",
        "ply_url": f"http://localhost:8000/files/{ply_filename}",
        "ply_filename": ply_filename,
        "video_url": video_url,
        "thumbnail_url": thumbnail_url,
    }
    job.update(status="completed", result=result)
    return result


@app.get("/api/jobs/{job_id}")
async def job_status(job_id: str):
    """Poll a FlashWorld job. Lazily publishes output the first time the .ply
    appears, so no background loop is needed."""
    global _flashworld_active
    job = JOBS.get(job_id)
    if job is None:
        raise HTTPException(status_code=404, detail=f"Unknown job: {job_id}")

    if job["status"] == "completed":
        return JSONResponse(job["result"])
    if job["status"] == "error":
        return JSONResponse(
            {"id": job_id, "engine": "flashworld", "status": "error",
             "detail": job.get("detail", "unknown error")},
            status_code=200,
        )

    # Still marked processing — resolve the real state.
    if job["ply_src"].exists():
        if _flashworld_active == job_id:
            _flashworld_active = None
        logger.info("[flashworld] job %s produced ply — publishing", job_id)
        return JSONResponse(_publish_flashworld(job_id, job))

    if not _proc_alive(job.get("pid")):
        # Process gone without a .ply → failed. Surface the log tail.
        if _flashworld_active == job_id:
            _flashworld_active = None
        tail = ""
        if job["log"].exists():
            tail = job["log"].read_text(errors="replace")[-1500:]
        job.update(status="error", detail=f"FlashWorld exited without output.\n{tail}")
        logger.error("[flashworld] job %s failed. Log tail:\n%s", job_id, tail)
        return JSONResponse(
            {"id": job_id, "engine": "flashworld", "status": "error",
             "detail": job["detail"]},
            status_code=200,
        )

    elapsed = int(time.time() - job["started"])
    return JSONResponse(
        {"id": job_id, "engine": "flashworld", "status": "processing",
         "elapsed_seconds": elapsed}
    )


@app.post("/api/generate")
async def generate(
    image: UploadFile = File(...),
    engine: str = "sharp",
    prompt: str = "",
    pano: str = "auto",
    format: str = "splat",
    render_video: bool = True,
    trajectory_type: str = "rotate_forward",
    num_frames: int = 60,
    fps: int = 30,
    output_resolution: int = 0,
):
    if engine not in ("sharp", "worldgen", "flashworld"):
        raise HTTPException(
            status_code=400,
            detail=f"Unknown engine: {engine}. Allowed: sharp, worldgen, flashworld",
        )

    ext = Path(image.filename or "upload.png").suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {ext}. Allowed: {', '.join(ALLOWED_EXTENSIONS)}",
        )

    upload_id = uuid.uuid4().hex[:12]
    upload_path = UPLOADS_DIR / f"{upload_id}{ext}"

    try:
        content = await image.read()
        upload_path.write_bytes(content)
        logger.info(
            "[1/5] Saved upload: %s (%d bytes)", upload_path, len(content)
        )

        if engine == "worldgen":
            return await _generate_worldgen(upload_path, upload_id, ext, prompt, pano, format)

        if engine == "flashworld":
            # Long (~13 min) GPU job — launch detached and return a job id.
            return _launch_flashworld(upload_path, upload_id, ext, prompt)

        # Call the Gradio app's run_sharp function
        # Inputs: [image_in, trajectory, output_res, frames, fps_in, render_toggle]
        # Outputs: [video_out, ply_download, status_md]
        logger.info("[2/5] Connecting to Gradio at %s ...", GRADIO_URL)
        client = Client(GRADIO_URL)

        logger.info(
            "[3/5] Calling /run_sharp — trajectory=%s, resolution=%s, "
            "frames=%s, fps=%s, render_video=%s",
            trajectory_type,
            output_resolution,
            num_frames,
            fps,
            render_video,
        )
        result = client.predict(
            image_path=handle_file(str(upload_path)),
            trajectory_type=trajectory_type,
            output_long_side=output_resolution,
            num_frames=num_frames,
            fps=fps,
            render_video=render_video,
            api_name="/run_sharp",
        )
        logger.info("[3/5] Gradio returned: %s", repr(result))

        # result is a tuple: (video_path, ply_file_info, status_markdown)
        video_result = result[0]
        ply_result = result[1]
        status_msg = result[2]

        logger.info(
            "[4/5] Parsing results — video_result=%s (type=%s), "
            "ply_result=%s (type=%s), status=%s",
            video_result,
            type(video_result).__name__,
            ply_result,
            type(ply_result).__name__,
            status_msg,
        )

        # Check for error in status
        if "Error" in str(status_msg):
            logger.error("Gradio reported error: %s", status_msg)
            raise HTTPException(status_code=500, detail=str(status_msg))

        # The ply_result may be a string path, a dict with 'value', or other
        ply_source_path: str | None = None
        if isinstance(ply_result, str):
            ply_source_path = ply_result
        elif isinstance(ply_result, dict):
            # Gradio DownloadButton returns dict like {"value": "/path/to/file", ...}
            ply_source_path = ply_result.get("value") or ply_result.get("path")
            logger.info("ply_result is dict, extracted path: %s", ply_source_path)
        elif isinstance(ply_result, (list, tuple)) and len(ply_result) > 0:
            ply_source_path = str(ply_result[0])
            logger.info("ply_result is list/tuple, using first element: %s", ply_source_path)

        # Copy .ply file to our outputs directory
        ply_url = None
        ply_filename = None
        thumbnail_url = None

        if ply_source_path:
            ply_source = Path(ply_source_path)
            logger.info(
                "PLY source: %s — exists=%s", ply_source, ply_source.exists()
            )
            if ply_source.exists():
                ply_filename = f"{upload_id}.ply"
                ply_dest = OUTPUTS_DIR / ply_filename
                shutil.copy2(ply_source, ply_dest)
                ply_url = f"http://localhost:8000/files/{ply_filename}"
                logger.info("Copied PLY to %s", ply_dest)

                # Persist source image alongside the .ply so the gallery can use
                # it as a thumbnail. The stem is the same as the .ply file so the
                # mapping is purely filename-based (no separate DB needed).
                thumbnail_filename = f"{upload_id}{ext}"
                thumbnail_dest = OUTPUTS_DIR / thumbnail_filename
                shutil.copy2(upload_path, thumbnail_dest)
                thumbnail_url = f"http://localhost:8000/files/{thumbnail_filename}"
                logger.info("Copied thumbnail to %s", thumbnail_dest)
        else:
            logger.warning("Could not extract PLY path from result")

        # Copy video file if available
        video_url = None
        video_source_path: str | None = None
        if isinstance(video_result, str):
            video_source_path = video_result
        elif isinstance(video_result, dict):
            video_source_path = video_result.get("value") or video_result.get("video", {}).get("path") if isinstance(video_result, dict) else None

        if video_source_path:
            video_source = Path(video_source_path)
            if video_source.exists():
                video_filename = f"{upload_id}.mp4"
                video_dest = OUTPUTS_DIR / video_filename
                shutil.copy2(video_source, video_dest)
                video_url = f"http://localhost:8000/files/{video_filename}"
                logger.info("Copied video to %s", video_dest)

        if not ply_url:
            logger.error(
                "No PLY file produced. Full Gradio result: %s", repr(result)
            )
            raise HTTPException(
                status_code=500,
                detail="Generation failed: no .ply file produced",
            )

        logger.info("[5/5] Success — ply_url=%s, video_url=%s, thumbnail_url=%s", ply_url, video_url, thumbnail_url)
        return JSONResponse(
            {
                "id": upload_id,
                "ply_url": ply_url,
                "ply_filename": ply_filename,
                "video_url": video_url,
                "thumbnail_url": thumbnail_url,
            }
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error("Unhandled error in /api/generate:\n%s", traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        upload_path.unlink(missing_ok=True)


@app.get("/api/gallery")
async def gallery():
    items = []
    for ply in sorted(
        OUTPUTS_DIR.glob("*.ply"),
        key=lambda p: p.stat().st_mtime,
        reverse=True,
    ):
        # Resolve thumbnail by finding a same-stem image file in outputs/.
        # e.g. abc123.ply → abc123.jpg (or .png, .webp, .jpeg)
        thumbnail_url = None
        for img_ext in IMAGE_EXTENSIONS:
            candidate = OUTPUTS_DIR / f"{ply.stem}{img_ext}"
            if candidate.exists():
                thumbnail_url = f"http://localhost:8000/files/{candidate.name}"
                break

        video_url = None
        video_candidate = OUTPUTS_DIR / f"{ply.stem}.mp4"
        if video_candidate.exists():
            video_url = f"http://localhost:8000/files/{video_candidate.name}"

        items.append(
            {
                "id": ply.stem,
                "ply_url": f"http://localhost:8000/files/{ply.name}",
                "ply_filename": ply.name,
                "created_at": ply.stat().st_mtime,
                "thumbnail_url": thumbnail_url,
                "video_url": video_url,
            }
        )
    return {"items": items}


@app.get("/api/worlds")
async def worlds():
    """Return all generated worlds that have both a .mp4 preview and a .ply file."""
    items = []
    for mp4 in sorted(
        OUTPUTS_DIR.glob("*.mp4"),
        key=lambda p: p.stat().st_mtime,
        reverse=True,
    ):
        ply = OUTPUTS_DIR / f"{mp4.stem}.ply"
        if not ply.exists():
            continue

        thumbnail_url = None
        for img_ext in IMAGE_EXTENSIONS:
            candidate = OUTPUTS_DIR / f"{mp4.stem}{img_ext}"
            if candidate.exists():
                thumbnail_url = f"http://localhost:8000/files/{candidate.name}"
                break

        items.append(
            {
                "id": mp4.stem,
                "ply_url": f"http://localhost:8000/files/{ply.name}",
                "video_url": f"http://localhost:8000/files/{mp4.name}",
                "thumbnail_url": thumbnail_url,
                "created_at": mp4.stat().st_mtime,
            }
        )
    return {"items": items}
