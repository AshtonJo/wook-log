import { CONFIG } from "site.config"
import { NotionAPI } from "notion-client"
import { idToUuid } from "notion-utils"

import getAllPageIds from "src/libs/utils/notion/getAllPageIds"
import getPageProperties from "src/libs/utils/notion/getPageProperties"
import { TPosts } from "src/types"

/**
 * notion-client@7.x 응답 구조 정규화
 * 신버전: block[id].value.value 형태로 중첩됨 → block[id].value로 평탄화
 */
const normalizeRecordMap = (response: any) => {
  const normalize = (record: any) => {
    if (!record) return record
    Object.keys(record).forEach((id) => {
      const entry = record[id]
      if (entry?.value?.value && typeof entry.value.value === "object") {
        entry.value = entry.value.value
      }
    })
    return record
  }

  if (response.block) normalize(response.block)
  if (response.collection) normalize(response.collection)
  if (response.collection_view) normalize(response.collection_view)
  if (response.notion_user) normalize(response.notion_user)

  return response
}

/**
 * Next.js getStaticProps는 undefined를 JSON 직렬화할 수 없음
 * → 모든 undefined를 null로 치환 (재귀)
 */
const sanitizeForSerialization = (obj: any): any => {
  if (obj === undefined) return null
  if (obj === null) return null
  if (Array.isArray(obj)) {
    return obj.map(sanitizeForSerialization)
  }
  if (typeof obj === "object") {
    const result: any = {}
    Object.keys(obj).forEach((key) => {
      const val = sanitizeForSerialization(obj[key])
      if (val !== undefined) {
        result[key] = val
      }
    })
    return result
  }
  return obj
}

export const getPosts = async () => {
  let id = CONFIG.notionConfig.pageId as string
  const api = new NotionAPI()
  let response = await api.getPage(id)

  response = normalizeRecordMap(response)

  id = idToUuid(id)

  const collection = Object.values(response.collection)[0]?.value as any
  const block = response.block
  const schema = collection?.schema

  let rawMetadata = (block[id] as any)?.value

  if (!rawMetadata) {
    const found = Object.entries(block).find(
      ([_, b]: [string, any]) =>
        b?.value?.type === "collection_view_page" ||
        b?.value?.type === "collection_view"
    )
    if (found) {
      id = found[0]
      rawMetadata = (found[1] as any).value
    }
  }

  if (
    rawMetadata?.type !== "collection_view_page" &&
    rawMetadata?.type !== "collection_view"
  ) {
    return []
  }

  const pageIds = getAllPageIds(response)

  const tempBlockResponse = await api.getBlocks(pageIds)
  let tempBlock = tempBlockResponse.recordMap.block
  tempBlock = normalizeRecordMap({ block: tempBlock }).block

  const data = []
  for (let i = 0; i < pageIds.length; i++) {
    const pid = pageIds[i]
    const properties = (await getPageProperties(pid, tempBlock, schema)) || null
    if (!tempBlock[pid]) continue

    properties.createdTime = new Date(
      (tempBlock[pid] as any).value?.created_time
    ).toString()
    properties.fullWidth =
      ((tempBlock[pid] as any).value?.format as any)?.page_full_width ?? false

    data.push(properties)
  }

  data.sort((a: any, b: any) => {
    const dateA: any = new Date(a?.date?.start_date || a.createdTime)
    const dateB: any = new Date(b?.date?.start_date || b.createdTime)
    return dateB - dateA
  })

  // ⭐ undefined → null 치환 (Next.js getStaticProps 직렬화 호환)
  const posts = sanitizeForSerialization(data) as TPosts
  console.log("✅ [getPosts] returning", posts.length, "posts")
  return posts
}
