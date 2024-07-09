<template>
  <div class="room-list">
    <el-button
      v-if="!isShowCreate"
      class="create-btn"
      @click="handleCreateClick"
      type="primary"
      plain
      >创建房间</el-button
    >
    <div class="rooms" v-if="!isShowCreate">
      <div class="room" v-for="item in roomList" :key="item.id" @click="enterRoom(item)">
        <div>{{ item.name }}</div>
        <div>({{ item.currentNumber }} / {{ item.playerNumber }} 人)</div>
      </div>
    </div>
    <div class="create-room" v-else>
      <el-form :model="formData" ref="formRef" labelWidth="80">
        <el-form-item label="房间名称" prop="roomName">
          <el-input v-model="formData.roomName"></el-input>
        </el-form-item>
        <el-form-item label="游戏人数" prop="playerNumber">
          <el-input-number v-model="formData.playerNumber" :min="2" :max="10"></el-input-number>
        </el-form-item>
        <el-form-item label="底注" prop="baseChip">
          <el-input-number v-model="formData.baseChip" :min="1" :max="100"></el-input-number>
        </el-form-item>
        <el-form-item label="轮数" prop="roundCount">
          <el-input-number v-model="formData.roundCount" :min="10" :step="5"></el-input-number>
        </el-form-item>
        <el-form-item labelWidth="0">
          <el-button style="flex: 1" @click="isShowCreate = false">取消</el-button>
          <el-button style="flex: 1" @click="handleCreateRoom($refs.formRef)" type="primary"
            >创建房间</el-button
          >
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>
<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { queryRoomList, createRoom } from '@/service/room-list'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import useUserStore from '@/store/user'

interface IRoomType {
  id: number
  name: string
  playerList: any[]
  playerNumber: number
  currentNumber: number
}
const userStore = useUserStore()
const router = useRouter()
const isShowCreate = ref(false)
const formData = ref({
  roomName: userStore.userInfo?.nickname + '的房间',
  playerNumber: 3,
  baseChip: 1,
  roundCount: 10
})
const roomList = ref<IRoomType[]>([])
const getRoomList = () => {
  queryRoomList().then((res: any) => {
    roomList.value = res.data
  })
}
const enterRoom = (room: any) => {
  router.push('/room/in/' + room.id)
}
const handleCreateClick = () => {
  isShowCreate.value = true
  formData.value = {
    roomName: userStore.userInfo?.nickname + '的房间',
    playerNumber: 3,
    baseChip: 1,
    roundCount: 10
  }
}
const handleCreateRoom = async (formRef: any) => {
  const isPass = await formRef.validate((v: any) => v)
  if (!isPass) return
  createRoom(formData.value).then((res: any) => {
    if (res.data.isExists) return ElMessage.warning(res.message)
    ElMessage.success('创建成功')
    getRoomList()
    router.push('/room/in/' + res.data.roomId)
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
  padding: 20px 20px 50px 20px;
  text-align: center;

  .rooms {
    width: 100%;
    height: 100%;
    display: flex;
    flex-wrap: wrap;
    gap: 10px 20px;
  }
  .room {
    border: 1px solid salmon;
    padding: 10px;
    text-align: center;
    border-radius: 8px;
  }
  .create-btn {
    margin-bottom: 20px;
  }
}
</style>
