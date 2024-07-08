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

export function signUp(userInfo: any) {
  return request.post({
    url: '/login/sign-up',
    data: userInfo
  })
}

export function applyVerifyCode(email: string) {
  return request.post({
    url: '/login/reset/code',
    data: { email },
    loading: true
  })
}
export function resetPassword(data: any) {
  return request.post({
    url: '/login/reset ',
    data
  })
}
