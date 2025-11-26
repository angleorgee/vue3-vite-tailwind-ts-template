import client from '@/api/request.js'
import type { AccessToken, UserInfo } from './index.d'
export * from './index.d'
export const getNewTokenApi = async (data: Recordable): Promise<AccessToken> => {
  return client.post('/refresh', {
    data
  })
}
export const getUserInfoApi = async (token: string): Promise<DetailResponse<UserInfo> | undefined> => {
  const payload = token.split('.')[1]
  if (!payload) return undefined
  const userInfo = JSON.parse(atob(payload))
  return client.get(`/user/${userInfo.user_id}`)
}