import React from 'react';
import { SearchResult } from '../types';

interface SearchResultsProps {
  searchResult: SearchResult | null;
  isLoading: boolean;
  error: string | null;
}

const SearchResults: React.FC<SearchResultsProps> = ({ searchResult, isLoading, error }) => {
  if (isLoading) {
    return <div className="text-center py-4">검색 중...</div>;
  }

  if (error) {
    return <div className="text-red-500 py-4">{error}</div>;
  }

  if (!searchResult) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-4">실거래가 정보</h2>
        {searchResult.transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 border-b">거래일자</th>
                  <th className="px-4 py-2 border-b">주소</th>
                  <th className="px-4 py-2 border-b">건물명</th>
                  <th className="px-4 py-2 border-b">면적(㎡)</th>
                  <th className="px-4 py-2 border-b">층</th>
                  <th className="px-4 py-2 border-b">거래금액</th>
                </tr>
              </thead>
              <tbody>
                {searchResult.transactions.map((transaction, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-2 border-b text-center">{transaction.date}</td>
                    <td className="px-4 py-2 border-b">{transaction.address}</td>
                    <td className="px-4 py-2 border-b">{transaction.buildingName || '-'}</td>
                    <td className="px-4 py-2 border-b text-right">{transaction.area.toFixed(2)}</td>
                    <td className="px-4 py-2 border-b text-center">{transaction.floor}</td>
                    <td className="px-4 py-2 border-b text-right">
                      {transaction.price.toLocaleString()}만원
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">검색된 실거래가 정보가 없습니다.</p>
        )}
      </div>
    </div>
  );
};

export default SearchResults; 