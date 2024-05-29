<template>
  <div class="screen">
    <div class="pre-game">
      <div class="users">
        <template v-for="user in otherData" :key="user.id">
          <div class="user">
            <div class="info">
              <div v-if="user.remain > -1" class="countdown">
                <div class="remain">{{ user.remain }}</div>
                <img src="@/assets/imgs/countdown.png" alt="" />
              </div>

              <el-button
                v-if="!user.isAbandon && isShowCompare"
                @click="handleComparePocker(user.id)"
                >比牌</el-button
              >

              <div v-if="isPlaying" class="pockers">
                <img class="pocker" v-for="i in 3" :key="i" src="@/assets/imgs/backface.jpg" />
                <div v-if="!user.isBlind" class="state view">已看牌</div>
                <div v-if="user.isAbandon" class="state abandon">已放弃</div>
              </div>
              <div v-else class="ready-state">{{ user.isReady ? '已准备' : '未准备' }}</div>
              <div>
                <img class="avatar" :src="user.avatar" alt="" />
                <div>{{ user.name }}</div>
              </div>
            </div>
            <div>投注: {{ user.chip || 0 }}&nbsp;&nbsp;&nbsp;总分:{{ user.balance }}</div>
          </div>
        </template>
      </div>
      <div class="myself">
        <div class="pockers">
          <template v-if="myselfData.isBlind">
            <img class="pocker" v-for="i in 3" :key="i" src="@/assets/imgs/backface.jpg" />
          </template>
          <template v-else>
            <img
              class="pocker"
              v-for="i in myselfData.cards"
              :src="dynamicImageUrl(i.suitLabel, i.label)"
              :key="i.label + i.suitLabel"
            />
          </template>
        </div>
        <div class="info">
          <img :src="myselfData.avatar" alt="" />
          <div>
            <div>{{ myselfData.name }}</div>
            <div>总分:{{ myselfData.balance }} 投注:{{ myselfData.chip || 0 }}</div>
          </div>
        </div>
      </div>
      <div class="handler" v-if="myselfData.remain > -1">
        <div class="countdown">
          <div class="remain">{{ myselfData.remain }}</div>
          <img src="@/assets/imgs/countdown.png" alt="" />
        </div>
        <button class="btn" @click="handleAbandon">放弃</button>
        <button class="btn" @click="isShowCompare = true">比牌</button>

        <button class="btn" @click="handleShowPocker">看牌</button>
        <button class="btn" @click="handleAddBet">加注</button>
        <button class="btn" @click="handleFollowBet">跟注</button>
      </div>
    </div>

    <!-- <div>
      <el-input v-model="message"></el-input>
      <el-button @click="handleSendMessage"></el-button>
    </div> -->
    <!-- 开始游戏、准备、取消准备 -->
    <div v-if="!isPlaying" class="pre-game-handler">
      <el-button v-if="isCreator" @click="handleStartGame" size="large">开始游戏</el-button>
      <el-button v-else @click="handleToggleState" size="large">{{
        isReady ? '取消准备' : '准备'
      }}</el-button>
    </div>
    <!-- 房间信息 -->
    <div class="room-info">
      <div>房间号: {{ roomId }}</div>
      <div>底注: {{ 1 }}</div>
      <div>总注: {{ chipPool }}</div>
    </div>
    <!-- 消息列表 -->
    <div v-if="!isPlaying" class="chatting-records">
      <div>消息列表</div>
      <div v-for="(item, index) in messageList" :key="index">
        <span>{{ item.title }}</span> <span>{{ item.content }}</span>
      </div>
    </div>
    <!-- 筹码池 -->
    <div class="chip-pool"></div>

    <!-- 退出房间 -->
    <el-button v-if="!isPlaying" plain class="quit" @click="$router.back">退出房间</el-button>
  </div>
