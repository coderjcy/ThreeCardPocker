import request from '../index'

export function queryUserInfoById(id: any) {
  return request.get({ url: '/user/' + id })
}
