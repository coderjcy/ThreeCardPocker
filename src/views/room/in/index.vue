<template>
  <div :class="{ screen: true, landscape: isLandscape }">
    <!-- @click="myselfData.state = myselfData.state === 'win' ? 'playing' : 'win'" -->
    <!-- 对手信息 -->
    <div class="users">
      <template v-for="user in otherData" :key="user.id">
        <div
          :class="{
            user: true,
            lose: user.state === 'lose' || user.state === 'abandon',
            win: user.state === 'win'
          }"
        >
          <div class="info">
            <div v-if="user.remain > -1" class="countdown">
              <div class="remain">{{ user.remain }}</div>
              <img src="@/assets/imgs/countdown.png" alt="" />
            </div>

            <el-button
              class="compare-btn"
              v-if="user.state === 'playing' && isShowCompare"
              @click="handleComparePocker(user.id)"
              >比牌</el-button
            >

            <div v-if="roomState === 'playing'" class="pockers">
              <template v-if="user.cards?.length">
                <img
                  class="pocker"
                  v-for="i in user.cards"
                  :src="dynamicImageUrl(i.suitLabel, i.label)"
                  :key="i.label + i.suitLabel"
                />
              </template>
              <template v-else>
                <img class="pocker" v-for="i in 3" :key="i" src="@/assets/imgs/backface.jpg" />
              </template>

              <div v-if="!user.isBlind" class="state view">已看牌</div>
              <div v-if="user.state === 'abandon'" class="state abandon">已放弃</div>
              <!-- <div v-if="user.state === 'lose'" class="state lose">已淘汰</div> -->
            </div>
            <div v-if="roomState === 'waiting'" class="ready-state">
              {{ user.state === 'ready' ? '已准备' : '未准备' }}
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
    <div
      v-if="myselfData.id"
      :class="{
        myself: true,
        lose: myselfData.state === 'lose' || myselfData.state === 'abandon',
        win: myselfData.state === 'win'
      }"
    >
      <div class="pockers" v-if="roomState === 'playing'">
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
        <div class="avatar">
          <img :src="myselfData.avatar" alt="" />
        </div>
        <div>
          <div>{{ myselfData.name }}</div>
          <div>总分:{{ myselfData.balance }} 投注:{{ myselfData.chip || 0 }}</div>
          <div
            :class="{
              'balance-change': true,
              win: myselfData.state === 'win',
              lose: myselfData.state === 'lose'
            }"
          >
            {{ myselfData.chip }}
          </div>
        </div>
      </div>
    </div>

    <!-- 游戏操作部分 -->
    <div class="handler" v-if="myselfData.remain > -1">
      <div class="countdown">
        <div class="remain">{{ myselfData.remain }}</div>
        <img src="@/assets/imgs/countdown.png" alt="" />
      </div>
      <div v-if="isShowSelectChip">
        <button v-for="i in chipCoinList" :key="i" class="btn" @click="handleAddBet(i)">
          {{ i }}
        </button>
      </div>
      <div>
        <button class="btn" @click="handleAbandon">放弃</button>
        <button class="btn" @click="isShowCompare = true">比牌</button>
        <button class="btn" @click="handleShowPocker">看牌</button>
        <button
          v-if="currentChipMin !== 50"
          class="btn"
          @click="isShowSelectChip = !isShowSelectChip"
        >
          加注
        </button>
        <button class="btn" @click="handleFollowBet">跟注</button>
      </div>
    </div>

    <!-- 准备、取消准备 -->
    <div v-if="roomState === 'waiting'" class="pre-game-handler">
      <el-button @click="handleToggleState" size="large">{{
        myselfData.state === 'ready' ? '取消准备' : '准备'
      }}</el-button>
    </div>

    <!-- 房间信息 -->
    <div class="room-info">
      <div>房间号: {{ roomInfo.id }}</div>
      <div>底注: {{ roomInfo.baseChip }}</div>
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
    </div>
    <!-- 筹码池 -->
    <div ref="chipDeskEl" class="chip-pool"></div>

    <img
      v-if="roomState === 'waiting'"
      src="@/assets/imgs/dissolve.png"
      class="dissolve"
      @click="handleDissolveRoom"
      alt="解散房间"
    />
    <!-- 退出房间 -->
    <img
      v-if="roomState === 'waiting'"
      src="@/assets/imgs/exit.png"
      class="quit"
      @click="$router.back"
      alt="退出房间"
    />
  </div>
