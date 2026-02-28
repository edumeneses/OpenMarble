import { NextResponse } from 'next/server'
import Replicate from 'replicate'

const replicate = new Replicate()

export async function POST(request: Request) {
  const { prompt } = await request.json()

  if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
    return NextResponse.json(
      { error: 'A text prompt is required.' },
      { status: 400 },
    )
  }

  try {
    const output = await replicate.run('minimax/image-01', {
      input: {
        prompt: prompt.trim(),
        aspect_ratio: '1:1',
      },
    })

    // output is an array of FileOutput objects
    const items = output as Array<{ url(): string }>
    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'No image was generated.' },
        { status: 500 },
      )
    }

    const imageUrl = items[0].url()

    return NextResponse.json({ image_url: imageUrl })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Image generation failed'
    console.error('Replicate error:', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
