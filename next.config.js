/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/seoul/:path*',
        destination: 'http://openapi.seoul.go.kr:8088/:path*',
      },
    ];
  },
  // Vercel 배포를 위한 추가 설정
  output: 'standalone',
  // 빌드 시 추가 설정
  poweredByHeader: false,
  generateEtags: true,
}

module.exports = nextConfig