import { TPosts, TPostStatus, TPostType } from "src/types"

export type FilterPostsOptions = {
  acceptStatus?: TPostStatus[]
  acceptType?: TPostType[]
}

const initialOption: FilterPostsOptions = {
  acceptStatus: ["Public"],
  acceptType: ["Post"],
}
const current = new Date()
const tomorrow = new Date(current)
tomorrow.setDate(tomorrow.getDate() + 1)
tomorrow.setHours(0, 0, 0, 0)

export function filterPosts(
  posts: TPosts,
  options: FilterPostsOptions = initialOption
) {
  const { acceptStatus = ["Public"], acceptType = ["Post"] } = options
  const filteredPosts = posts
    // filter data
    .filter((post) => {
      const postDate = new Date(post?.date?.start_date || post.createdTime)
      if (!post.title || !post.slug || postDate > tomorrow) return false
      return true
    })
    // filter status - 안전한 접근 방식
    .filter((post) => {
      // Option 1: Optional chaining
      const postStatus = post.status?.[0]
      if (!postStatus) return false
      return acceptStatus.includes(postStatus)

      // Option 2: 기본값 설정
      // const postStatus = post.status?.[0] || "Private"
      // return acceptStatus.includes(postStatus)
    })
    // filter type - 동일한 방어 코드 적용
    .filter((post) => {
      const postType = post.type?.[0]
      if (!postType) return false
      return acceptType.includes(postType)
    })
  return filteredPosts
}
