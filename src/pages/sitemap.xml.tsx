// pages/sitemap.xml.tsx
import { GetServerSideProps } from "next"
import { getServerSideSitemap, ISitemapField } from "next-sitemap"
import { getPosts } from "../apis/notion-client/getPosts"
import { CONFIG } from "site.config"

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  try {
    const posts = await getPosts()

    const fields: ISitemapField[] = [
      {
        loc: CONFIG.link,
        lastmod: new Date().toISOString(),
        priority: 1.0,
        changefreq: "daily" as const,
      },
    ]

    // 포스트 추가
    posts.forEach((post) => {
      // 날짜 처리: date.start_date 우선, 없으면 createdTime 사용
      const postDate = post.date?.start_date || post.createdTime

      fields.push({
        loc: `${CONFIG.link}/${encodeURIComponent(post.slug)}`,
        lastmod: new Date(postDate).toISOString(),
        priority: 0.7,
        changefreq: "daily" as const,
      })
    })

    return getServerSideSitemap(ctx, fields)
  } catch (error) {
    console.error("Sitemap generation error:", error)
    return getServerSideSitemap(ctx, [
      {
        loc: CONFIG.link,
        lastmod: new Date().toISOString(),
        priority: 1.0,
        changefreq: "daily" as const,
      },
    ])
  }
}

export default function Sitemap() {
  return null
}
