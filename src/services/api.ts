import axios from 'axios';
import { RealEstateTransaction, SearchResult, RealEstateTransactionApiResponse } from '../types';

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

export const realEstateApi = {
  async searchByAddress(address: string): Promise<SearchResult> {
    try {
      const SEOUL_API_KEY = process.env.NEXT_PUBLIC_SEOUL_API_KEY;
      if (!SEOUL_API_KEY) {
        throw new Error('API key is not configured');
      }

      const startTime = performance.now();
      console.log('🔍 검색 시작:', address);

      const currentYear = new Date().getFullYear().toString();
      const url = `http://openapi.seoul.go.kr:8088/${SEOUL_API_KEY}/json/tbLnOpendataRtmsV/1/1000/`;
      
      const response = await axios.get<RealEstateTransactionApiResponse>(url);
      
      if (!response.data?.tbLnOpendataRtmsV?.row) {
        throw new Error('데이터를 찾을 수 없습니다.');
      }

      // 주소로 필터링
      const filteredData = response.data.tbLnOpendataRtmsV.row.filter(item => 
        item.CGG_NM.includes(address) || 
        item.STDG_NM.includes(address) ||
        item.BLDG_NM.includes(address)
      );

      // 데이터 변환
      const transactions: RealEstateTransaction[] = filteredData.map(item => ({
        price: parseInt(String(item.THING_AMT || '0').replace(/,/g, '')),
        area: parseFloat(item.ARCH_AREA || '0'),
        floor: parseInt(item.FLR || '0'),
        date: item.CTRT_DAY || '',
        address: `${item.CGG_NM} ${item.STDG_NM} ${item.MNO}${item.SNO ? '-' + item.SNO : ''}`,
        buildingName: item.BLDG_NM || ''
      })).sort((a, b) => b.date.localeCompare(a.date));

      const endTime = performance.now();
      const totalTime = endTime - startTime;
      
      console.log('📊 성능 측정 결과:');
      console.log(`- 전체 처리 시간: ${totalTime.toFixed(2)}ms`);
      console.log(`- 검색된 결과 수: ${transactions.length}건`);

      return { transactions };
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : String(error));
      throw new Error(error instanceof Error ? error.message : '검색 중 오류가 발생했습니다.');
    }
  }
}; 