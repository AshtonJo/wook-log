import { getTextContent, getDateValue } from "notion-utils"
import { NotionAPI } from "notion-client"
import { BlockMap, CollectionPropertySchemaMap } from "notion-types"
import { customMapImageUrl } from "./customMapImageUrl"

async function getPageProperties(
  id: string,
  block: BlockMap,
  schema: CollectionPropertySchemaMap
) {
  const api = new NotionAPI()
  const rawProperties = Object.entries(
    (block?.[id] as any)?.value?.properties || []
  )
  const excludeProperties = ["date", "select", "multi_select", "person", "file"]
  const properties: any = {}
  for (let i = 0; i < rawProperties.length; i++) {
    const [key, val]: any = rawProperties[i]
    properties.id = id
    if (schema[key]?.type && !excludeProperties.includes(schema[key].type)) {
      properties[schema[key].name] = getTextContent(val)
    } else {
      switch (schema[key]?.type) {
        case "file": {
          try {
            const Block = (block?.[id] as any).value
            const url: string = val[0][1][0][1]
            const newurl = customMapImageUrl(url, Block)
            properties[schema[key].name] = newurl
          } catch (error) {
            properties[schema[key].name] = undefined
          }
          break
        }
        case "date": {
          const dateProperty: any = getDateValue(val)
          delete dateProperty.type
          properties[schema[key].name] = dateProperty
          break
        }
        case "select": {
          const selects = getTextContent(val)
          if (selects[0]?.length) {
            properties[schema[key].name] = selects.split(",")
          }
          break
        }
        case "multi_select": {
          const selects = getTextContent(val)
          if (selects[0]?.length) {
            properties[schema[key].name] = selects.split(",")
          }
          break
        }
        case "person": {
          const rawUsers = val.flat()

          const users = []
          for (let i = 0; i < rawUsers.length; i++) {
            if (rawUsers[i][0][1]) {
              const userId = rawUsers[i][0]
              const res: any = await api.getUsers(userId)

              // ⭐ notion-client@7.x 응답 구조 호환:
              //    구버전: notion_user[id].value
              //    신버전: notion_user[id].value.value
              const userRecord =
                res?.recordMapWithRoles?.notion_user?.[userId[1]]
              const resValue =
                userRecord?.value?.value || userRecord?.value

              const fullName =
                resValue?.name ||
                [resValue?.family_name, resValue?.given_name]
                  .filter(Boolean)
                  .join("") ||
                null

              const user = {
                id: resValue?.id || null,
                name: fullName,
                profile_photo: resValue?.profile_photo || null,
              }
              users.push(user)
            }
          }
          properties[schema[key].name] = users
          break
        }
        default:
          break
      }
    }
  }
  return properties
}

export { getPageProperties as default }
