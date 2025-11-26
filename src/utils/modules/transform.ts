export const tryParseJSON = (data: string) => {
  if (typeof data === 'object') return data
  try {
    return JSON.parse(data)
  } catch {
    return null // 如果解析失败，返回 null
  }
}
