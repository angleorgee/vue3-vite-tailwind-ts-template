import { getStorageItem } from '@/utils/index'
import { getNewTokenApi, getUserInfoApi, type UserInfo } from '@/api/index'
import { toast } from 'vue-sonner'
type User = {
  userInfo?: UserInfo
  token: string
  refreshToken?: string
}
const router = useRouter()
export const useUserStore = defineStore('user', {
  state: (): User => {
    return {
      userInfo: undefined,
      token: '',
      refreshToken: ''
    }
  },
  getters: {},
  actions: {
    async getUserInfo(token: string) {
      this.token = token
      console.log(token, 'token')
      try {
        const res = await getUserInfoApi(token);
        this.userInfo = res?.body;
        return 'ok';
      } catch (error) {
        this.removeToken();
        this.setUserInfo();
        toast.error('获取用户信息失败,请重新登录');
        router.push('/account');
        return Promise.reject(error);
      }
    },
    async refreshTokenActions() {
      if (this.refreshToken !== getStorageItem('user')?.refreshToken) {
        this.refreshToken = getStorageItem('user')?.refreshToken
      }
      try {
        const { body: { access_token, refresh_token } } = await getNewTokenApi({ refresh_token: this.refreshToken })
        this.setToken(access_token, refresh_token)
      } catch (error) {
        console.error(error)
        this.loginOut()
      }
    },
    setToken(token: string, refreshToken?: string) {
      this.token = token
      if (refreshToken) this.refreshToken = refreshToken
    },
    setUserInfo(userInfo?: UserInfo) {
      this.userInfo = userInfo
    },
    async loginOut() {
      this.removeToken()
      this.setUserInfo()
      router.push('/login')
    },
    removeToken() {
      this.token = ''
      this.refreshToken = ''
      this.userInfo = undefined
    },
  }
})