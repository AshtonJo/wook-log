import { NotionAPI } from "notion-client"

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

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * 전역 직렬 큐: 동시에 여러 페이지가 빌드되어도 노션 API 호출은 한 번에 하나씩만
 */
let requestQueue: Promise<any> = Promise.resolve()

const enqueue = <T>(fn: () => Promise<T>): Promise<T> => {
  const next = requestQueue.then(fn, fn)
  // 이전 요청 실패해도 다음은 계속 진행
  requestQueue = next.catch(() => undefined)
  return next
}

/**
 * Rate Limit 발생 시 자동 재시도 (지수 백오프 + 큰 jitter)
 */
const fetchWithRetry = async <T>(
  fn: () => Promise<T>,
  retries = 5,
  baseDelay = 5000
): Promise<T> => {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await fn()
    } catch (error: any) {
      const isRateLimit =
        error?.response?.status === 429 ||
        error?.statusCode === 429 ||
        String(error?.message || "").includes("429")

      if (isRateLimit && attempt < retries - 1) {
        const jitter = Math.floor(Math.random() * 3000)
        const delay = baseDelay * Math.pow(2, attempt) + jitter
        console.log(
          `⏳ [getRecordMap] 429. Wait ${(delay / 1000).toFixed(
            1
          )}s... (${attempt + 1}/${retries})`
        )
        await sleep(delay)
        continue
      }
      throw error
    }
  }
  throw new Error("fetchWithRetry: exhausted")
}

export const getRecordMap = async (pageId: string) => {
  const api = new NotionAPI()

  // ⭐ 직렬 큐 + 호출 사이 1초 딜레이 + 자동 재시도
  return enqueue(async () => {
    await sleep(1000)
    let recordMap = await fetchWithRetry(() => api.getPage(pageId))
    recordMap = normalizeRecordMap(recordMap)
    return recordMap
  })
}
