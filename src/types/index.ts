export interface RealEstateTransaction {
  price: number;
  area: number;
  floor: number;
  date: string;
  address: string;
  buildingName: string;
}

export interface SearchResult {
  transactions: RealEstateTransaction[];
} 