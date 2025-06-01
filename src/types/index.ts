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
  distance?: number;
  latitude?: number;
  longitude?: number;
}

export interface SearchResult {
  transactions: RealEstateTransaction[];
  nearbyAgents: RealEstateAgent[];
} 