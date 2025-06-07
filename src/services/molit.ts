import axios from 'axios';
import { MolitSearchResult } from '../types/molit';

// 서울시 구별 법정동코드 (앞 5자리)
const DISTRICT_CODES: { [key: string]: string } = {
  '강남구': '11680',
  '강동구': '11740',
  '강북구': '11305',
  '강서구': '11500',
  '관악구': '11620',
  '광진구': '11215',
  '구로구': '11530',
  '금천구': '11545',
  '노원구': '11350',
  '도봉구': '11320',
  '동대문구': '11230',
  '동작구': '11590',
  '마포구': '11440',
  '서대문구': '11410',
  '서초구': '11650',
  '성동구': '11200',
  '성북구': '11290',
  '송파구': '11710',
  '양천구': '11470',
  '영등포구': '11560',
  '용산구': '11170',
  '은평구': '11380',
  '종로구': '11110',
  '중구': '11140',
  '중랑구': '11260'
};

// 주소에서 구 이름 추출
export const extractDistrict = (address: string): string | null => {
  for (const district of Object.keys(DISTRICT_CODES)) {
    if (address.includes(district)) {
      return district;
    }
  }
  return null;
};

// 현재 년월을 YYYYMM 형식으로 반환하는 함수
export const getCurrentYearMonth = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}${month}`;
};

export const molitApi = {
  async searchByAddress(address: string): Promise<MolitSearchResult> {
    const district = extractDistrict(address);
    if (!district) {
      throw new Error('올바른 구 이름을 포함해 주세요. (예: 강남구, 서초구 등)');
    }

    const districtCode = DISTRICT_CODES[district];
    if (!districtCode) {
      throw new Error('지원되지 않는 구입니다.');
    }

    const yearMonth = getCurrentYearMonth();
    const url = 'http://openapi.molit.go.kr:8081/OpenAPI_ToolInstallPackage/service/rest/RTMSOBJSvc/getRTMSDataSvcAptTrade';

    try {
      const response = await axios.get(url, {
        params: {
          serviceKey: process.env.MOLIT_API_KEY,
          LAWD_CD: districtCode,
          DEAL_YMD: yearMonth,
          numOfRows: 100,
          pageNo: 1
        },
        headers: {
          'Accept': 'application/xml'
        },
        timeout: 10000
      });

      if (response.status !== 200) {
        throw new Error(`API 요청 실패: ${response.status}`);
      }

      // XML 응답을 파싱하고 데이터 변환
      // TODO: XML 파싱 및 데이터 변환 로직 구현

      return {
        transactions: [],
        totalCount: 0,
        pageNo: 1,
        numOfRows: 100
      };
    } catch (error) {
      console.error('Error:', error);
      throw new Error('검색 중 오류가 발생했습니다.');
    }
  }
}; 