import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get('path');
  
  if (!path) {
    return NextResponse.json({ error: 'Path parameter is required' }, { status: 400 });
  }

  const SEOUL_API_KEY = process.env.NEXT_PUBLIC_SEOUL_API_KEY;
  const baseUrl = `http://openapi.seoul.go.kr:8088/${SEOUL_API_KEY}/json`;

  try {
    const response = await fetch(`${baseUrl}/${path}`);
    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching data from Seoul API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data from Seoul API' },
      { status: 500 }
    );
  }
} 