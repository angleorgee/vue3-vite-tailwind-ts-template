declare type Recordable<T = any> = Record<string, T>;
declare type DetailResponse<T> = {
  status_code: number
  mes: string
  body: T
}