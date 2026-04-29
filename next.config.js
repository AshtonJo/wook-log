module.exports = {
  images: {
    domains: ['www.notion.so', 'lh5.googleusercontent.com', 's3-us-west-2.amazonaws.com'],
  },
  // ⭐ 빌드 시 페이지 생성 워커 수를 1로 제한 (노션 Rate Limit 회피)
  experimental: {
    workerThreads: false,
    cpus: 1,
  },
}
