import React from 'react';
import { SearchResult } from '../types';

interface SearchResultsProps {
  results: SearchResult;
}

export default function SearchResults({ results }: SearchResultsProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  const formatDate = (dateStr: string) => {
    return `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`;
  };

  return (
    <div className="space-y-8">
      {/* 실거래가 정보 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold mb-4">실거래가 정보</h3>
        {results.transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">거래일</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">주소</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">건물명</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">면적(㎡)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">층</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">거래금액</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {results.transactions.map((transaction, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(transaction.date)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.address}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.buildingName || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.area.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.floor}층</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">{formatPrice(transaction.price)}만원</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">검색된 실거래가 정보가 없습니다.</p>
        )}
      </div>

      {/* 공인중개사 정보 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold mb-4">주변 공인중개사</h3>
        {results.nearbyAgents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.nearbyAgents.map((agent, index) => (
              <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <h4 className="font-medium text-lg mb-2">{agent.officeName}</h4>
                <p className="text-gray-600 text-sm mb-2">{agent.address}</p>
                {agent.tel && (
                  <p className="text-blue-600 text-sm">
                    <a href={`tel:${agent.tel}`} className="hover:underline">
                      {agent.tel}
                    </a>
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">검색된 공인중개사가 없습니다.</p>
        )}
      </div>
    </div>
  );
} 