import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '서울시 부동산실거래가 검색',
  description: '서울시 부동산 실거래가 정보와 주변 공인중개사 정보를 검색할 수 있습니다.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
