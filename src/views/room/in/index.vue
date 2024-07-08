<template>
  <div :class="{ screen: true, landscape: isLandscape, compare: isShowCompare }">
    <!-- 对手信息 -->
    <div :class="['players', `mode-number-${roomInfo.playerNumber}`]">
      <template v-for="(player, index) in otherPlayers" :key="player.id">
        <div
          :class="{ 'player-info': true, ['player-' + (index + 1)]: true }"
          :ref="(el) => (playerRefs[player.id] = el)"
          @click="handleComparePoker(player.id)"
        >
          <div
            :class="{
              avatar: true,
              'lose-state': player.state === 'lose' || player.state === 'abandon'
            }"
          >
            <img :src="player.avatar || defaultAvatar" alt="" @error="setDefaultAvatar" />
          </div>
          <label class="ready-state" v-if="roomState === 'waiting'">
            <input type="checkbox" :checked="player.state === 'ready'" disabled />
            <div class="checkmark"></div>
          </label>
          <div style="flex: 1">
            <div class="nickname">{{ player.name }}</div>
            <div class="coin">
              <span>{{ player.balance }}</span>
            </div>
            <div
              :class="[
                'balance-change',
                player.state === 'win' && roomState === 'over' ? 'win' : '',
                player.state === 'lose' && roomState === 'over' ? 'lose' : '',
                player.state === 'abandon' && roomState === 'over' ? 'lose' : ''
              ]"
            >
              <template v-if="player.state === 'win'"> + {{ chipPool - player.chip }} </template>
              <template v-else>- {{ player.chip }}</template>
            </div>
          </div>

          <div class="coin bet" v-if="roomState === 'playing'">
            <span>{{ player.chip }}</span>
          </div>
          <div v-if="player.remain > -1" class="countdown">
            <div class="remain">{{ player.remain }}</div>
            <img src="@/assets/imgs/countdown.png" alt="" />
          </div>
          <div
            v-if="roomState === 'over'"
            :class="[
              'balance-change',
              player.state === 'win' ? 'win' : '',
              player.state === 'lose' ? 'lose' : '',
              player.state === 'abandon' ? 'lose' : ''
            ]"
          >
            <template v-if="player.state === 'win'"> + {{ chipPool - player.chip }} </template>
            <template v-else>- {{ player.chip }}</template>
          </div>

          <div class="pokers" v-if="roomState !== 'waiting'">
            <template v-if="player.cards?.length">
              <img
                class="poker"
                v-for="i in player.cards"
                :src="dynamicImageUrl(i.suitLabel, i.label)"
                :key="i.label + i.suitLabel"
              />
              <div class="card-type">{{ player.cardsType }}</div>
            </template>

            <template v-else>
              <img class="poker" v-for="i in 3" :key="i" src="@/assets/imgs/backface.jpg" />
            </template>
            <div v-if="!player.isBlind" class="view-state">已看牌</div>
          </div>
        </div>
      </template>
    </div>

    <!-- 我的信息 -->
    <div v-if="myselfData.id" class="myself">
      <div class="pokers" v-if="roomState !== 'waiting'">
        <template v-if="!myselfData.cards?.length">
          <img class="poker" v-for="i in 3" :key="i" src="@/assets/imgs/backface.jpg" />
        </template>
        <template v-else>
          <img
            class="poker"
            v-for="i in myselfData.cards"
            :src="dynamicImageUrl(i.suitLabel, i.label)"
            :key="i.label + i.suitLabel"
          />
          <div class="card-type">{{ myselfData.cardsType }}</div>
        </template>
      </div>
      <div class="player-info" :ref="(el) => (playerRefs[myselfData.id] = el)">
        <div
          :class="{
            avatar: true,
            'lose-state': myselfData.state === 'lose' || myselfData.state === 'abandon'
          }"
        >
          <img :src="myselfData.avatar || defaultAvatar" alt="" @error="setDefaultAvatar" />
        </div>
        <div style="flex: 1">
          <div class="nickname">{{ myselfData.name }}</div>
          <div class="coin">
            <span>{{ myselfData.balance }}</span>
          </div>
          <!-- <div>总分:{{ myselfData.balance }} 投注:{{ myselfData.chip || 0 }}</div> -->
          <div
            v-if="roomState === 'over'"
            :class="[
              'balance-change',
              myselfData.state === 'win' ? 'win' : '',
              myselfData.state === 'lose' ? 'lose' : '',
              myselfData.state === 'abandon' ? 'lose' : ''
            ]"
          >
            <template v-if="myselfData.state === 'win'">
              + {{ chipPool - myselfData.chip }}
            </template>
            <template v-else>- {{ myselfData.chip }}</template>
          </div>
        </div>
        <div class="coin bet" v-if="roomState === 'playing'">
          <span>{{ myselfData.chip }}</span>
        </div>
        <label class="ready-state" v-if="roomState === 'waiting'">
          <input
            type="checkbox"
            :checked="myselfData.state === 'ready'"
            @change="handleToggleState"
          />
          <div class="checkmark"></div>
        </label>
        <div v-if="myselfData.remain > -1" class="countdown">
          <div class="remain">{{ myselfData.remain }}</div>
          <img src="@/assets/imgs/countdown.png" alt="" />
        </div>
      </div>
    </div>

    <!-- 游戏操作部分 -->
    <div class="handler" v-if="myselfData.remain > -1">
      <div v-if="isShowSelectChip">
        <button v-for="i in chipCoinList" :key="i" class="btn" @click="handleAddBet(i)">
          {{ i }}
        </button>
      </div>
      <div style="white-space: nowrap">
        <button class="btn" @click="handleAbandon">放弃</button>
        <button class="btn" @click="isShowCompare = true">比牌</button>
        <button v-if="myselfData.isBlind" class="btn" @click="handleShowPoker">看牌</button>
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

    <!-- 筹码池 -->
    <div
      ref="chipDeskEl"
      class="chip-pool"
      :style="{
        '--chip-value': `'${chipPool}'`
      }"
    ></div>
    <template v-if="roomState === 'waiting' && false">
      <!-- 房间信息 -->
      <div class="room-info">
        <div>房间号: {{ roomInfo.id }}</div>
        <div style="margin-left: 20px">底注: {{ roomInfo.baseChip }}</div>
      </div>
      <!-- 解散房间 -->
      <img
        src="@/assets/imgs/dissolve.png"
        class="dissolve"
        @click="handleDissolveRoom"
        alt="解散房间"
      />
      <!-- 退出房间 -->
      <img src="@/assets/imgs/exit.png" class="quit" @click="$router.back" alt="退出房间" />
      <!-- 消息列表 -->

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
    </template>
  </div>
