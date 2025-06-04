import { useState } from 'react';
import Head from 'next/head';
import SearchForm from '@/components/SearchForm';
import SearchResults from '@/components/SearchResults';
import { RealEstateTransaction } from '@/types';

export default function Home() {
  const [searchResults, setSearchResults] = useState<RealEstateTransaction[]>([]);

  return (
    <>
      <Head>
        <title>서울시 부동산 실거래가 검색</title>
        <meta name="description" content="서울시 부동산 실거래가와 공인중개사 정보를 검색할 수 있는 서비스입니다." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto py-8">
          <h1 className="text-3xl font-bold text-center mb-8">
            서울시 부동산 실거래가 검색
          </h1>
          
          <SearchForm onSearchResults={setSearchResults} />
          
          <div className="mt-8">
            <SearchResults results={searchResults} />
          </div>
        </div>
      </main>
    </>
  );
} 