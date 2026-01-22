<template>
  <div class="page">
    <template v-if="!isShowCreate">
      <div class="user">
        <div class="user-info">
          <img class="avatar" :src="userInfo.avatar" alt="" />
          <div>
            <div>{{ userInfo.nickname }}</div>
            <div style="color: #bbb">ID：{{ userInfo.id }}</div>
          </div>
        </div>
        <div class="balance">
          <div class="diamond">
            <img src="@/assets/imgs/diamond.png" />
          </div>
          <img
            style="transform: translateX(50%); position: absolute; right: 0"
            src="@/assets/imgs/添加.png"
            alt=""
            @click="handleCharge"
          />
          {{ userInfo.balance }}
        </div>
      </div>
      <div class="game-room-list">
        <!-- 列表标题（显示房间数量） -->
        <div class="list-title">
          <span>房间列表</span>
          <span class="count">{{ roomList.length }} 个房间</span>
        </div>

        <!-- 列表滚动容器 -->
        <div class="list-container">
          <!-- 空列表提示 -->
          <div class="empty-tip" v-if="roomList.length === 0">
            <span>暂无可用房间，快去创建一个吧～</span>
          </div>
          <div class="room-list">
            <!-- 房间项循环渲染 -->
            <div
              class="room-item"
              v-for="room in roomList"
              :key="room.id"
              :class="{ full: room.currentNumber >= room.playerNumber }"
              @click="enterRoom(room)"
            >
              <!-- 房间名称区域 -->
              <div class="room-name">
                <span class="icon">🏠</span>
                <span class="text">{{ room.name }}</span>
              </div>

              <!-- 人数+状态区域 -->
              <div class="room-people">
                <span class="num">{{ room.currentNumber }}/{{ room.playerNumber }}</span>

                <span class="tag free" v-if="room.currentNumber < room.playerNumber">空闲</span>
                <span class="tag" v-else-if="room.state === 'playing'">游戏中</span>
                <span class="tag" v-else-if="room.currentNumber === room.playerNumber">满员</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="hanlder">
        <button v-if="!isShowCreate" class="room-btn create-room" @click="handleCreateClick">
          <span class="btn-icon">➕</span>
          <span class="btn-text">创建房间</span>
        </button>
        <button v-if="!isShowCreate" class="room-btn join-room" @click="handleJoinRoom">
          <span class="btn-icon">🔗</span>
          <span class="btn-text">加入房间</span>
        </button>
      </div>
    </template>

    <div class="create-room-container" v-else>
      <div class="craete-room-title">创建房间</div>
      <el-form :model="formData" ref="formRef" labelWidth="80" size="large" style="flex: 1">
        <el-form-item label="房间名称" prop="roomName">
          <el-input v-model="formData.roomName"></el-input>
        </el-form-item>
        <el-form-item label="私人房间" prop="isPersonal">
          <el-switch
            style="margin-left: auto"
            v-model="formData.isPersonal"
            active-text="开启"
            inactive-text="关闭"
            inline-prompt
          />
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
      </el-form>
      <div class="btn-group">
        <button class="cancel-btn" @click="isShowCreate = false">取消</button>
        <button class="create-btn" @click="handleCreateRoom($refs.formRef)">创建房间</button>
      </div>
    </div>
  </div>
  <Keybord v-model="isShowJoin" />
</template>
<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { queryRoomList, createRoom } from '@/service/room-list'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import useUserStore from '@/store/user'
import Keybord from './keybord.vue'

const isLandscape = ref(false)
if (window.innerWidth > window.innerHeight) {
  isLandscape.value = false
  document.body.classList.remove('landscape')
} else {
  isLandscape.value = true
  document.body.classList.add('landscape')
}

