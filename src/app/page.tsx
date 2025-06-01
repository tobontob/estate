'use client';

import { useState } from 'react';
import { SearchResult } from '../types';
import { realEstateApi } from '../services/api';
import SearchForm from '../components/SearchForm';
import SearchResults from '../components/SearchResults';

export default function Home() {
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (address: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const results = await realEstateApi.searchByAddress(address);
      setSearchResults(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : '검색 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSearchResults(null);
    setError(null);
  };

  return (
    <main className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            서울시 부동산 정보 서비스
          </h1>
          <p className="text-lg text-gray-600">
            실거래가 정보와 주변 공인중개사를 확인하세요
          </p>
        </div>

        <SearchForm onSearch={handleSearch} isLoading={isLoading} />

        {error && (
          <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {searchResults && (
          <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-gray-900">검색 결과</h2>
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
              >
                홈으로
              </button>
            </div>
            <SearchResults results={searchResults} />
          </div>
        )}
      </div>
    </main>
  );
}
