/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/seoul/:path*',
        destination: `http://openapi.seoul.go.kr:8088/${process.env.NEXT_PUBLIC_SEOUL_API_KEY}/json/:path*`
      }
    ]
  },
  // Vercel 배포를 위한 추가 설정
  output: 'standalone',
  // 빌드 시 추가 설정
  poweredByHeader: false,
  generateEtags: true,
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
          { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" },
        ]
      }
    ]
  }
}

module.exports = nextConfig