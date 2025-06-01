import axios from 'axios';
import { kv } from '@vercel/kv';

// 원본 데이터 타입
interface RealEstateData {
  THING_AMT: string;
  ARCH_AREA: string;
  FLR: string;
  CTRT_DAY: string;
  CGG_NM: string;
  STDG_NM: string;
  MNO: string;
  SNO: string;
  BLDG_NM: string;
}

// 최적화된 데이터 타입
interface OptimizedData {
  p: number;    // price
  a: number;    // area
  f: number;    // floor
  d: string;    // date
  g: string;    // gu
  n: string;    // dong
  m: string;    // main number
  s: string;    // sub number
  b: string;    // building name
}

export async function fetchAllData() {
  const SEOUL_API_KEY = process.env.NEXT_PUBLIC_SEOUL_API_KEY;
  if (!SEOUL_API_KEY) {
    throw new Error('API key is not configured');
  }

  console.log('데이터 수집 시작...');
  const startTime = Date.now();
  let totalDataSize = 0;

  try {
    const allData: RealEstateData[] = [];
    const currentYear = new Date().getFullYear().toString();
    
    // 10개의 청크로 나누어 데이터 수집
    for (let i = 0; i < 10; i++) {
      const startIndex = i * 1000 + 1;
      const endIndex = (i + 1) * 1000;
      
      console.log(`${startIndex}~${endIndex} 데이터 수집 중...`);
      
      const url = `http://openapi.seoul.go.kr:8088/${SEOUL_API_KEY}/json/tbLnOpendataRtmsV/${startIndex}/${endIndex}`;
      const response = await axios.get(url, {
        params: {
          RCPT_YR: currentYear
        }
      });

      if (response.data?.tbLnOpendataRtmsV?.row) {
        allData.push(...response.data.tbLnOpendataRtmsV.row);
      }

      // API 호출 간 딜레이
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // 데이터 최적화 및 동별로 그룹화
    const dongMap = new Map<string, OptimizedData[]>();
    allData.forEach(item => {
      const optimizedItem: OptimizedData = {
        p: parseInt(String(item.THING_AMT || '0').replace(/,/g, '')),
        a: parseFloat(item.ARCH_AREA || '0'),
        f: parseInt(item.FLR || '0'),
        d: item.CTRT_DAY || '',
        g: item.CGG_NM || '',
        n: item.STDG_NM || '',
        m: item.MNO || '',
        s: item.SNO || '',
        b: item.BLDG_NM || ''
      };

      const dong = item.STDG_NM;
      if (!dongMap.has(dong)) {
        dongMap.set(dong, []);
      }
      dongMap.get(dong)?.push(optimizedItem);
    });

    // Vercel KV에 데이터 저장
    const dongList = Array.from(dongMap.keys());
    await kv.set('dong-list', dongList);
    
    // 각 동별 데이터 저장
    for (const [dong, data] of dongMap.entries()) {
      const jsonData = JSON.stringify(data);
      totalDataSize += jsonData.length;
      await kv.set(`dong:${dong}`, data);
    }

    // 마지막 업데이트 시간 저장
    await kv.set('last_updated', new Date().toISOString());

    const endTime = Date.now();
    console.log('\n데이터 수집 완료!');
    console.log(`처리된 총 데이터 수: ${allData.length}건`);
    console.log(`저장된 동 개수: ${dongMap.size}개`);
    console.log(`전체 데이터 크기: ${(totalDataSize / 1024 / 1024).toFixed(2)}MB`);
    console.log(`소요 시간: ${(endTime - startTime) / 1000}초`);

    return {
      status: 'success',
      stats: {
        totalRecords: allData.length,
        totalDongs: dongMap.size,
        dataSizeMB: (totalDataSize / 1024 / 1024).toFixed(2),
        processingTimeSeconds: (endTime - startTime) / 1000
      }
    };

  } catch (error) {
    console.error('데이터 수집 중 오류 발생:', error);
    throw error;
  }
}

// 스크립트 실행
fetchAllData().catch(console.error); 