</template>
<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const roomId = route.params.roomId
const token = localStorage.getItem('token')
const playerList = ref<any[]>([])
const messageList = ref<any[]>([])
const isCreator = ref(false)
const isReady = ref(false)
const isShowCompare = ref(false)
const isPlaying = ref(false)
const chipPool = ref(0)
const currentChipMin = ref(0)
const myselfData = ref<any>({})
const otherData = ref<any[]>([])
const competitors = ref<any>({})
const message = ref('')
let bgm: any
let ws: any
let timer: any
type notifyType = 'success' | 'warning' | 'error' | 'info'

const enterRoom = () => {
  ws = new WebSocket('ws://localhost:8000?token=' + token + '&roomId=' + roomId)

  ws.onopen = () => {
    ElMessage.success('成功进入房间')
    timer = setInterval(() => {
      ws.send(JSON.stringify('ping'))
    }, 60000)
  }
  ws.onmessage = handleMessage
}
const handleMessage = (e: any) => {
  const res = JSON.parse(e.data)
  if (res === 'pong') return
  else if (res.code === -1007) {
    router.push('/room/list')
  } else if (res.data.type === 'update-chatting-records') {
    messageList.value = res.data.chattingRecords
  } else if (res.data.type === 'update-player-list') {
    playerList.value = res.data.playerList
  } else if (res.data.type === 'is-creator') {
    isCreator.value = res.data.isCreator
  } else if (res.data.type === 'toggle-is-ready') {
    isReady.value = res.data.isReady
  } else if (res.data.type === 'notify') {
    ElMessage[res.data.notifyType as notifyType](res.data.msg)
  } else if (res.data.type === 'toggle-room-state') {
    isPlaying.value = res.data.state === 'playing'
  } else if (res.data.type === 'update-game-data') {
    myselfData.value = res.data.self
    otherData.value = res.data.other
    chipPool.value = res.data.chipPool
    currentChipMin.value = res.data.currentChipMin
  } else if (res.data.type === 'countdown') {
    if (myselfData.value.id === res.data.userId) return (myselfData.value.remain = res.data.remain)
    let player: any = null
    otherData.value.forEach((i) => {
      if (i.id === res.data.userId) player = i
      else i.remain = -1
    })
    if (player) player.remain = res.data.remain
  } else if (res.data.type === 'compare-pocker') {
    competitors.value[res.data.competitor.id] = res.data.competitor
  }
}
const handleSendMessage = () => {
  ws.send(
    JSON.stringify({
      key: 'player-message',
      data: message.value
    })
  )
  message.value = ''
}
const dynamicImageUrl = (suit: any, label: any) => {
  return `/src/assets/imgs/${suit + label}.jpg`
}
const handleComparePocker = (playerId: number) => {
  ws.send(JSON.stringify({ key: 'compare-pocker', playerId }))
  isShowCompare.value = false
}

// 切换准备状态
const handleToggleState = () => {
  ws.send(
    JSON.stringify({
      key: 'toggle-is-ready'
    })
  )
}

// 尝试开始游戏
const handleStartGame = () => {
  ws.send(
    JSON.stringify({
      key: 'start-game'
    })
  )
}

// 弃牌
const handleAbandon = () => {
  ws.send(
    JSON.stringify({
      key: 'abandon-bet'
    })
  )
  isShowCompare.value = false
}

// 下注
const handleAddBet = () => {
  ws.send(
    JSON.stringify({
      key: 'add-bet'
    })
  )
  isShowCompare.value = false
}

// 跟注
const handleFollowBet = () => {
  ws.send(
    JSON.stringify({
      key: 'follow-bet'
    })
  )
  isShowCompare.value = false
}

// 看牌
const handleShowPocker = () => {
  ws.send(
    JSON.stringify({
      key: 'show-pocker'
    })
  )
  isShowCompare.value = false
}
const playBGM = () => {
  bgm = new Audio('/src/assets/mp3/bgm.mp3')
  bgm.loop = true // 设置循环播放
  bgm.play() // 播放音频
}
const stopBGM = () => {
  bgm.pause()
}

