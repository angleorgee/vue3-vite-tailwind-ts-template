export const tryParseJSON = (data: string) => {
  if (typeof data === 'object') return data
  try {
    return JSON.parse(data)
  } catch {
    return null
  }
}
export function formatBytes(
  bytes: number,
  startUnit: 'B' | 'KB' | 'MB' | 'GB' | 'TB' | 'PB' | 'EB' | 'ZB' | 'YB' = 'KB',
  decimals: number | 'auto' = 'auto',
): string {
  if (!Number.isFinite(bytes) || bytes < 0) {
    return '0 B';
  }
  if (bytes === 0) {
    return '0 B';
  }
  const k = 1024;
  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'] as const;
  const startIndex = units.indexOf(startUnit);
  const actualBytes = bytes * Math.pow(k, startIndex);
  const i = Math.min(
    Math.floor(Math.log(actualBytes) / Math.log(k)),
    units.length - 1
  );
  const precision = decimals === 'auto'
    ? (i === 0 ? 0 : actualBytes < k ? 2 : 1)
    : Math.max(0, decimals);
  const value = (actualBytes / Math.pow(k, i)).toFixed(precision);
  const formattedValue = parseFloat(value).toString();
  return `${formattedValue} ${units[i]}`;
}
