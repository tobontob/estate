import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import NodeCache from 'node-cache';

// 캐시 인스턴스 생성 (TTL: 1시간)
const cache = new NodeCache({ stdTTL: 3600 });

// 검색 결과 필터링 및 정렬 함수
const processSearchResults = (data: any[], searchTerm: string) => {
  console.log(`검색어: ${searchTerm}, 전체 데이터 수: ${data.length}`);
  
  const filteredData = data.filter(item => {
    const matches = 
      (item.SGG_NM && item.SGG_NM.includes(searchTerm)) ||
      (item.BJDONG_NM && item.BJDONG_NM.includes(searchTerm)) ||
      (item.BLDG_NM && item.BLDG_NM.includes(searchTerm));
    
    if (matches) {
      console.log('매칭된 데이터:', {
        구: item.SGG_NM,
        동: item.BJDONG_NM,
        건물명: item.BLDG_NM,
        가격: item.OBJ_AMT,
        날짜: item.DEAL_YMD
      });
    }
    return matches;
  });

  console.log(`필터링 후 데이터 수: ${filteredData.length}`);
  
  return filteredData.map(item => ({
    price: parseInt(String(item.OBJ_AMT || '0').replace(/,/g, '')),
    area: parseFloat(item.BLDG_AREA || '0'),
    floor: parseInt(item.FLR_NO || '0'),
    date: item.DEAL_YMD || '',
    address: `${item.SGG_NM} ${item.BJDONG_NM} ${item.BOBN}${item.BUBN ? '-' + item.BUBN : ''}`,
    buildingName: item.BLDG_NM || ''
  }));
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const startTime = Date.now();
  console.log('API 요청 시작');

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { address } = req.query;
    const searchTerm = Array.isArray(address) ? address[0] : address;
    
    if (!searchTerm) {
      return res.status(400).json({ message: '주소를 입력해주세요.' });
    }

    console.log(`검색어: ${searchTerm}`);

    // 캐시 키 생성
    const cacheKey = `search-${searchTerm}`;
    
    // 캐시된 데이터 확인
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      console.log(`캐시된 데이터 반환: ${searchTerm}, 데이터 수: ${(cachedData as any[]).length}`);
      const endTime = Date.now();
      console.log(`응답 시간: ${endTime - startTime}ms`);
      return res.status(200).json({ transactions: cachedData });
    }

    const SEOUL_API_KEY = process.env.NEXT_PUBLIC_SEOUL_API_KEY;
    if (!SEOUL_API_KEY) {
      return res.status(500).json({ message: 'API key is not configured' });
    }

    // 현재 년월 계산
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    
    // 서울시 부동산 실거래가 API 호출 (월별 데이터)
    const url = `http://openapi.seoul.go.kr:8088/${SEOUL_API_KEY}/json/rtmsApi/${year}${month}/1/1000/`;
    console.log('서울시 API 호출:', url);
    
    const response = await axios.get(url, { 
      timeout: 10000,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    console.log('서울시 API 응답 받음');
    console.log('응답 데이터 구조:', Object.keys(response.data));

    if (!response.data || !response.data.rtmsApi || !response.data.rtmsApi.row) {
      console.log('데이터 없음:', response.data);
      return res.status(404).json({ message: '데이터를 찾을 수 없습니다.' });
    }

    // 데이터 처리 및 캐싱
    const results = processSearchResults(response.data.rtmsApi.row, searchTerm);
    
    if (results.length > 0) {
      cache.set(cacheKey, results);
      console.log(`검색 결과 캐시 저장: ${results.length}건`);
    }

    const endTime = Date.now();
    console.log(`응답 시간: ${endTime - startTime}ms`);

    return res.status(200).json({ transactions: results });
  } catch (error) {
    console.error('API Error:', error);
    const endTime = Date.now();
    console.log(`에러 발생 시간: ${endTime - startTime}ms`);
    
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        return res.status(504).json({ message: 'API 요청 시간이 초과되었습니다.' });
      }
      console.log('API 에러 상세:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
    }
    
    return res.status(500).json({ 
      message: error instanceof Error ? error.message : '서버 오류가 발생했습니다.' 
    });
  }
} 