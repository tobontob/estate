'use client';

import { useState } from 'react';
import { realEstateApi } from '../services/api';
import { SearchResult } from '../types';

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

            {/* 실거래가 정보 */}
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-900">실거래가 정보</h2>
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <table className="min-w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">날짜</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">건물명</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">면적(㎡)</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">층</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">가격(만원)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {searchResult.transactions.map((transaction, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-gray-900">{transaction.date}</td>
                        <td className="px-6 py-4 text-gray-900 font-medium">{transaction.buildingName}</td>
                        <td className="px-6 py-4 text-gray-900">{transaction.area}</td>
                        <td className="px-6 py-4 text-gray-900">{transaction.floor}</td>
                        <td className="px-6 py-4 text-gray-900 font-medium">{transaction.price.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 공인중개사 정보 */}
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-900">주변 공인중개사</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {searchResult.nearbyAgents.map((agent, index) => (
                  <div key={index} className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow">
                    <h3 className="font-semibold text-lg mb-2 text-gray-900">{agent.officeName}</h3>
                    <p className="text-gray-700 mb-1">{agent.address}</p>
                    <p className="text-gray-700 mb-1">대표: {agent.representative}</p>
                    <p className="text-gray-700">연락처: {agent.tel}</p>
                  </div>
                ))}
                {searchResult.nearbyAgents.length === 0 && (
                  <p className="text-gray-700">주변 공인중개사 정보가 없습니다.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
