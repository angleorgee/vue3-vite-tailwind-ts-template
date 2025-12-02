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

export const addPluginApi = async (data: Recordable): Promise<void> => {
  const formData = new FormData();

  // 添加文件到 FormData
  if (data.file) {
    formData.append('file', data.file as Blob);
  }

  // 添加其他字段到 FormData
  Object.keys(data).forEach((key) => {
    if (key !== 'file') {
      formData.append(key, data[key] ?? '');
    }
  });
  // 发送请求
  return client.post('/audit_log/new', {
    data: formData,
    requestType: 'form',
  });
};