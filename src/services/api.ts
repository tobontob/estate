import axios, { AxiosError } from 'axios';
import { RealEstateTransaction, SearchResult } from '../types';

const SEOUL_API_KEY = process.env.NEXT_PUBLIC_SEOUL_API_KEY;
const BASE_URL = '/api/seoul';  // Updated to use proxy

// 캐시 저장소
const cache: { [key: string]: { data: SearchResult; timestamp: number } } = {};
const CACHE_DURATION = 5 * 60 * 1000; // 5분 캐시

interface TransactionApiResponse {
  tbLnOpendataRtmsV: {
    row: Array<{
      THING_AMT: string;
      ARCH_AREA: string;
      FLR: string;
      CTRT_DAY: string;
      CGG_NM: string;
      STDG_NM: string;
      MNO: string;
      SNO: string;
      BLDG_NM: string;
    }>;
  };
}

export const realEstateApi = {
  async searchByAddress(address: string): Promise<SearchResult> {
    try {
      const currentYear = new Date().getFullYear().toString();
      
      // 실거래가 정보 조회
      const transactionResponse = await axios.get<TransactionApiResponse>(
        `${BASE_URL}/${SEOUL_API_KEY}/json/tbLnOpendataRtmsV/1/1000/`,
        {
          params: {
            RCPT_YR: currentYear,
          }
        }
      );

      // 응답 데이터 변환
      let transactions: RealEstateTransaction[] = [];
      if (transactionResponse.data?.tbLnOpendataRtmsV?.row) {
        transactions = transactionResponse.data.tbLnOpendataRtmsV.row
          .filter((item) => {
            // 검색한 동과 일치하는 데이터만 필터링
            return item.STDG_NM.includes(address);
          })
          .map((item) => {
            return {
              price: parseInt(String(item.THING_AMT || '0').replace(/,/g, '')), // 실거래가
              area: parseFloat(item.ARCH_AREA || '0'), // 건축면적
              floor: parseInt(item.FLR || '0'), // 층수
              date: item.CTRT_DAY || '', // 계약일자
              address: `${item.CGG_NM} ${item.STDG_NM} ${item.MNO || ''}${item.SNO ? '-' + item.SNO : ''}`, // 주소
              buildingName: item.BLDG_NM || '' // 건물명
            };
          })
          .sort((a, b) => b.date.localeCompare(a.date));
      }

      const result = {
        transactions
      };

      // 결과 캐싱
      const cacheKey = `${address}-${new Date().toISOString().split('T')[0]}`;
      cache[cacheKey] = {
        data: result,
        timestamp: Date.now()
      };

      return result;
    } catch (error) {
      console.error('Error details:', {
        error: error,
        message: error instanceof Error ? error.message : String(error),
        response: error instanceof AxiosError ? error.response?.data : null,
        status: error instanceof AxiosError ? error.response?.status : null,
        headers: error instanceof AxiosError ? error.response?.headers : null,
      });
      
      if (axios.isAxiosError(error)) {
        if (error.response) {
          // 서버가 응답을 반환한 경우
          console.error('API Error Response:', {
            status: error.response.status,
            data: error.response.data,
            headers: error.response.headers,
          });
        } else if (error.request) {
          // 요청은 보냈지만 응답을 받지 못한 경우
          console.error('No response received:', error.request);
        } else {
          // 요청 설정 중 오류가 발생한 경우
          console.error('Error setting up request:', error.message);
        }
        console.error('Error config:', error.config);
      }
      
      throw new Error(`데이터를 불러오는 중 오류가 발생했습니다: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}; 