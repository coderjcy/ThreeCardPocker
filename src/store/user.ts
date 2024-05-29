import { ref } from 'vue'
import { defineStore } from 'pinia'

interface IUserInfo {
  id: number
  nickname: string
  username: string
  token: string
}
const useUserStore = defineStore('user', () => {
  const userInfo = ref<IUserInfo>()

  return { userInfo }
})

export default useUserStore