</template>
<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { onMounted, onUnmounted, ref, computed, getCurrentInstance } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { queryRoomInfo, dissolveRoom } from '@/service/room-list/index'
import defaultAvatar from '@/assets/imgs/default.jpg'
type IRoomType = 'waiting' | 'playing' | 'over'
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
const otherPlayers = ref<any[]>([])
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
      // ElMessage.success('游戏开始')
      playBGM()
      otherPlayers.value.forEach((i) => addChipInDesk(i.id, roomInfo.value.baseChip))
      addChipInDesk(myselfData.value.id, roomInfo.value.baseChip)
      roomState.value = 'playing'
    }
    if (res.data.state === 'over') {
      // ElMessage.error('游戏结束')
      stopBGM()
      roomState.value = 'over'
      const winnerEl = playerRefs.value[res.data.winnerId]
      const rect1 = winnerEl.getBoundingClientRect()
      const rect2 = chipDeskEl.value.getBoundingClientRect()
      let top = '0px'
      let left = '0px'
      if (isLandscape.value) {
        top = rect2.width + rect2.left - rect1.left - rect1.width + 'px'
        left = rect1.top - rect2.top + 'px'
      } else {
        top = rect1.top - rect2.top + 'px'
        left = rect1.left - rect2.left + 'px'
      }
      for (let i = 0; i < chipDeskEl.value.children.length; i++) {
        const item = chipDeskEl.value.children[i]
        item.style.top = top
        item.style.left = left
        item.addEventListener('transitionend', () => item.remove())
      }
    }
    if (res.data.state === 'waiting') {
      roomState.value = 'waiting'
    }
  } else if (res.data.type === 'update-game-data') {
    myselfData.value = res.data.self
    otherPlayers.value = res.data.other
    chipPool.value = res.data.chipPool
    currentChipMin.value = res.data.currentChipMin
  } else if (res.data.type === 'countdown') {
    if (myselfData.value.id === res.data.userId) return (myselfData.value.remain = res.data.remain)
    let player: any = null
    otherPlayers.value.forEach((i) => {
      if (i.id === res.data.userId) player = i
      else i.remain = -1
    })
    if (player) player.remain = res.data.remain
  } else if (res.data.type === 'compare-poker') {
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
  } else if (res.data.type === 'show-poker') {
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

// 获取poker的url
const dynamicImageUrl = (suit: any, label: any) => {
  return `/imgs/${suit + label}.jpg`
}

// 比牌
const handleComparePoker = (playerId: number) => {
  if (!isShowCompare.value) return
  ws.send(JSON.stringify({ key: 'compare-poker', playerId }))
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
const handleShowPoker = () => {
  ws.send(
    JSON.stringify({
      key: 'show-poker'
    })
  )
  isShowCompare.value = false
  isShowSelectChip.value = false
}

// 播放背景音乐
const playBGM = () => {
  musics.bgm.loop = true // 设置循环播放
  musics.bgm.currentTime = 0
  musics.bgm.volume = 0.3
  musics.bgm.play() // 播放音频
}

// 停止背景音乐
const stopBGM = () => {
  musics.bgm.pause()
}

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
if (window.innerWidth > window.innerHeight) {
  isLandscape.value = false
  document.body.classList.remove('landscape')
} else {
  isLandscape.value = true
  document.body.classList.add('landscape')
}

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
const proxy = getCurrentInstance()!.proxy
// proxy.$message({
//   message: '房间已解散',
//   type: 'success',
//   duration: 0
// })

const setDefaultAvatar = (e: any) => {
  e.target.src = defaultAvatar
}
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

  &::after {
    display: none;
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 30;
    transform: translateX(0);
  }
  &.compare {
    &::after {
      display: unset;
    }
    .players .player-info {
      z-index: 31;
      cursor: pointer;
    }
  }
  overflow: hidden;
  background: url(@/assets/imgs/desk.jpg) no-repeat;
  background-size: cover;
  position: relative;
  color: #fff;
  transform-origin: top left;

  .players {
    .pokers {
      position: absolute;
      bottom: -10px;
      left: 50%;
      transform: translate(-50%, 100%);
      display: flex;
      .poker {
        width: 40px;
        border-radius: 3px;
        box-shadow: 0 0 10px 2px rgba(0, 0, 0, 0.1);
        &:nth-child(n + 2) {
          margin-left: -20px;
        }
      }

      .view-state {
        position: absolute;
        top: 1px;
        left: 50%;
        transform: translate(-50%);
        font-size: 12px;
        background: rgba(64, 64, 64, 0.6);
        border-radius: 2px;
        padding: 2px 5px;
        white-space: nowrap;
        z-index: 20;
        color: #00ff77;
      }
    }
  }
  .myself {
    .player-info {
      position: absolute;
      bottom: 10px;
      left: 10px;
    }
    .bet {
      top: -25px;
      // right: 0;
      // left: unset !important;
      // transform: unset !important;
    }
    .pokers {
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      .poker {
        width: 55px;
        border-radius: 3px;
        &:nth-child(n + 1) {
          margin-left: 3px;
        }
      }
      .card-type {
        font-size: 30px;
      }
    }
    .countdown {
      top: 0;
      bottom: unset !important;
      margin-bottom: 10px;
      animation: countdown-top 1s infinite linear;
    }
  }
  .card-type {
    position: absolute;
    bottom: 5px;
    left: 50%;
    transform: translateX(-50%);
    font-weight: bold;
    text-shadow: 2px 2px #fff;
    color: #f56c6c;
    font-size: 20px;
    white-space: nowrap;
    letter-spacing: 3px;
  }
  .player-info {
    position: absolute;
    display: flex;
    align-items: flex-end;
    width: 150px;
    text-align: center;
    border-radius: 10px;
    padding: 10px 5px 10px 10px;
    background-color: rgba(255, 255, 255, 0.2);
    box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.05);
    z-index: 55;

    .bet {
      position: absolute;
      bottom: -95px;
      left: 50%;
      transform: translateX(-50%);
      width: 75px !important;
      background: rgba(0, 0, 0, 0.3) !important;
    }

    .avatar {
      position: relative;
      display: flex;

      img {
        width: 50px;
        height: 50px;
        margin-right: 5px;
        border-radius: 5px;
      }

      &.lose-state {
        filter: grayscale(100%);
      }
    }

    .nickname {
      line-height: 30px;
    }
    .coin {
      width: 100%;
      height: 20px;
      border-radius: 30px;
      background: rgba(0, 0, 0, 0.4);
      display: flex;
      color: #ffd700;
      &::before {
        content: '';
        background-image: url(@/assets/imgs/coin.png);
        background-size: 20px 20px;
        width: 20px;
        height: 20px;
      }
      span {
        flex: 1;
        text-align: center;
        margin-left: -10px;
      }
    }
    .countdown {
      position: absolute;
      bottom: 0;
      width: 40px;

      img {
        width: 40px;
        height: 40px;
      }

      .remain {
        margin-bottom: 5px;
        text-align: center;
        font-weight: bold;
        font-size: 22px;
        width: 100%;
      }

      @keyframes countdown-left {
        0% {
          transform: translateX(-100%) scale(1);
        }
        50% {
          transform: translateX(-100%) scale(1.1);
        }
        100% {
          transform: translateX(-100%) scale(1);
        }
      }
      @keyframes countdown-right {
        0% {
          transform: translateX(100%) scale(1);
        }
        50% {
          transform: translateX(100%) scale(1.1);
        }
        100% {
          transform: translateX(100%) scale(1);
        }
      }
      @keyframes countdown-top {
        0% {
          transform: translateY(-100%) scale(1);
        }
        50% {
          transform: translateY(-100%) scale(1.1);
        }
        100% {
          transform: translateY(-100%) scale(1);
        }
      }
    }
  }
  .balance-change {
    &.win {
      --shadow-color: #67c23a;
      bottom: 70px;
      opacity: 1;
      font-size: 36px;
    }
    &.lose {
      --shadow-color: #f56c6c;
      bottom: 70px;
      opacity: 1;
      font-size: 36px;
    }

    position: absolute;
    bottom: 0;
    right: 0;
    left: 0;
    text-align: center;
    filter: brightness(105%);
    font-size: 30px;
    opacity: 0;
    transition: all 0.5s linear;
    color: var(--text-color);
    --text-color: #fff;

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

  .handler {
    position: absolute;
    bottom: 30px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 31;
    text-align: center;
    background: rgba(255, 255, 255, 0.5);
    border-radius: 5px;
    padding: 10px;
    .select-chip {
      margin-bottom: 10px;
    }
    .btn {
      border-radius: 5px;
      border: 1px solid #987b07;
      height: 24px;
      width: 40px;
      background-color: #fffb00;
      margin-right: 10px;
      color: #000;
    }
  }

  .room-info {
    position: absolute;
    top: 0;
    left: 0;
    background-color: rgba(255, 255, 255, 0.2);
    line-height: 30px;
    padding: 5px 10px;
    border-radius: 5px;
    display: flex;
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

  .dissolve {
    position: absolute;
    width: 20px;
    height: 20px;
    right: 40px;
    top: 5px;
  }
  .quit {
    position: absolute;
    width: 20px;
    height: 20px;
    right: 10px;
    top: 5px;
  }

  .chip-pool {
    position: absolute;
    top: 150px;
    bottom: 150px;
    left: 250px;
    right: 250px;
    z-index: 10;
    --chip-value: '';
    &::after {
      content: var(--chip-value);
      position: absolute;
      bottom: 0;
      left: 50%;
      width: 70px;
      border-radius: 30px;
      height: 24px;
      padding-left: 24px;
      background: rgba(0, 0, 0, 0.4) url(@/assets/imgs/coins.png) no-repeat;
      color: #ffd700;
      background-size: 20px 20px;
      background-position: 2px 2px;
      z-index: 30;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
  :global(.chip-coin) {
    position: absolute;
    width: 10vmin;
    height: 10vmin;
    max-width: 50px;
    max-height: 50px;
    object-fit: cover;
    z-index: 20;
    transition: all 0.5s ease;
    box-shadow: 0px 0px 2px 0px #f7f7f7;
    border-radius: 50%;
  }
}

// 2人房间
.mode-number-2 {
  .player-1 {
    top: 10px;
    right: 10px;
    // left: 50%;
    // transform: translateX(-50%);

    .countdown {
      left: 0;
      margin-left: -10px;
      animation: countdown-left 1s infinite linear;
      .remain {
        position: absolute;
        bottom: 0;
        transform: translateY(100%);
        margin-top: 10px;
      }
    }
    .pokers {
      bottom: 50%;
      right: -10px;
      left: unset;
      top: unset;
      transform: translate(100%, 50%);
    }
    .bet {
      bottom: -25px;
    }
  }
}
// 3人房间
.mode-number-3 {
  .player-1 {
    top: 10px;
    left: 10px;
    .countdown {
      right: 0;
      margin-right: -10px;
      animation: countdown-right 1s infinite linear;
    }
  }
  .player-2 {
    top: 10px;
    right: 10px;
    .countdown {
      left: 0;
      margin-left: -10px;
      animation: countdown-left 1s infinite linear;
    }
    .ready-state {
      right: unset;
      left: 0;
      transform: translate(-130%, -50%);
    }
  }
}
// 4人房间
.mode-number-4 {
  .player-1 {
    top: 10px;
    left: 10px;
    .countdown {
      right: 0;
      margin-right: -10px;
      animation: countdown-right 1s infinite linear;
    }
  }
  .player-2 {
    top: 10px;
    left: 50%;
    transform: translateX(-50%);
    .countdown {
      left: 0;
      margin-left: -10px;
      animation: countdown-left 1s infinite linear;
      .remain {
        position: absolute;
        bottom: 0;
        transform: translateY(100%);
        margin-top: 10px;
      }
    }
  }
  .player-3 {
    top: 10px;
    right: 10px;
    .countdown {
      left: 0;
      margin-left: -10px;
      animation: countdown-left 1s infinite linear;
    }
    .ready-state {
      right: unset;
      left: 0;
      transform: translate(-130%, -50%);
    }
  }
}

.ready-state {
  position: absolute;
  top: 50%;
  right: 0;
  transform: translate(130%, -50%);
  display: block;
  cursor: pointer;
  font-size: 1.5rem;
  user-select: none;
  .checkmark {
    --clr: #67c23a;
    position: relative;
    top: 0;
    left: 0;
    height: 1.3em;
    width: 1.3em;
    background-color: #ddd;
    border-radius: 50%;
    transition: 300ms;
    &:after {
      content: '';
      position: absolute;
      display: none;
    }
  }
  input {
    position: absolute;
    opacity: 0;
    cursor: pointer;
    height: 0;
    width: 0;
  }
  input:checked ~ .checkmark {
    background-color: var(--clr);
    border-radius: 0.5rem;
    animation: pulse 500ms ease-in-out;
  }
  input:checked ~ .checkmark:after {
    display: block;
  }
  .checkmark:after {
    left: 0.45em;
    top: 0.25em;
    width: 0.25em;
    height: 0.5em;
    border: solid #e0e0e2;
    border-width: 0 0.15em 0.15em 0;
    transform: rotate(45deg);
  }
  @keyframes pulse {
    0% {
      box-shadow: 0 0 0 #67c23a90;
      rotate: 20deg;
    }

    50% {
      rotate: -20deg;
    }

    75% {
      box-shadow: 0 0 0 10px #67c23a60;
    }

    100% {
      box-shadow: 0 0 0 13px #67c23a30;
      rotate: 0;
    }
  }
}
</style>
