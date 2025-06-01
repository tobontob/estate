import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';  // This is important to tell Next.js this is a dynamic route

export async function GET(request: NextRequest) {
  try {
    // Get the search parameters from the request
    const searchParams = request.nextUrl.searchParams;
    const apiPath = request.nextUrl.pathname.replace('/api/seoul/', '');

    if (!apiPath) {
      return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
    }

    // Build the Seoul API URL
    const seoulApiUrl = new URL(`http://openapi.seoul.go.kr:8088/${process.env.SEOUL_API_KEY}/${apiPath}`);
    
    // Append all search parameters
    searchParams.forEach((value, key) => {
      seoulApiUrl.searchParams.append(key, value);
    });

    // Call the Seoul API
    const response = await fetch(seoulApiUrl.toString(), {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data from Seoul API' },
      { status: 500 }
    );
  }
} 