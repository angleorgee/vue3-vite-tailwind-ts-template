/**
 * request 网络请求工具
 * https://github.com/umijs/umi-request
 */
import {
  extend,
  type RequestOptionsInit,
  type ResponseError,
  type RequestInterceptor,
  type OnionMiddleware,
  type Context
} from 'umi-request'
import { useUserStore } from '@/store'
import { toast } from 'vue-sonner'

// --------------------------- 类型定义 ---------------------------

type HttpError = ResponseError & {
  config?: RequestOptionsInit & RetryOptions
  options?: RequestOptionsInit
}

interface RetryOptions {
  retry?: number
  retryDelay?: number
}

declare module 'umi-request' {
  interface RequestOptionsInit {
    retry?: number
    retryDelay?: number
  }
}

// --------------------------- 错误码定义 ---------------------------

const codeMessage: Record<number, string> = {
  200: '服务器成功返回请求的数据。',
  201: '新建或修改数据成功。',
  202: '一个请求已经进入后台排队（异步任务）。',
  204: '删除数据成功。',
  400: '发出的请求有错误。',
  401: '用户没有权限（令牌、用户名、密码错误)。',
  403: '用户得到授权，但是访问被禁止。',
  404: '请求记录不存在。',
  406: '请求的格式不可得。',
  410: '请求的资源被永久删除。',
  422: '验证错误。',
  500: '服务器发生错误。',
  502: '网关错误。',
  503: '服务不可用。',
  504: '网关超时。',
}

// --------------------------- 通用错误处理 ---------------------------

const errorHandler = (error: HttpError) => {

  const response = error.response
  const { url } = error.config || {}

  const pureUrl = url
    ? url.replace(import.meta.env.VITE_PREFIX_URL || '', '')
    : '未知接口'

  if (!response) {
    toast.error(`请求失败：网络波动,请刷新重试`)
    return Promise.reject(new Error(`接口 [${pureUrl}] 网络波动,请刷新重试`))
  }

  const { status, statusText } = response
  const errorText = statusText ?? codeMessage[status]
  const data = error.options?.data || error?.options?.params
  if (!data || !data.noMes) {
    toast.error(`${status}：${errorText}`)
  }
  return Promise.reject(new Error(`接口 [${pureUrl}] 错误 ${status}：${errorText}`))
}

// --------------------------- 初始化客户端 ---------------------------

const client = extend({
  errorHandler,
  prefix: import.meta.env.VITE_PREFIX_URL,
  timeout: 60000,
  retry: 2,
  retryDelay: 1000,
})

// --------------------------- 请求拦截器 ---------------------------

const requestInterceptor: RequestInterceptor = (url, options) => {
  const userStore = useUserStore()

  // headers 必须是 Record<string, string>
  const headers: Record<string, string> = {}
  if (userStore.token) {
    headers['Authorization'] = `Bearer ${userStore.token}`
  }

  const retryConfig = {
    retry: options.retry ?? 2,
    retryDelay: options.retryDelay ?? 1500,
  }

  return {
    url,
    options: {
      ...options,
      headers: {
        ...(options.headers as Record<string, string>),
        ...headers,
      },
      ...retryConfig,
    },
  }
}

client.interceptors.request.use(requestInterceptor, { global: false })

// --------------------------- Token 刷新逻辑 ---------------------------

let isRefreshing = false
let isLoggingOut = false
type RequestQueueItem = () => Promise<Response>
let requests: RequestQueueItem[] = []

async function handle4xxError(
  options: RequestOptionsInit,
): Promise<Response> {
  const userStore = useUserStore()

  // 如果正在刷新，加入队列等待
  if (isRefreshing) {
    return new Promise<Response>((resolve, reject) => {
      requests.push(async () => {
        try {
          const res = await client(options.url as string, options)
          resolve(res)
          return res
        } catch (err) {
          reject(err)
          throw err
        }
      })
    })
  }

  isRefreshing = true
  try {
    await userStore.refreshTokenActions()
    // 执行队列中等待的请求
    await Promise.all(requests.map(cb => cb()))
    requests = []

    // 重试当前请求
    return client(options.url as string, { ...options, retry: 2 })
  } catch (err) {
    userStore.loginOut()
    toast.error('登录已过期，请重新登录')
    throw new Error('刷新token失败')
  } finally {
    isRefreshing = false
    isLoggingOut = false
  }
}

// --------------------------- 重试中间件 ---------------------------
const retryMiddleware: OnionMiddleware = async (ctx, next) => {
  await next()

  const { req, res, error } = ctx
  const { options } = req
  const retry = options.retry ?? 2
  const retryDelay = options.retryDelay ?? 1000
  // ✅ 如果请求成功或响应正常，直接返回，不重试
  if (!error || res) return

  // ✅ 避免401/402的token逻辑
  if (error && retry > 0 && !is4xxAuthError(error)) {
    req.options.retry = retry - 1
    await new Promise(resolve => setTimeout(resolve, retryDelay))

    // ⚠️ 注意这里不能再次触发 prefix 自动拼接
    const newUrl = req.url.startsWith(import.meta.env.VITE_PREFIX_URL)
      ? req.url.replace(import.meta.env.VITE_PREFIX_URL, '')
      : req.url

    const newResponse = await client(newUrl, req.options)
    ctx.res = newResponse
    ctx.error = undefined
  }
}


const is4xxAuthError = (error: HttpError): boolean => {
  return error.response?.status === 401 || error.response?.status === 402
}

// --------------------------- 业务逻辑中间件 ---------------------------

const businessMiddleware: OnionMiddleware = async (ctx, next) => {
  await next()

  const { req, res, error } = ctx
  const { options } = req
  if (!res) return

  // ✅ 兼容：有些中间件返回的 res 不是 Response 实例
  const hasHeaders = typeof res.headers?.get === 'function'
  const contentType = hasHeaders ? res.headers.get('content-type') || '' : ''

  const isBinaryResponse =
    contentType.includes('image') ||
    contentType.includes('application/octet-stream') ||
    contentType.includes('pdf') ||
    options.responseType === 'blob' ||
    options.responseType === 'arrayBuffer'

  if (isBinaryResponse) {
    return
  }

  // 🎯 普通 JSON 响应逻辑
  if (!error && res) {
    try {
      // ✅ 仅当 res 是原始 Response 才 clone
      const data = typeof res.clone === 'function' ? await res.clone().json() : res

      if (data?.status_code !== 200) {
        handleBusinessError(data, options, ctx)
      }
    } catch (err) {
      console.warn('非 JSON 响应或解析错误:', err)
    }
  }

  if (ctx.error) {
    if (ctx.res && !ctx.error.response) {
      ctx.error.response = {
        status: ctx.res.status_code,
        statusText: ctx.res.mes,
      }
    }
    throw ctx.error
  }
}



const handleBusinessError = (
  data: { status_code: number; mes?: string; message?: string },
  options: RequestOptionsInit,
  ctx: Context
) => {
  const { status_code, mes, message } = data
  const userStore = useUserStore()
  if (status_code === 401) {
    if (userStore.refreshToken) {
      ctx.res = handle4xxError(options)
      return
    }

    if (!isLoggingOut) {
      isLoggingOut = true
      userStore.loginOut()
      toast.error('登录已过期，请重新登录')
    }
    ctx.error = new Error('登录已过期')
    throw ctx.error
  }
  if (mes || message) {
    ctx.error = new Error(mes || message)
  }

  ctx.error.options = options
  throw ctx.error
}

client.use(retryMiddleware)
client.use(businessMiddleware)

export default client
