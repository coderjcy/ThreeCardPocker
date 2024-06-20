import { ref } from 'vue'
import { defineStore } from 'pinia'

interface IUserInfo {
  id: number
  nickname?: string
  username: string
  token: string
}
const useUserStore = defineStore('user', () => {
  const userInfo = ref<IUserInfo>()
  const setupStore = () => {
    const data = localStorage.getItem('userInfo')
    userInfo.value = data ? JSON.parse(data) : {}
  }
  return { userInfo, setupStore }
})

export default useUserStore
