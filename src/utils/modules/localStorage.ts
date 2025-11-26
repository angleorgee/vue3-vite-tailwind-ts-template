import { tryParseJSON } from "../index"

export const getStorageItem = (key: string): Recordable | undefined => {
  const value = localStorage.getItem(key);
  if (!value) return undefined;

  try {
    // 尝试解析为JSON对象，解析成功则返回对象
    const parsed = tryParseJSON(value);
    return parsed !== null ? parsed : undefined; // 解析失败则返回原始字符串
  } catch (error) {
    console.error(error);
    return undefined; // 出错时返回原始字符串
  }
};