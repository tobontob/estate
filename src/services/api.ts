import axios from 'axios';
import { RealEstateTransaction, RealEstateAgent, SearchResult } from '../types';

const SEOUL_API_KEY = process.env.NEXT_PUBLIC_SEOUL_API_KEY;
const BASE_URL = 'http://openapi.seoul.go.kr:8088';

export const realEstateApi = {
  async searchByAddress(address: string): Promise<SearchResult> {
    try {
      // 실거래가 정보 조회
      const transactionResponse = await axios.get(
        `${BASE_URL}/${SEOUL_API_KEY}/json/tbLnOpendataRtmsV/1/20/${encodeURIComponent(address)}`
      );

      // 공인중개사 정보 조회
      const agentResponse = await axios.get(
        `${BASE_URL}/${SEOUL_API_KEY}/json/LOCALDATA_072404/1/20/${encodeURIComponent(address)}`
      );

      console.log('Transaction Response:', transactionResponse.data);
      console.log('Agent Response:', agentResponse.data);

      // 응답 데이터 변환
      let transactions: RealEstateTransaction[] = [];
      if (transactionResponse.data?.tbLnOpendataRtmsV?.row) {
        transactions = transactionResponse.data.tbLnOpendataRtmsV.row.map(
          (item: any) => ({
            price: parseInt(String(item.DEAL_AMOUNT).replace(/,/g, '')) || 0,
            area: parseFloat(item.BLDG_AREA) || 0,
            floor: parseInt(item.FLOOR) || 0,
            date: `${item.DEAL_YEAR || ''}-${item.DEAL_MONTH || ''}-${item.DEAL_DAY || ''}`,
            address: item.BLDG_ADDR || '',
            buildingName: item.BLDG_NM || ''
          })
        );
      }

      let agents: RealEstateAgent[] = [];
      if (agentResponse.data?.LOCALDATA_072404?.row) {
        agents = agentResponse.data.LOCALDATA_072404.row.map(
          (item: any) => ({
            officeName: item.BPLCNM || '',
            address: item.RDNWHLADDR || '',
            tel: item.SITETEL || '',
            representative: item.BPLCNM || '',
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
      }
      throw new Error('데이터를 불러오는 중 오류가 발생했습니다. 검색어를 확인해주세요.');
    }
  }
}; 