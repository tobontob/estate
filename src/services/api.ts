import axios from 'axios';
import { RealEstateTransaction, RealEstateAgent, SearchResult } from '../types';

const SEOUL_API_KEY = process.env.NEXT_PUBLIC_SEOUL_API_KEY;
const BASE_URL = 'http://openapi.seoul.go.kr:8088';

export const realEstateApi = {
  async searchByAddress(address: string): Promise<SearchResult> {
    try {
      // 실거래가 정보 조회 (아파트 실거래가 정보)
      const transactionResponse = await axios.get(
        `${BASE_URL}/${SEOUL_API_KEY}/json/tbLnOpendataRtmsV/1/100/`,
        {
          params: {
            BJDONG_NM: address, // 법정동명으로 검색
            DEAL_YMD: new Date().getFullYear().toString() // 현재 연도
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

      // 공인중개사 정보 조회
      const agentResponse = await axios.get(
        `${BASE_URL}/${SEOUL_API_KEY}/json/LOCALDATA_072404/1/100/`,
        {
          params: {
            BJDONG_NM: address // 법정동명으로 검색
          }
        }
      );

      // 공인중개사 API 응답 데이터 상세 로깅
      console.log('=== Agent API Response ===');
      console.log('URL:', agentResponse.config.url);
      console.log('Params:', agentResponse.config.params);
      console.log('Status:', agentResponse.status);
      console.log('Data Structure:', Object.keys(agentResponse.data));
      if (agentResponse.data?.LOCALDATA_072404?.row) {
        console.log('First Row Sample:', JSON.stringify(agentResponse.data.LOCALDATA_072404.row[0], null, 2));
      }

      // 응답 데이터 변환
      let transactions: RealEstateTransaction[] = [];
      if (transactionResponse.data?.tbLnOpendataRtmsV?.row) {
        transactions = transactionResponse.data.tbLnOpendataRtmsV.row.map(
          (item: any) => {
            // 각 항목 변환 시 로깅
            console.log('Processing transaction item:', item);
            return {
              price: parseInt(String(item.SUM_AMT || '0').replace(/,/g, '')),
              area: parseFloat(item.BLDG_AREA || '0'),
              floor: parseInt(item.FLOOR_NO || '0'),
              date: item.DEAL_YMD || '',
              address: item.BJDONG_NM ? `${item.BJDONG_NM} ${item.BOBN || ''}${item.BUBN ? '-' + item.BUBN : ''}` : '',
              buildingName: item.BLDG_NM || ''
            };
          }
        );
      }

      let agents: RealEstateAgent[] = [];
      if (agentResponse.data?.LOCALDATA_072404?.row) {
        agents = agentResponse.data.LOCALDATA_072404.row.map(
          (item: any) => ({
            officeName: item.BPLCNM || '',
            address: item.RDNWHLADDR || '',
            tel: item.SITETEL || '',
            representative: item.RGTMBDNM || '',
            latitude: parseFloat(item.LAT || '0'),
            longitude: parseFloat(item.LNG || '0')
          })
        );
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