import request from '../index'

export function queryRoomList() {
  return request.get({
    url: '/room/list'
  })
}

export function createRoom() {
  return request.post({
    url: '/room/create'
  })
}

export function startGame() {
  return request.post({
    url: '/room/create'
  })
}
