import axios from 'axios';
import { RealEstateTransaction, RealEstateAgent, SearchResult } from '../types';

const SEOUL_API_KEY = process.env.NEXT_PUBLIC_SEOUL_API_KEY;
const BASE_URL = 'http://openapi.seoul.go.kr:8088';

export const realEstateApi = {
  async searchByAddress(address: string): Promise<SearchResult> {
    try {
      const currentYear = new Date().getFullYear().toString();
      
      // 실거래가 정보 조회 (아파트 실거래가 정보)
      const transactionResponse = await axios.get(
        `${BASE_URL}/${SEOUL_API_KEY}/json/tbLnOpendataRtmsV/1/1000/`,
        {
          params: {
            RCPT_YR: currentYear,
          }
        }
      );

      // API 응답 데이터 상세 로깅
      console.log('=== Transaction API Response ===');
      console.log('URL:', transactionResponse.config.url);
      console.log('Params:', transactionResponse.config.params);
      console.log('Status:', transactionResponse.status);
      console.log('Data Structure:', Object.keys(transactionResponse.data));
      if (transactionResponse.data?.tbLnOpendataRtmsV?.row) {
        console.log('First Row Sample:', JSON.stringify(transactionResponse.data.tbLnOpendataRtmsV.row[0], null, 2));
      }

      // 공인중개사 정보 조회 - 전체 데이터를 가져와서 필터링
      const agentResponse = await axios.get(
        `${BASE_URL}/${SEOUL_API_KEY}/json/LOCALDATA_072404/1/1000/`
      );

      // 공인중개사 API 응답 데이터 상세 로깅
      console.log('=== Agent API Response ===');
      console.log('URL:', agentResponse.config.url);
      console.log('Status:', agentResponse.status);
      console.log('Data Structure:', Object.keys(agentResponse.data));
      if (agentResponse.data?.LOCALDATA_072404?.row) {
        console.log('Total Agents:', agentResponse.data.LOCALDATA_072404.row.length);
        console.log('First Row Sample:', JSON.stringify(agentResponse.data.LOCALDATA_072404.row[0], null, 2));
      }

      // 응답 데이터 변환
      let transactions: RealEstateTransaction[] = [];
      if (transactionResponse.data?.tbLnOpendataRtmsV?.row) {
        transactions = transactionResponse.data.tbLnOpendataRtmsV.row
          .filter((item: any) => {
            // 검색한 동과 일치하는 데이터만 필터링
            return item.STDG_NM.includes(address);
          })
          .map((item: any) => {
            return {
              price: parseInt(String(item.THING_AMT || '0').replace(/,/g, '')), // 실거래가
              area: parseFloat(item.ARCH_AREA || '0'), // 건축면적
              floor: parseInt(item.FLR || '0'), // 층수
              date: item.CTRT_DAY || '', // 계약일자
              address: `${item.CGG_NM} ${item.STDG_NM} ${item.MNO || ''}${item.SNO ? '-' + item.SNO : ''}`, // 주소
              buildingName: item.BLDG_NM || '' // 건물명
            };
          })
          .sort((a: RealEstateTransaction, b: RealEstateTransaction) => b.date.localeCompare(a.date));
      }

      let agents: RealEstateAgent[] = [];
      if (agentResponse.data?.LOCALDATA_072404?.row) {
        agents = agentResponse.data.LOCALDATA_072404.row
          .filter((item: any) => {
            // 영업중이고 공인중개사인 경우만 필터링
            const isActive = item.TRDSTATEGBN === '01'; // 영업중
            const isRealEstateAgent = item.UPTAENM === '부동산중개업' || item.UPTAENM?.includes('공인중개사');
            const hasMatchingAddress = 
              (item.SITEWHLADDR && item.SITEWHLADDR.includes(address)) || 
              (item.RDNWHLADDR && item.RDNWHLADDR.includes(address));
            
            console.log('Filtering agent:', {
              name: item.BPLCNM,
              status: item.TRDSTATEGBN,
              type: item.UPTAENM,
              address: item.SITEWHLADDR || item.RDNWHLADDR,
              isActive,
              isRealEstateAgent,
              hasMatchingAddress
            });

            return isActive && isRealEstateAgent && hasMatchingAddress;
          })
          .map((item: any) => {
            console.log('Processing agent item:', item);
            return {
              officeName: item.BPLCNM || '',
              address: item.RDNWHLADDR || item.SITEWHLADDR || '',
              tel: item.SITETEL || '',
              representative: '', // API에서 제공하지 않음
              latitude: parseFloat((item.Y || '0').trim()),
              longitude: parseFloat((item.X || '0').trim())
            };
          });

        console.log('Filtered Agents Count:', agents.length);
      }

      return {
        transactions,
        nearbyAgents: agents
      };
    } catch (error) {
      console.error('Error fetching real estate data:', error);
      if (axios.isAxiosError(error)) {
        console.error('API Error Response:', error.response?.data);
        console.error('API Error Config:', error.config);
      }
      throw new Error('데이터를 불러오는 중 오류가 발생했습니다. 검색어를 확인해주세요.');
    }
  }
}; 