</template>
<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { onMounted, onUnmounted, ref, computed, getCurrentInstance, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { queryRoomInfo, dissolveRoom } from '@/service/room-list/index'
type IRoomType = 'waiting' | 'playing'
const route = useRoute()
const router = useRouter()
const roomId = route.params.roomId as string
const token = localStorage.getItem('token')

const messageList = ref<any[]>([])
const isShowChatting = ref(false)

const isShowCompare = ref(false)
const isShowSelectChip = ref(false)
const roomState = ref<IRoomType>('waiting')
const chipPool = ref(0)
const currentChipMin = ref(0)
const myselfData = ref<any>({})
const otherData = ref<any[]>([])
const message = ref('')
const playerRefs = ref<any>({})
const chipDeskEl = ref<any>(null)

const musics = {
  bgm: new Audio('/mp3/bgm.mp3'),
  add: new Audio('/mp3/add.mp3'),
  follow: new Audio('/mp3/follow.mp3'),
  compare: new Audio('/mp3/compare.mp3'),
  abandon: new Audio('/mp3/abandon.mp3'),
  view: new Audio('/mp3/view.mp3')
}
const chipCoinList = computed(() => {
  if (currentChipMin.value === 5) return [10, 20, 50]
  else if (currentChipMin.value === 10) return [20, 50]
  else if (currentChipMin.value === 20) return [50]
  else if (currentChipMin.value === 50) return [50]
  else return [5, 10, 20, 50]
})

let ws: any
let timer: any

type notifyType = 'success' | 'warning' | 'error' | 'info'

// 进入房间，初始化websocket
const enterRoom = () => {
  ws = new WebSocket(`${import.meta.env.VITE_APP_SOCKET_URL}?token=${token}&roomId=${roomId}`)

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
  } else if (res.data.type === 'notify') {
    ElMessage[res.data.notifyType as notifyType](res.data.msg)
  } else if (res.data.type === 'toggle-room-state') {
    if (res.data.state === 'playing') {
      ElMessage.success('游戏开始')
      playBGM()
      otherData.value.forEach((i) => addChipInDesk(i.id, roomInfo.value.baseChip))
      addChipInDesk(myselfData.value.id, roomInfo.value.baseChip)
      roomState.value = 'playing'
    }
    if (res.data.state === 'over') {
      ElMessage.error('游戏结束')
      stopBGM()
      roomState.value = 'waiting'
      //   改为异步函数把所有的筹码都放到赢者的头像然后移除
      console.log(`output->`, chipDeskEl.value.children)
      console.dir(chipDeskEl.value)
      // chipDeskEl.value.children.forEach((i) => {
      //
      // })
      for (let i = 0; i < chipDeskEl.value.children.length; i++) {
        const item = chipDeskEl.value.children[i]
        // 找到赢家的头像位置
        item.style.top = `0px`
        item.style.left = `0px`
        item.addEventListener('transitionend', () => item.remove())
      }

      // nextTick(() => {
      //   while (chipDeskEl.value.firstChild)
      //     chipDeskEl.value.removeChild(chipDeskEl.value.firstChild)
      // })
      //
      // while (chipDeskEl.value.firstChild) chipDeskEl.value.removeChild(chipDeskEl.value.firstChild)
    }
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
    musics.compare.currentTime = 0
    musics.compare.play()
  } else if (res.data.type === 'add-bet') {
    addChipInDesk(res.data.playerId, res.data.chip)
    musics.add.currentTime = 0
    musics.add.play()
  } else if (res.data.type === 'follow-bet') {
    addChipInDesk(res.data.playerId, res.data.chip)
    musics.follow.currentTime = 0
    musics.follow.play()
  } else if (res.data.type === 'show-pocker') {
    musics.view.currentTime = 0
    musics.view.play()
  } else if (res.data.type === 'abandon-bet') {
    musics.abandon.currentTime = 0
    musics.abandon.play()
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
  return `/imgs/${suit + label}.jpg`
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

// 加注
const handleAddBet = (chip: number) => {
  isShowCompare.value = false
  isShowSelectChip.value = false
  ws.send(
    JSON.stringify({
      key: 'add-bet',
      chip
    })
  )
}
// 跟注
const handleFollowBet = () => {
  isShowCompare.value = false
  isShowSelectChip.value = false
  ws.send(
    JSON.stringify({
      key: 'follow-bet'
    })
  )
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
  musics.bgm.loop = true // 设置循环播放
  musics.bgm.currentTime = 0
  musics.bgm.play() // 播放音频
}

// 停止背景音乐
const stopBGM = () => {
  musics.bgm.pause()
}
const proxy = getCurrentInstance()!.proxy
// 解散房间
const handleDissolveRoom = () => {
  ;(proxy as any)
    .$confirm('确定要解散房间吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    })
    .then(() => dissolveRoom(roomId).then(() => router.push('/room/list')))
    .catch(() => {})
}
const isLandscape = ref(false)
if (window.innerWidth > window.innerHeight) isLandscape.value = false
else isLandscape.value = true

// 添加筹码到筹码池
const addChipInDesk = (playerId: number, chip: number) => {
  const userEl = playerRefs.value[playerId]
  const chipEL = document.createElement('img')
  chipEL.src = '/imgs/chips/chip-' + chip + '.png'
  chipEL.setAttribute('class', 'chip-coin')
  const rect1 = userEl.getBoundingClientRect()
  const rect2 = chipDeskEl.value.getBoundingClientRect()

  if (isLandscape.value) {
    chipEL.style.top = rect2.width + rect2.left - rect1.left - rect1.width + 'px'
    chipEL.style.left = rect1.top - rect2.top + 'px'
  } else {
    chipEL.style.top = rect1.top - rect2.top + 'px'
    chipEL.style.left = rect1.left - rect2.left + 'px'
  }
  chipDeskEl.value.appendChild(chipEL)
  requestAnimationFrame(() => {
    if (isLandscape.value) {
      chipEL.style.top = Math.random() * rect2.width + 'px'
      chipEL.style.left = Math.random() * rect2.height + 'px'
    } else {
      chipEL.style.top = Math.random() * rect2.height + 'px'
      chipEL.style.left = Math.random() * rect2.width + 'px'
    }
  })
}
const roomInfo = ref({
  id: undefined,
  name: undefined,
  state: undefined,
  baseChip: 0,
  playerNumber: 0,
  roundCount: 0
})
onMounted(() => {
  enterRoom()
  queryRoomInfo(roomId).then((res: any) => {
    roomInfo.value = res.data
    roomState.value = res.data.state
  })
})
onUnmounted(() => {
  ws && ws.close()
  timer && clearInterval(timer)
  stopBGM()
})
</script>
<style lang="less" scoped>
.landscape {
  transform: rotate(90deg) translateY(-100vw);
  width: 100vh;
  height: 100vw;
}

.screen {
  &:not(.landscape) {
    width: 100%;
    height: 100%;
  }
  overflow: hidden;
  background: url(@/assets/imgs/desk.jpg) no-repeat;
  background-size: cover;
  position: relative;
  color: #fff;
  transform-origin: top left;

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
        align-items: flex-end;
        .compare-btn {
          z-index: 30;
        }
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
            position: relative;
            z-index: 10;
            &:nth-child(1) {
              margin-right: -30px;
              z-index: 8;
            }
            &:nth-child(2) {
              margin-right: -30px;
              z-index: 9;
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
            z-index: 20;
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
      .avatar {
        position: relative;
        img {
          width: 50px;
          margin-right: 5px;
          border-radius: 5px;
        }
      }

      .balance-change {
        &.win {
          --shadow-color: #67c23a;
          display: block;
        }
        &.lose {
          --shadow-color: #f56c6c;
          display: block;
        }
        @keyframes chipChange {
          0% {
            bottom: 0;
            opacity: 0.8;
          }
          70%,
          100% {
            bottom: 50px;
            opacity: 1;
          }
        }
        position: absolute;
        bottom: 0px;
        right: 0px;
        filter: brightness(105%);
        font-size: 30px;
        opacity: 0;
        animation: chipChange 0.5s linear;
        --text-color: #fff;
        color: var(--text-color);
        display: none;
        text-shadow:
          0 0 3px var(--text-color),
          0 0 5px var(--text-color),
          0 0 7px var(--text-color),
          0 0 10px var(--shadow-color),
          0 0 17px var(--shadow-color),
          0 0 20px var(--shadow-color),
          0 0 25px var(--shadow-color),
          0 0 37px var(--shadow-color);
      }
      .win .avatar::after {
        content: '赢家';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #ffd700;
        font-size: 32px;
        white-space: nowrap;
        text-shadow: 0 0 20px #ccc;
      }
    }
  }
  .lose {
    filter: grayscale(100%);
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
    .countdown {
      margin: 0 auto;
      margin-bottom: 10px;
    }
  }

  .room-info {
    position: absolute;
    top: 0;
    left: 0;
    width: 150px;
    background-color: rgba(0, 0, 0, 0.5);
    line-height: 30px;
    padding: 5px 10px;
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
    width: 32px;
    height: 32px;
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
  .dissolve {
    position: absolute;
    width: 30px;
    height: 30px;
    right: 60px;
    top: 20px;
  }
  .quit {
    position: absolute;
    width: 30px;
    height: 30px;
    right: 20px;
    top: 20px;
  }

  .chip-pool {
    position: absolute;
    top: 70px;
    bottom: 140px;
    left: 120px;
    right: 210px;
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
