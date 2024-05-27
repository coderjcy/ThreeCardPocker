<template>
  <div>
    <el-button @click="handleCreateRoom">创建房间</el-button>
    <div class="rooms">
      <div class="room" v-for="item in roomList" :key="item.id">
        {{ item.name }}({{ item.playerList.length }} / {{ item.max }} 人)
        <el-button @click="$router.push('/room/in/' + item.id)">进入房间</el-button>
      </div>
    </div>
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
  max: number
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
<style lang="scss" scoped></style>
