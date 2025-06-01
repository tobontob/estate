'use client';

import { useState } from 'react';
import { SearchResult } from '../types';
import { realEstateApi } from '../services/api';
import SearchResults from '../components/SearchResults';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setError(null);
    setSearchResult(null);

    try {
      const result = await realEstateApi.searchByAddress(searchQuery);
      setSearchResult(result);
    } catch (err) {
      setError('검색 중 오류가 발생했습니다. 다시 시도해주세요.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <main className="min-h-screen bg-[#F8F9FF]">
      <div className="max-w-4xl mx-auto px-4">
        {(!searchResult && !isLoading) && (
          <div className="h-screen flex flex-col items-center justify-center">
            <h1 className="text-3xl font-bold mb-2 text-gray-900">서울시 부동산실거래가</h1>
            <h2 className="text-4xl font-bold text-[#4338CA] mb-8">검색하기</h2>
            <div className="w-full max-w-2xl relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="지역명을 입력하세요 (예: 하계동)"
                className="w-full p-4 pr-12 text-lg border rounded-full bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#4338CA] focus:border-transparent text-gray-900"
              />
              <button
                onClick={handleSearch}
                disabled={isLoading}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-[#4338CA] text-white hover:bg-[#3730A3] disabled:bg-gray-400 flex items-center justify-center"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </button>
            </div>
            {error && <p className="text-red-600 mt-4 font-medium">{error}</p>}
          </div>
        )}

        {isLoading && (
          <div className="h-screen flex flex-col items-center justify-center">
            <div className="mb-8">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#4338CA]"></div>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900">검색중입니다...</h2>
            <p className="text-gray-600 mt-2">잠시만 기다려주세요</p>
          </div>
        )}

        {searchResult && !isLoading && (
          <div className="py-8 space-y-8">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-2xl font-bold text-gray-900">서울 부동산 실거래가 검색</h1>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="지역명을 입력하세요"
                  className="p-2 border rounded-lg text-gray-900"
                />
                <button
                  onClick={handleSearch}
                  disabled={isLoading}
                  className="px-4 py-2 bg-[#4338CA] text-white rounded-lg hover:bg-[#3730A3] disabled:bg-gray-400 flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>검색 중...</span>
                    </>
                  ) : (
                    '검색'
                  )}
                </button>
              </div>
            </div>

            <SearchResults
              searchResult={searchResult}
              isLoading={isLoading}
              error={error}
            />
          </div>
        )}
      </div>
    </main>
  );
}
