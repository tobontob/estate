import React from 'react';
import { SearchResult } from '../types';

interface SearchResultsProps {
  searchResult: SearchResult | null;
  isLoading: boolean;
  error: string | null;
}

const SearchResults: React.FC<SearchResultsProps> = ({ searchResult, isLoading, error }) => {
  if (isLoading) {
    return null; // 로딩 UI는 페이지 컴포넌트에서 처리
  }

  if (error) {
    return null; // 에러 UI는 페이지 컴포넌트에서 처리
  }

  if (!searchResult) {
    return null;
  }

  return (
    <div>
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">날짜</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">주소</th>
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
                <td className="px-6 py-4 text-gray-900">{transaction.address}</td>
                <td className="px-6 py-4 text-gray-900 font-medium">{transaction.buildingName || '-'}</td>
                <td className="px-6 py-4 text-gray-900">{transaction.area.toFixed(2)}</td>
                <td className="px-6 py-4 text-gray-900">{transaction.floor}</td>
                <td className="px-6 py-4 text-gray-900 font-medium">{transaction.price.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SearchResults; 