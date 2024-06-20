import request from '../index'

export function queryRoomList() {
  return request.get({
    url: '/room/list'
  })
}

export function createRoom(data: any) {
  return request.post({
    url: '/room/create',
    data
  })
}
export function dissolveRoom(roomId: any) {
  return request.post({
    url: '/room/dissolve',
    data: { roomId }
  })
}
export function queryRoomInfo(roomId: number | string) {
  return request.get({
    url: '/room/' + roomId
  })
}
export function startGame() {
  return request.post({
    url: '/room/create'
  })
}
