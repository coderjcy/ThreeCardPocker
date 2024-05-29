<template>
  <div class="room-list">
    <div class="rooms">
      <div
        class="room"
        v-for="item in roomList"
        :key="item.id"
        @click="$router.push('/room/in/' + item.id)"
      >
        <div>{{ item.name }}</div>
        <div>({{ item.playerList.length }} / {{ item.playerMax }} 人)</div>
      </div>
    </div>
    <el-button class="create-btn" @click="handleCreateRoom">创建房间</el-button>
  </div>
</template>
<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { queryRoomList, createRoom } from '@/service/room-list'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'

interface IRoomType {
  id: number
  name: string
  playerList: any[]
  playerMax: number
}
const router = useRouter()

const roomList = ref<IRoomType[]>([])
const getRoomList = () => {
  queryRoomList().then((res: any) => {
    roomList.value = res
  })
}

const handleCreateRoom = () => {
  createRoom().then((res: any) => {
    ElMessage.success('创建成功')
    getRoomList()
    // router.push('/room/in/' + res.roomId)
  })
}
let timer: number
onMounted(() => {
  getRoomList()
  timer = setInterval(getRoomList, 1000)
})
onUnmounted(() => {
  timer && clearInterval(timer)
})
</script>
<style lang="less" scoped>
.room-list {
  width: 100%;
  height: 100%;
  padding: 20px 20px 50px 20px;
  display: flex;
  flex-wrap: wrap;
  position: relative;
  .room {
    border: 1px solid salmon;
    padding: 10px;
    text-align: center;
    border-radius: 8px;
  }
  .create-btn {
    position: absolute;
    bottom: 9px;
    left: 50%;
    transform: translateX(-50%);
  }
}
</style>
