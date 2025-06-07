import axios from 'axios';
import { SearchResult, RealEstateTransaction } from '@/types';
import { mockAptTradeResponse } from '@/mocks/aptTrade';

// API 응답 데이터 타입 정의
interface AptTradeItem {
  dealAmount: string;    // 거래금액(만원)
  excluUseAr: string;   // 전용면적
  floor: string;        // 층
  dealYear: string;     // 계약년도
  dealMonth: string;    // 계약월
  dealDay: string;      // 계약일
  umdNm: string;        // 법정동
  jibun: string;        // 지번
  aptNm: string;        // 단지명
  buildYear?: string;   // 건축년도
  dealingGbn?: string;  // 거래유형(중개/직거래)
  aptDong?: string;     // 아파트 동명
}

interface ApiResponse {
  response: {
    header: {
      resultCode: string;
      resultMsg: string;
    };
    body: {
      items: {
        item: AptTradeItem | AptTradeItem[];
      };
      totalCount: number;
      numOfRows: number;
      pageNo: number;
    };
  };
}

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

// 구별 대표적인 동 목록 (예시)
const DISTRICT_DONGS: { [key: string]: string[] } = {
  '강남구': ['역삼동', '삼성동', '청담동', '논현동', '대치동', '신사동', '압구정동', '세곡동', '일원동', '수서동'],
  '노원구': ['상계동', '중계동', '하계동', '월계동', '공릉동'],
  '서초구': ['서초동', '반포동', '방배동', '양재동', '내곡동'],
  '송파구': ['잠실동', '석촌동', '송파동', '방이동', '오금동', '풍납동', '가락동'],
  // ... 다른 구의 동 목록도 추가 가능
};

// 주소에서 구 이름과 동 이름 추출
const extractLocation = (address: string): { district: string | null; dong: string | null } => {
  // 구 이름 찾기
  let foundDistrict: string | null = null;
  let foundDong: string | null = null;

  // 구 검색
  for (const district of Object.keys(DISTRICT_CODES)) {
    if (address.includes(district)) {
      foundDistrict = district;
      break;
    }
  }

  // 동 검색 및 매칭되는 구 찾기
  if (!foundDistrict) {
    for (const [district, dongs] of Object.entries(DISTRICT_DONGS)) {
      for (const dong of dongs) {
        if (address.includes(dong)) {
          foundDistrict = district;
          foundDong = dong;
          break;
        }
      }
      if (foundDistrict) break;
    }
  }

  return { district: foundDistrict, dong: foundDong };
};

// 현재 년월을 YYYYMM 형식으로 반환
const getCurrentYearMonth = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}${month}`;
};

// 개발 환경인지 확인
const isDevelopment = process.env.NODE_ENV === 'development';

export const realEstateApi = {
  async searchByAddress(address: string): Promise<SearchResult> {
    try {
      const { district, dong } = extractLocation(address);
      
      if (!district) {
        throw new Error('올바른 구 이름이나 동 이름을 포함해 주세요. (예: 강남구, 역삼동 등)');
      }

      const districtCode = DISTRICT_CODES[district];
      if (!districtCode) {
        throw new Error('지원되지 않는 지역입니다.');
      }

      let transactions: RealEstateTransaction[];

      if (isDevelopment) {
        // 개발 환경: 모킹 데이터 사용
        console.log('개발 환경: 모킹 데이터 사용');
        transactions = mockAptTradeResponse.response.body.items.item.map(item => ({
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
      } else {
        // 프로덕션 환경: 실제 API 호출
        console.log('프로덕션 환경: 실제 API 호출');
        const yearMonth = getCurrentYearMonth();
        const response = await axios.get('/api/search', {
          params: { 
            districtCode,
            yearMonth
          },
          timeout: 10000
        });
        transactions = response.data.transactions;
      }

      // 동 이름으로 필터링
      if (dong) {
        transactions = transactions.filter((t: RealEstateTransaction) => t.address.includes(dong));
      }

      return { transactions };
    } catch (error) {
      console.error('Error:', error);
      throw error instanceof Error ? error : new Error('검색 중 오류가 발생했습니다.');
    }
  }
}; 