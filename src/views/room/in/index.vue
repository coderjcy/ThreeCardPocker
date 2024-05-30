<template>
  <div class="screen">
    <!-- 对手信息 -->
    <div class="users">
      <template v-for="user in otherData" :key="user.id">
        <div class="user">
          <div class="info">
            <div v-if="user.remain > -1" class="countdown">
              <div class="remain">{{ user.remain }}</div>
              <img src="@/assets/imgs/countdown.png" alt="" />
            </div>

            <el-button v-if="!user.isAbandon && isShowCompare" @click="handleComparePocker(user.id)"
              >比牌</el-button
            >

            <div v-if="roomState === 'playing'" class="pockers">
              <img class="pocker" v-for="i in 3" :key="i" src="@/assets/imgs/backface.jpg" />
              <div v-if="!user.isBlind" class="state view">已看牌</div>
              <div v-if="user.isAbandon" class="state abandon">已放弃</div>
            </div>
            <div v-if="roomState === 'waiting'" class="ready-state">
              {{ user.isReady ? '已准备' : '未准备' }}
            </div>
            <div :ref="(el) => (playerRefs[user.id] = el)">
              <img class="avatar" :src="user.avatar" alt="" />
              <div>{{ user.name }}</div>
            </div>
          </div>
          <div>投注: {{ user.chip || 0 }}&nbsp;&nbsp;&nbsp;总分:{{ user.balance }}</div>
        </div>
      </template>
    </div>

    <!-- 我的信息 -->
    <div class="myself" v-if="myselfData.id">
      <div class="countdown" v-if="myselfData.remain > -1">
        <!-- <div class="countdown"> -->
        <div class="remain">{{ myselfData.remain }}</div>
        <img src="@/assets/imgs/countdown.png" alt="" />
      </div>
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

      <div class="info" :ref="(el) => (playerRefs[myselfData.id] = el)">
        <img :src="myselfData.avatar" alt="" />
        <div>
          <div>{{ myselfData.name }}</div>
          <div>总分:{{ myselfData.balance }} 投注:{{ myselfData.chip || 0 }}</div>
        </div>
      </div>
    </div>

    <!-- 游戏操作部分 -->
    <div class="handler" v-if="myselfData.remain > -1">
      <!-- <div class="handler"> -->
      <div v-if="isShowSelectChip">
        <button v-for="i in chipCoinList" :key="i" class="btn" @click="handleAddBet(i)">
          {{ i }}
        </button>
      </div>
      <div>
        <button class="btn" @click="handleAbandon">放弃</button>
        <button class="btn" @click="isShowCompare = true">比牌</button>
        <button class="btn" @click="handleShowPocker">看牌</button>
        <button class="btn" @click="isShowSelectChip = true">加注</button>
        <button class="btn" @click="handleFollowBet">跟注</button>
      </div>
    </div>

    <!-- 开始游戏、准备、取消准备 -->
    <div v-if="roomState === 'waiting'" class="pre-game-handler">
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
    <div>
      <img
        class="chatting-icon"
        src="@/assets/imgs/chat.png"
        alt=""
        @click="isShowChatting = !isShowChatting"
      />
      <div v-if="isShowChatting" class="chatting-records">
        <div>消息列表</div>
        <div v-for="(item, index) in messageList" :key="index">
          <span>{{ item.title }}</span> <span>{{ item.content }}</span>
        </div>
        <div>
          <el-input v-model="message" place="请输入内容"></el-input>
          <el-button @click="handleSendMessage">发送</el-button>
        </div>
      </div>
      <!-- <el-scrollbar height="400px" >
        <p v-for="item in 20" :key="item" class="scrollbar-demo-item">{{ item }}</p>
      </el-scrollbar> -->
    </div>
    <!-- 筹码池 -->
    <div ref="chipDeskEl" class="chip-pool"></div>

    <!-- 退出房间 -->
    <el-button v-if="roomState === 'waiting'" plain class="quit" @click="$router.back"
      >退出房间</el-button
    >
  </div>
