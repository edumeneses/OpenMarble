import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')
  const heading = searchParams.get('heading') ?? '0'
  const pitch = searchParams.get('pitch') ?? '0'
  const fov = searchParams.get('fov') ?? '90'
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  if (!apiKey) {
    return NextResponse.json(
      { error: 'Google Maps API key not configured' },
      { status: 500 },
    )
  }

  if (!lat || !lng) {
    return NextResponse.json(
      { error: 'lat and lng are required' },
      { status: 400 },
    )
  }

  const url = new URL('https://maps.googleapis.com/maps/api/streetview')
  url.searchParams.set('size', '640x640')
  url.searchParams.set('location', `${lat},${lng}`)
  url.searchParams.set('heading', heading)
  url.searchParams.set('pitch', pitch)
  url.searchParams.set('fov', fov)
  url.searchParams.set('key', apiKey)

  const response = await fetch(url.toString())
  if (!response.ok) {
    return NextResponse.json(
      { error: 'Failed to fetch Street View image' },
      { status: response.status },
    )
  }

  const contentType = response.headers.get('content-type') ?? 'image/jpeg'
  const buffer = await response.arrayBuffer()

  return new Response(buffer, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
