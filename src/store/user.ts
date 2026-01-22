import { ref } from 'vue'
import { defineStore } from 'pinia'
import { queryUserInfoById } from '@/service/user'
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

  const getUserInfoById = async (id: number) => {
    const res = await queryUserInfoById(id)

    return res.data
  }
  return { userInfo, setupStore, getUserInfoById }
})

export default useUserStore
