import { NextResponse } from 'next/server';
import { parseString } from 'xml2js';
import { promisify } from 'util';
import { molitApi } from '@/services/molit';
import { MolitApiResponse } from '@/types/molit';

const parseXMLAsync = promisify(parseString);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');
    
    if (!address) {
      return new Response(JSON.stringify({ error: '검색어를 입력해주세요.' }), {
        status: 400,
      });
    }

    const result = await molitApi.searchByAddress(address);
    return NextResponse.json(result);
  } catch (error) {
    console.error('API 요청 중 에러 발생:', error);
    const errorMessage = error instanceof Error ? error.message : '서버 에러가 발생했습니다.';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
    });
  }
} 