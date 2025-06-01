import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // URL에서 경로 매개변수 추출
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/api/seoul/');
    if (pathSegments.length < 2) {
      return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
    }

    const apiPath = pathSegments[1];
    const searchParams = url.searchParams.toString();

    // 서울시 API 호출
    const response = await fetch(
      `http://openapi.seoul.go.kr:8088/${process.env.SEOUL_API_KEY}/${apiPath}${
        searchParams ? `?${searchParams}` : ''
      }`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

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