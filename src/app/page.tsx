'use client';

import { useState } from 'react';
import SearchForm from '@/components/SearchForm';
import SearchResults from '@/components/SearchResults';
import { RealEstateTransaction } from '@/types';

export default function Home() {
  const [searchResults, setSearchResults] = useState<RealEstateTransaction[]>([]);

  return (
    <main className="min-h-screen bg-[#F8F9FF]">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">
          서울시 부동산 실거래가 검색
        </h1>
        
        <SearchForm onSearchResults={setSearchResults} />
        
        <div className="mt-8">
          <SearchResults results={searchResults} />
        </div>
      </div>
    </main>
  );
}
