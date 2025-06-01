import axios, { AxiosError } from 'axios';
import { RealEstateTransaction, RealEstateAgent, SearchResult } from '../types';

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

interface AgentApiResponse {
  LOCALDATA_072404: {
    row: Array<{
      TRDSTATEGBN: string;
      SITEWHLADDR: string;
      RDNWHLADDR: string;
      BPLCNM: string;
      SITETEL: string;
      UPTAENM: string;
      X: string;
      Y: string;
    }>;
  };
}

export const realEstateApi = {
  async searchByAddress(address: string): Promise<SearchResult> {
    try {
      const currentYear = new Date().getFullYear().toString();
      
      // 두 API를 병렬로 호출
      const [transactionResponse, agentResponse] = await Promise.all([
        // 실거래가 정보 조회
        axios.get<TransactionApiResponse>(
          `${BASE_URL}/${SEOUL_API_KEY}/json/tbLnOpendataRtmsV/1/1000/`,
          {
            params: {
              RCPT_YR: currentYear,
            }
          }
        ),
        // 공인중개사 정보 조회
        axios.get<AgentApiResponse>(
          `${BASE_URL}/${SEOUL_API_KEY}/json/LOCALDATA_072404/1/1000/`
        )
      ]);

      // 공인중개사 API 응답 로깅
      console.log('Agent API Response:', {
        status: agentResponse.status,
        hasData: !!agentResponse.data,
        rowCount: agentResponse.data?.LOCALDATA_072404?.row?.length || 0,
        firstRow: agentResponse.data?.LOCALDATA_072404?.row?.[0],
      });

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

      let agents: RealEstateAgent[] = [];
      if (agentResponse.data?.LOCALDATA_072404?.row) {
        // 검색한 주소에서 구(區) 추출
        const districtMatch = address.match(/(.*?[구])/);
        const district = districtMatch ? districtMatch[1] : '';
        
        console.log('Searching with:', {
          address,
          district,
          totalAgents: agentResponse.data.LOCALDATA_072404.row.length
        });

        const filteredAgents = agentResponse.data.LOCALDATA_072404.row
          .filter((item) => {
            // 영업중이고 공인중개사인 경우만 필터링
            const isActive = item.TRDSTATEGBN === '01'; // 영업중
            
            // 업종 확인 (부동산중개 관련 업종)
            const isRealEstateAgent = 
              item.UPTAENM?.includes('부동산') || 
              item.UPTAENM?.includes('공인중개사') ||
              item.UPTAENM?.includes('중개업');
            
            // 주소 매칭 (구 단위로 확인)
            const hasMatchingAddress = 
              (item.SITEWHLADDR && (
                item.SITEWHLADDR.includes(address) ||
                (district && item.SITEWHLADDR.includes(district))
              )) || 
              (item.RDNWHLADDR && (
                item.RDNWHLADDR.includes(address) ||
                (district && item.RDNWHLADDR.includes(district))
              ));
            
            // 각 필터 조건 로깅
            const filterResult = {
              name: item.BPLCNM,
              status: item.TRDSTATEGBN,
              type: item.UPTAENM,
              address: item.SITEWHLADDR || item.RDNWHLADDR,
              isActive,
              isRealEstateAgent,
              hasMatchingAddress
            };
            
            console.log('Agent filter check:', filterResult);

            return isActive && isRealEstateAgent && hasMatchingAddress;
          });

        console.log('Filtered agents before mapping:', {
          count: filteredAgents.length,
          agents: filteredAgents.slice(0, 3) // 처음 3개만 로깅
        });

        agents = filteredAgents
          .map((item) => ({
            officeName: item.BPLCNM || '',
            address: item.RDNWHLADDR || item.SITEWHLADDR || '',
            tel: item.SITETEL || '',
            representative: '', // API에서 제공하지 않음
            latitude: parseFloat((item.Y || '0').trim()),
            longitude: parseFloat((item.X || '0').trim())
          }))
          .slice(0, 10); // 상위 10개만 표시

        console.log('Final agents result:', {
          count: agents.length,
          agents: agents
        });
      } else {
        console.log('No LOCALDATA_072404 data in response');
      }

      const result = {
        transactions,
        nearbyAgents: agents
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