export interface AccessToken {
  body: {
    access_token: string
    refresh_token: string,
    router?: RouterItem[]
  }
}

export interface UserInfo {
  real_name: string // 昵称
  personal: string
  sex: string
  status: string
  company: string
  create_by: string
  description: string
  last_login: string
  superuser: string
  phone: string
  email: string
  id: number
  update_by: string
  active: string
  date_joined: string
  create_time: string
  avatar: number
  update_time: string
  username: string
  user_type: string
  role: string // 角色信息字符串
  role_id: number // 角色ID
  role_list: number[] // 用户拥有角色ID数组
  total_points: number // 持有积分
}