</template>
<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { onMounted, onUnmounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
type IRoomType = 'waiting' | 'playing' | 'over'
const route = useRoute()
const router = useRouter()
const roomId = route.params.roomId
const token = localStorage.getItem('token')
const playerList = ref<any[]>([])
const messageList = ref<any[]>([])
const isShowChatting = ref(false)
const isCreator = ref(false)
const isReady = ref(false)
const isShowCompare = ref(false)
const isShowSelectChip = ref(false)
const roomState = ref<IRoomType>('waiting')
const chipPool = ref(0)
const currentChipMin = ref(0)
const myselfData = ref<any>({})
const otherData = ref<any[]>([])
const competitors = ref<any>({})
const message = ref('')
const playerRefs = ref<any>({})
const chipDeskEl = ref<any>(null)
const prePlayerId = ref(undefined)

const chipCoinList = computed(() => {
  const preIsBlind = otherData.value.find((i) => i.id === prePlayerId.value)?.isBlind
  const isNeedDouble = !myselfData.value.isBlind && preIsBlind
  if (currentChipMin.value === 5) return isNeedDouble ? [10, 20, 50] : [5, 10, 20, 50]
  else if (currentChipMin.value === 10) return isNeedDouble ? [20, 50] : [10, 20, 50]
  else if (currentChipMin.value === 20) return isNeedDouble ? [50] : [20, 50]
  else if (currentChipMin.value === 50) return [50]
  else return isNeedDouble ? [5, 10, 20, 50] : [1, 5, 10, 20, 50]
})
let bgm: any
let ws: any
let timer: any

type notifyType = 'success' | 'warning' | 'error' | 'info'

// 进入房间，初始化websocket
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

// 处理收到的websocket消息
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
    if (res.data.state === 'playing') ElMessage.success('游戏开始')
    if (res.data.state === 'over') ElMessage.error('游戏结束')
    roomState.value = res.data.state
  } else if (res.data.type === 'update-game-data') {
    myselfData.value = res.data.self
    otherData.value = res.data.other
    chipPool.value = res.data.chipPool
    currentChipMin.value = res.data.currentChipMin
    prePlayerId.value = res.data.prePlayerId
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
  } else if (res.data.type === 'add-bet') {
    addChipInDesk(res.data.playerId, res.data.chip)
  }
}

//  发送消息
const handleSendMessage = () => {
  ws.send(
    JSON.stringify({
      key: 'player-message',
      data: message.value
    })
  )
  message.value = ''
}

// 获取pocker的url
const dynamicImageUrl = (suit: any, label: any) => {
  return `/src/assets/imgs/${suit + label}.jpg`
}

// 比牌
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
  isShowSelectChip.value = false
}

// 下注
const handleAddBet = (chip: number) => {
  isShowCompare.value = false

  ws.send(
    JSON.stringify({
      key: 'add-bet',
      chip
    })
  )
}
//
// 跟注
const handleFollowBet = () => {
  ws.send(
    JSON.stringify({
      key: 'follow-bet'
    })
  )
  isShowCompare.value = false
  isShowSelectChip.value = false
}

// 看牌
const handleShowPocker = () => {
  ws.send(
    JSON.stringify({
      key: 'show-pocker'
    })
  )
  isShowCompare.value = false
  isShowSelectChip.value = false
}

// 播放背景音乐
const playBGM = () => {
  bgm = new Audio('/src/assets/mp3/bgm.mp3')
  bgm.loop = true // 设置循环播放
  bgm.play() // 播放音频
}

// 停止背景音乐
const stopBGM = () => {
  bgm.pause()
}

// 添加筹码到筹码池
const addChipInDesk = (playerId: number, chip: number) => {
  const userEl = playerRefs.value[playerId]
  console.log(`output->userEl`, userEl)
  const chipEL = document.createElement('img')
  chipEL.src = '/src/assets/imgs/chips/chip-' + chip + '.png'
  chipEL.setAttribute('class', 'chip-coin')
  const rect1 = userEl.getBoundingClientRect()
  const rect2 = chipDeskEl.value.getBoundingClientRect()

  chipEL.style.top = rect1.top - rect2.top + 'px'
  chipEL.style.left = rect1.left - rect2.left + 'px'
  chipDeskEl.value.appendChild(chipEL)

  requestAnimationFrame(() => {
    chipEL.style.top = Math.random() * rect2.height + 'px'
    chipEL.style.left = Math.random() * rect2.width + 'px'
  })
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
  background: url(@/assets/imgs/desk.jpg) no-repeat;
  background-size: cover;
  position: fixed;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  color: #fff;

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
    left: 20px;
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
      margin-top: 20px;
      img {
        width: 50px;
        margin-right: 5px;
        border-radius: 5px;
      }
    }
  }

  .countdown {
    animation: countdown 1s infinite linear;
    width: 60px;
    img {
      width: 60px;
      height: 60px;
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

  .handler {
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 30;
    text-align: center;
    .btn {
      border-radius: 50%;
      border: 1px solid #987b07;
      height: 60px;
      width: 60px;
      background-color: #fffb00;
      margin-left: 10px;
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
  .chatting-icon {
    width: 30px;
    height: 30px;
    position: absolute;
    right: 20px;
    bottom: 20px;
    cursor: pointer;
  }
  .pre-game-handler {
    position: absolute;
    bottom: 150px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 30;
  }

  .quit {
    position: absolute;
    right: 10px;
    top: 10px;
  }

  .chip-pool {
    position: absolute;
    bottom: 100px;
    left: 50%;
    transform: translateX(-50%);
    width: 500px;
    height: 220px;
    z-index: 10;
  }
  :global(.chip-coin) {
    position: absolute;
    width: 50px;
    height: 50px;
    object-fit: cover;
    z-index: 20;
    transition: all 0.5s ease;
    box-shadow: 0px 0px 2px 0px #f7f7f7;
    border-radius: 50%;
  }
}
</style>
