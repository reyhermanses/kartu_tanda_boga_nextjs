import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');

    if (!imageUrl) {
      return NextResponse.json({ error: 'Image URL is required' }, { status: 400 });
    }

    // Fetch the image from the external URL
    const response = await fetch(imageUrl);
    
    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch image' }, { status: response.status });
    }

    // Get the image data
    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/jpeg';

    // Return the image with proper headers (reduced cache for faster updates)
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=300, must-revalidate', // Cache for 5 minutes with revalidation
        'ETag': `"${Buffer.from(imageUrl).toString('base64')}"`, // Add ETag for better cache management
        'Last-Modified': new Date().toUTCString(),
      },
    });
  } catch (error) {
    console.error('Error proxying image:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
