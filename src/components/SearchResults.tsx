'use client';

import React, { useMemo } from 'react';
import { RealEstateTransaction } from '@/types';

interface SearchResultsProps {
  results: RealEstateTransaction[];
}

export default function SearchResults({ results = [] }: SearchResultsProps) {
  // 검색 결과가 없을 때
  if (!results || results.length === 0) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <div className="text-center text-gray-500 py-8">
          검색 결과가 없습니다
        </div>
      </div>
    );
  }

  // 검색 결과를 날짜순으로 정렬
  const sortedResults = useMemo(() => {
    return [...results].sort((a, b) => b.date.localeCompare(a.date));
  }, [results]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow">
        {sortedResults.map((item, index) => (
          <div
            key={`${item.address}-${item.date}-${index}`}
            className="p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-medium">
                  {item.buildingName || item.address}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {item.buildingName ? item.address : ''}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-blue-600">
                  {item.price.toLocaleString()}만원
                </p>
                <p className="text-sm text-gray-500">
                  {item.area}㎡ · {item.floor}층
                </p>
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-500">
              거래일: {item.date}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 