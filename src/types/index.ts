// API 응답 데이터 타입
export interface AptTradeItem {
  거래금액: string;    // 거래금액(만원)
  건축년도: string;   // 건축년도
  년: string;        // 계약년도
  월: string;        // 계약월
  일: string;        // 계약일
  전용면적: string;   // 전용면적
  층: string;        // 층
  법정동: string;    // 법정동
  지번: string;      // 지번
  아파트: string;    // 단지명
  거래유형?: string; // 거래유형(중개/직거래)
  동?: string;      // 아파트 동
}

// API 응답 형식
export interface ApiResponse {
  response: {
    header: {
      resultCode: string;
      resultMsg: string;
    };
    body: {
      items: {
        item: AptTradeItem[];
      };
      totalCount: string;
      numOfRows: string;
      pageNo: string;
    };
  };
}

// 검색 결과 타입
export interface RealEstateTransaction {
  price: number;          // 거래금액(원)
  buildYear?: number;     // 건축년도
  date: string;          // 계약일자 (YYYYMMDD)
  area: number;          // 전용면적
  floor: number;         // 층
  address: string;       // 주소
  buildingName: string;  // 건물명
  dealType?: string;     // 거래유형
  dong?: string;         // 동
}

export interface RealEstateAgent {
  officeName: string;
  address: string;
  tel: string;
  representative: string;
  distance?: number;
  latitude?: number;
  longitude?: number;
}

export interface SearchResult {
  transactions: RealEstateTransaction[];
  nearbyAgents?: RealEstateAgent[];
  message?: string;
  totalCount: number;
  pageNo: number;
  numOfRows: number;
} 