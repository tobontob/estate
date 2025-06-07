import { NextResponse } from 'next/server';
import { SearchResult } from '@/types';
import { mockAptTradeResponse } from '@/mocks/aptTrade';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const districtCode = searchParams.get('districtCode');
    const yearMonth = searchParams.get('yearMonth');
    
    if (!districtCode || !yearMonth) {
      return new Response(JSON.stringify({ error: '필수 파라미터가 누락되었습니다.' }), {
        status: 400,
      });
    }

    // 모킹 데이터 사용
    const result = mockAptTradeResponse.response;

    // 데이터 변환
    const items = result.body.items.item || [];
    const transactions = items.map((item) => ({
      price: parseInt(item.거래금액.replace(/[^0-9]/g, '')) * 10000,
      buildYear: item.건축년도 ? parseInt(item.건축년도) : undefined,
      date: `${item.년}${item.월.padStart(2, '0')}${item.일.padStart(2, '0')}`,
      area: parseFloat(item.전용면적),
      floor: parseInt(item.층),
      address: `${item.법정동} ${item.지번}`,
      buildingName: item.아파트,
      dealType: item.거래유형,
      dong: item.동
    }));

    return NextResponse.json({ transactions });
  } catch (error) {
    console.error('API 요청 중 에러 발생:', error);
    const errorMessage = error instanceof Error ? error.message : '서버 에러가 발생했습니다.';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
    });
  }
} 