onMounted(() => {
  enterRoom()
  // playBGM()
})
onUnmounted(() => {
  ws && ws.close()
  timer && clearInterval(timer)
  bgm && stopBGM()
})
</script>
<style lang="less" scoped>
.screen {
  width: 100%;
  height: 100%;
  background: url(@/assets/imgs/desk.jpg);
  position: fixed;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  color: #fff;
  .pre-game {
    .users {
      position: absolute;
      right: 20px;
      bottom: 100px;
      .user {
        white-space: nowrap;
        text-align: right;
        margin-top: 20px;
        .info {
          display: flex;
          text-align: center;
          line-height: 22px;
          justify-content: flex-end;
          .countdown {
            margin-right: 10px;
          }
          .avatar {
            width: 50px;
            height: 50px;
            border-radius: 5px;
          }
          .pockers {
            position: relative;
            margin-right: 10px;
            .pocker {
              width: 50px;
              border-radius: 3px;
              &:nth-child(n + 1) {
                margin-left: 2px;
              }
            }
            .state {
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              font-size: 20px;
              background: rgba(64, 64, 64, 0.6);
              border-radius: 3px;
              padding: 5px 10px;
              white-space: nowrap;
              &.view {
                color: #00ff77;
              }

              &.abandon {
                color: #e62962;
              }
            }
          }
          .ready-state {
            align-self: center;
          }
        }
      }
    }
    .myself {
      position: absolute;
      bottom: 20px;
      left: 30%;
      .pockers {
        .pocker {
          width: 50px;
          border-radius: 3px;
          &:nth-child(n + 1) {
            margin-left: 2px;
          }
        }
      }
      .info {
        display: flex;
        align-items: flex-end;
        img {
          width: 50px;
          margin-right: 5px;
          border-radius: 5px;
        }
      }
    }
  }
  .countdown {
    width: 50px;
    height: 50px;
    img {
      width: 50px;
      height: 50px;
      animation: countdown 1s infinite linear;
    }
    @keyframes countdown {
      0% {
        transform: scale(1);
      }
      50% {
        transform: scale(1.1);
      }
      100% {
        transform: scale(1);
      }
    }
    .remain {
      margin-bottom: 5px;
      text-align: center;
      font-weight: bold;
      font-size: 26px;
    }
  }
  .room-info {
    background-color: rgba(0, 0, 0, 0.5);
  }
  .player-1 {
    left: 30px;
  }
  .player-2 {
    right: 30px;
  }
  .player-1,
  .player-2 {
    position: absolute;
    top: 30px;
    .card {
      width: 50px;
      border-radius: 3px;
      &:nth-child(n + 1) {
        margin-left: 2px;
      }
    }
  }
  .me {
    position: absolute;
    bottom: 70px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    .card {
      width: 70px;
    }
    .info {
      img {
        width: 50px;
      }
    }
  }
  .state {
    position: absolute;
    top: 15px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 20px;
    color: #e62962;
    background: rgba(64, 64, 64, 0.6);
    border-radius: 3px;
    padding: 5px 10px;
    white-space: nowrap;
  }
  .handler {
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    height: 60px;
    display: flex;

    .btn {
      border-radius: 50%;
      border: 1px solid #987b07;
      height: 60px;
      width: 60px;
      background-color: #fffb00;
    }
  }

  .room-info {
    position: absolute;
    top: 0;
    left: 0;
    width: 216px;
    height: 90px;
    line-height: 30px;
    padding-left: 10px;
    border-radius: 5px;
  }
  .chatting-records {
    position: absolute;
    bottom: 80px;
    height: calc(100vh - 80px - 90px - 20px);
    overflow: scroll;
    padding: 10px;
    max-width: 30%;
  }
  .pre-game-handler {
    position: absolute;
    bottom: 150px;
    left: 50%;
    transform: translateX(-50%);
  }

  .quit {
    position: absolute;
    right: 10px;
    top: 10px;
  }
}
</style>
