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

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">서울 부동산 실거래가 검색</h1>
        
        {/* 검색 섹션 */}
        <div className="mb-8">
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="주소나 건물명을 입력하세요"
              className="flex-1 p-2 border rounded"
            />
            <button
              onClick={handleSearch}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
            >
              {isLoading ? '검색 중...' : '검색'}
            </button>
          </div>
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>

        {/* 검색 결과 */}
        {searchResult && (
          <div className="space-y-8">
            {/* 실거래가 정보 */}
            <div>
              <h2 className="text-2xl font-semibold mb-4">실거래가 정보</h2>
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">날짜</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">건물명</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">면적(㎡)</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">층</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">가격(만원)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {searchResult.transactions.map((transaction, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4">{transaction.date}</td>
                        <td className="px-6 py-4">{transaction.buildingName}</td>
                        <td className="px-6 py-4">{transaction.area}</td>
                        <td className="px-6 py-4">{transaction.floor}</td>
                        <td className="px-6 py-4">{transaction.price.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 공인중개사 정보 */}
            <div>
              <h2 className="text-2xl font-semibold mb-4">주변 공인중개사</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {searchResult.nearbyAgents.map((agent, index) => (
                  <div key={index} className="bg-white shadow rounded-lg p-6">
                    <h3 className="font-semibold text-lg mb-2">{agent.officeName}</h3>
                    <p className="text-gray-600 mb-1">{agent.address}</p>
                    <p className="text-gray-600 mb-1">대표: {agent.representative}</p>
                    <p className="text-gray-600">연락처: {agent.tel}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
