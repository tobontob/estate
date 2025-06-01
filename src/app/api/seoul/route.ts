import { NextResponse } from 'next/server';

// 메모리 캐시 구현
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 30 * 60 * 1000; // 30분

// 병렬 요청을 위한 청크 크기
const CHUNK_SIZE = 100;

async function fetchDataChunk(SEOUL_API_KEY: string, startIndex: number, endIndex: number, year: string) {
  const url = `http://openapi.seoul.go.kr:8088/${SEOUL_API_KEY}/json/tbLnOpendataRtmsV/${startIndex}/${endIndex}?RCPT_YR=${year}`;
  const response = await fetch(url);
  const data = await response.json();
  return data?.tbLnOpendataRtmsV?.row || [];
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');
  const year = searchParams.get('year') || new Date().getFullYear().toString();
  
  if (!address) {
    return NextResponse.json({ error: 'Address parameter is required' }, { status: 400 });
  }

  // 캐시 키 생성
  const cacheKey = `${address}-${year}`;
  const cachedData = cache.get(cacheKey);
  
  // 유효한 캐시가 있으면 반환
  if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
    console.log('캐시된 데이터 반환:', cacheKey);
    return NextResponse.json(cachedData.data);
  }

  const SEOUL_API_KEY = process.env.NEXT_PUBLIC_SEOUL_API_KEY;
  if (!SEOUL_API_KEY) {
    return NextResponse.json({ error: 'API key is not configured' }, { status: 500 });
  }

  try {
    console.time('API 호출 시간');
    
    // 병렬로 데이터 가져오기
    const chunks = [];
    for (let i = 1; i <= 1000; i += CHUNK_SIZE) {
      const endIndex = Math.min(i + CHUNK_SIZE - 1, 1000);
      chunks.push(fetchDataChunk(SEOUL_API_KEY, i, endIndex, year));
    }

    const results = await Promise.all(chunks);
    console.timeEnd('API 호출 시간');

    // 모든 결과 합치기
    const allRows = results.flat();

    // 주소로 필터링
    const filteredRows = allRows.filter(row => row.STDG_NM.includes(address));

    const filteredData = {
      tbLnOpendataRtmsV: {
        row: filteredRows
      }
    };

    // 결과 캐싱
    cache.set(cacheKey, {
      data: filteredData,
      timestamp: Date.now()
    });

    return NextResponse.json(filteredData);
  } catch (error) {
    console.error('Error fetching data from Seoul API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data from Seoul API' },
      { status: 500 }
    );
  }
} 