interface IRoomType {
  id: number
  name: string
  playerList: any[]
  playerNumber: number
  currentNumber: number
  state: string
}
const isShowJoin = ref(false)
const userStore = useUserStore()
const router = useRouter()
const isShowCreate = ref(false)
const formData = ref({
  roomName: userStore.userInfo?.nickname + '的房间',
  playerNumber: 3,
  baseChip: 1,
  roundCount: 10,
  isPersonal: false
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
    roundCount: 10,
    isPersonal: false
  }
}
const handleJoinRoom = () => {
  isShowJoin.value = true
}
const handleCharge = () => {
  ElMessage.warning('充值功能暂未开放')
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
const userInfo = ref<any>({})
onMounted(async () => {
  getRoomList()
  timer = setInterval(getRoomList, 1000)
  const info = await userStore.getUserInfoById(userStore.userInfo!.id)
  userInfo.value = info
})
onUnmounted(() => {
  timer && clearInterval(timer)
})
</script>
<style>
.landscape {
  .page {
    width: 100vh !important;
    height: 100vw !important;
    transform: rotate(90deg) translateY(-100vw);
    transform-origin: top left;
  }

  .room-btn {
    width: 18vh !important;
    height: 6vh !important;
  }
}
</style>
<style lang="less" scoped>
.page {
  width: 100vw;
  height: 100vh;
  padding: 20px 20px 20px 20px;
  text-align: center;
  background: linear-gradient(180deg, #1a1a2e, #16213e);

  box-sizing: border-box;
  color: #fff;
  position: relative;
  display: flex;
  flex-direction: column;
  .user {
    display: flex;
    width: 100%;
    margin-bottom: 20px;
    .user-info {
      font-size: 14px;
      display: flex;
      align-items: center;
      text-align: left;
      // color: #fff;
      .avatar {
        width: 46px;
        height: 46px;
        border-radius: 6px;
        margin-right: 10px;
      }
    }
    .balance {
      margin-left: auto;
      margin-right: 20px;
      height: 22px;
      width: 72px;
      padding: 0 20px;
      position: relative;
      background-color: #383449;
      color: #fff;
      text-align: center;
      font-size: 14px;
      margin-top: 6px;
      img {
        height: 100%;
      }
      .diamond {
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        display: flex;
        flex-shrink: 0;
        overflow: hidden;
        mask: url('@/assets/imgs/diamond.png');
        -webkit-mask: url('@/assets/imgs/diamond.png');
        transform: translateX(-50%);
        &::after {
          content: '';
          position: absolute;
          left: 0;
          right: 0;
          top: 0;
          bottom: 0;
          background: linear-gradient(
            45deg,
            rgba(255, 255, 255, 0) 40%,
            rgba(255, 255, 255, 0.7),
            rgba(255, 255, 255, 0) 60%
          );
          animation: shark-wrap 3s infinite;
          transform: translateX(-100%);
        }
      }
      @keyframes shark-wrap {
        to {
          transform: translateX(100%);
        }
      }
    }
  }

  .create-room-container {
    display: flex;
    flex-direction: column;
    width: 60%;
    margin: 0 auto;
    height: 100%;
    .craete-room-title {
      font-size: 22px;
      font-weight: bold;
      text-align: center;
      margin-bottom: 20px;
      color: #38bdf8;
      text-shadow: 0 0 8px rgba(56, 189, 248, 0.6);
    }
    .el-form-item {
      margin-bottom: 10px;
    }
    .el-input-number {
      margin-left: auto;
    }
    :deep(.el-form-item__label) {
      color: #e2e8f0 !important;
      margin-right: 10px;
    }
    :deep(.el-input__wrapper) {
      background: transparent !important;
      box-shadow: none;
    }
    :deep(.is-checked .el-switch__core) {
      background: #38bdf9 !important;
      border: none !important;
    }
    :deep(.el-switch__core) {
      background: #475569 !important;
      border: none !important;
    }
    :deep(input) {
      background: rgba(30, 41, 59, 0.8) !important;
      border: 1px solid #475569 !important;
      padding-left: 10px;
      border-radius: 8px !important;
    }

    :deep(.el-input-number__decrease) {
      background: rgba(30, 41, 59) !important;
      border: 1px solid #475569 !important;
    }
    :deep(.el-input-number__increase) {
      background: rgba(30, 41, 59) !important;
      border: 1px solid #475569 !important;
    }
    .btn-group {
      display: flex;
      gap: 12px;
      margin-top: 24px;
      .cancel-btn,
      .create-btn {
        flex: 1;
        height: 48px;
        border: none;
        border-radius: 8px;
        font-size: 18px;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.2s;
      }
      .cancel-btn {
        background: #475569;
        color: #e2e8f0;

        &:hover {
          background: #64748b;
        }
      }
      .create-btn {
        background: linear-gradient(135deg, #2563eb 0%, #38bdf8 100%);
        color: #fff;
        box-shadow: 0 4px 0 rgba(37, 99, 235, 0.5);

        &:hover {
          background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
        }
      }
    }
  }
}
</style>
<style scoped lang="less">
.hanlder {
  margin-top: 20px;
  display: flex;
  justify-content: space-evenly;
  .room-btn {
    white-space: nowrap;
    border: none;
    border-radius: 10px;
    font-size: 18px;
    font-weight: bold;
    color: #fff;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    box-shadow: 0 6px 0 rgba(0, 0, 0, 0.2);
    width: 18vw;
    height: 6vw;
  }
  .create-room {
    background: linear-gradient(135deg, #00b4d8, #0077b6);
  }
  .join-room {
    background: linear-gradient(135deg, #f77f00, #d62828);
  }
  .room-btn:active {
    transform: translateY(4px);
    box-shadow: 0 2px 0 rgba(0, 0, 0, 0.2);
  }
  .btn-icon {
    font-size: 24px;
    margin-right: 10px;
  }
}
</style>
<style scoped lang="less">
/* 全局重置（仅作用于组件内） */
:deep(*) {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: '微软雅黑', Arial, sans-serif;
}

.game-room-list {
  width: 100%;
  flex: 1;
  background: linear-gradient(180deg, #1e293b, #0f172a);
  border: 2px solid #38bdf8;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 0 20px rgba(56, 189, 248, 0.3);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.list-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #475569;
}

.list-title span:first-child {
  font-size: 18px;
  font-weight: bold;
  color: #fff;
}

.list-title .count {
  font-size: 14px;
  color: #94a3b8;
}

.list-container {
  max-height: 400px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #38bdf8 #1e293b;
}

.list-container::-webkit-scrollbar {
  width: 6px;
}
.list-container::-webkit-scrollbar-track {
  background: #1e293b;
  border-radius: 3px;
}
.list-container::-webkit-scrollbar-thumb {
  background: #38bdf8;
  border-radius: 3px;
}

.empty-tip {
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  font-size: 16px;
}
.room-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}
.room-item {
  width: calc(50% - 10px);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  margin-bottom: 8px;
  background: rgba(30, 41, 59, 0.8);
  border-radius: 8px;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;
}

/* 非满员房间 hover 效果 */
// .room-item:not(.full):hover {
//   border-color: #38bdf8;
//   background: rgba(30, 41, 59, 1);
//   transform: translateX(4px);
// }

/* 满员房间样式（不可点击） */
.room-item.full {
  opacity: 0.6;
  cursor: not-allowed;
}

.room-name {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #fff;
  font-size: 16px;
}

.room-name .icon {
  font-size: 18px;
}

.room-people {
  display: flex;
  align-items: center;
  gap: 8px;
}

.room-people .num {
  color: #e2e8f0;
  font-size: 14px;
  min-width: 40px;
  text-align: right;
}

.room-people .tag {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  color: #fff;
  background: #ef4444;
}

.room-people .tag.free {
  background: #22c55e;
}
</style>
