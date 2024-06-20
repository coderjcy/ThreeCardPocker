import request from '../index'
interface ILoginRes {
  id: number
  username: string
  token: string
}
export function login(userInfo: any) {
  return request.post({
    url: '/login',
    data: userInfo
  })
  // }) as Promise<ILoginRes>
}
