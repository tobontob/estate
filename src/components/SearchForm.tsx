import React, { useState, useCallback } from 'react';
import { useDebounce } from 'use-debounce';
import axios from 'axios';
import { RealEstateTransaction } from '@/types';

interface SearchFormProps {
  onSearchResults: (results: RealEstateTransaction[]) => void;
}

export default function SearchForm({ onSearchResults }: SearchFormProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);

  const searchProperties = useCallback(async (address: string) => {
    if (!address.trim()) {
      onSearchResults([]);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    const startTime = Date.now();

    try {
      const response = await axios.get('/api/search', {
        params: { address },
        timeout: 15000
      });

      const endTime = Date.now();
      console.log(`검색 소요 시간: ${endTime - startTime}ms`);

      if (response.data.transactions.length === 0) {
        setError('검색 결과가 없습니다. 동이름을 정확히 입력해주세요.');
      }

      onSearchResults(response.data.transactions);
    } catch (err) {
      console.error('Search error:', err);
      
      if (axios.isAxiosError(err)) {
        if (err.code === 'ECONNABORTED') {
          setError('검색 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.');
        } else if (err.response?.status === 404) {
          setError('검색 결과가 없습니다. 동이름을 정확히 입력해주세요.');
        } else {
          setError('검색 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        }
      } else {
        setError('알 수 없는 오류가 발생했습니다.');
      }
      onSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [onSearchResults]);

  // 검색어가 변경될 때마다 API 호출
  React.useEffect(() => {
    if (debouncedSearchTerm) {
      searchProperties(debouncedSearchTerm);
    } else {
      onSearchResults([]);
      setError(null);
    }
  }, [debouncedSearchTerm, searchProperties]);

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="동이름을 입력하세요 (예: 하계동, 역삼동)"
          className="w-full px-4 py-2 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>
      
      {error && (
        <div className="mt-2 text-red-500 text-sm">
          {error}
        </div>
      )}
      
      <div className="mt-2 text-sm text-gray-500">
        * 동이름을 입력하면 자동으로 검색됩니다
      </div>
    </div>
  );
} 