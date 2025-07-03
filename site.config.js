const CONFIG = {
  // profile setting (required)
  // 적용 사항 변경후 vercel 배포 로그 가서 확인
  profile: {
    name: "조욱희",
    image: "/me.png", // If you want to create your own notion avatar, check out https://notion-avatar.vercel.app
    role: "프론트엔드 개발자",
    bio: "Working at Soulphos Co.",
    email: "hee576@nate.com",
    linkedin: "wookheejo",
    github: "ashtonjo",
    instagram: "0xff8c00",
  },
  projects: [
    {
      name: `ashtonjo`,
      href: "https://github.com/AshtonJo/",
    },
  ],
  // blog setting (required)
  blog: {
    title: "wook-log",
    description: "welcome to wooklog!",
    scheme: "system", // 'light' | 'dark' | 'system'
  },

  // CONFIG configration (required)
  link: "https://wooklog.vercel.app",
  since: 2024, // If leave this empty, current year will be used.
  lang: "ko-KR", // ['en-US', 'zh-CN', 'zh-HK', 'zh-TW', 'ja-JP', 'es-ES', 'ko-KR']
  ogImageGenerateURL: "https://og-image-korean.vercel.app", // The link to generate OG image, don't end with a slash

  // notion configuration (required)
  notionConfig: {
    pageId: process.env.NOTION_PAGE_ID,
  },

  // plugin configuration (optional)
  googleAnalytics: {
    enable: true,
    config: {
      measurementId: process.env.NEXT_PUBLIC_GOOGLE_MEASUREMENT_ID || "",
    },
  },
  googleSearchConsole: {
    enable: true,
    config: {
      siteVerification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "",
    },
  },
  naverSearchAdvisor: {
    enable: true,
    config: {
      siteVerification: process.env.NEXT_PUBLIC_NAVER_SITE_VERIFICATION || "",
    },
  },
  utterances: {
    enable: true,
    config: {
      repo: process.env.NEXT_PUBLIC_UTTERANCES_REPO || "",
      "issue-term": "og:title",
      label: "💬 Utterances",
    },
  },
  cusdis: {
    enable: true,
    config: {
      host: "https://cusdis.com",
      appid: "71effe85-d862-4525-b882-07333e1f74c8", // Embed Code -> data-app-id value
    },
  },
  isProd: process.env.VERCEL_ENV === "production", // distinguish between development and production environment (ref: https://vercel.com/docs/environment-variables#system-environment-variables)
  revalidateTime: 7, // revalidate time for [slug], index
}

module.exports = { CONFIG }
