// 실거래가 API 응답 타입
export interface RealEstateTransactionApiResponse {
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

// 공인중개사 API 응답 타입
export interface RealEstateAgentApiResponse {
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

export interface RealEstateTransaction {
  price: number;
  area: number;
  floor: number;
  date: string;
  address: string;
  buildingName: string;
}

export interface RealEstateAgent {
  officeName: string;
  address: string;
  tel: string;
  representative: string;
  latitude: number;
  longitude: number;
}

export interface SearchResult {
  transactions: RealEstateTransaction[];
  nearbyAgents: RealEstateAgent[];
} 