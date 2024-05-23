<template>
  <div>
    <div v-if="!isPlaying">
      <div class="users">
        <div class="user" v-for="(user, index) in playerList" :key="index">
          <div>{{ user.name }}</div>
          <div>{{ user.isReady ? '已准备' : '未准备' }}</div>
        </div>
      </div>
      <div>
        操作
        <el-button v-if="isCreator" @click="handleStartGame">开始游戏</el-button>
        <el-button v-else @click="handleToggleState">{{ isReady ? '取消准备' : '准备' }}</el-button>
      </div>
      <div class="chatting-records">
        <div>消息列表</div>
        <div v-for="(item, index) in messageList" :key="index">
          <span>{{ item.title }}</span> <span>{{ item.content }}</span>
        </div>
      </div>
    </div>
    <div v-else class="screen">
      <div class="player-1" v-if="otherData[0]">
        <div v-if="otherData[0].remain > -1">倒计时:{{ otherData[0].remain }}</div>
        <img class="card" src="@/assets/imgs/backface.jpg" />
        <img class="card" src="@/assets/imgs/backface.jpg" />
        <img class="card" src="@/assets/imgs/backface.jpg" />
        <div>用户:{{ otherData[0].name }}</div>
        <div>余额:{{ otherData[0].balance }}</div>
      </div>
      <div class="player-2" v-if="otherData[1]">
        <img class="card" src="@/assets/imgs/backface.jpg" />
        <img class="card" src="@/assets/imgs/backface.jpg" />
        <img class="card" src="@/assets/imgs/backface.jpg" />
        <div>用户:{{ otherData[1].name }}</div>
        <div>余额:{{ otherData[1].balance }}</div>
        <div v-if="otherData[1].remain > -1">倒计时:{{ otherData[1].remain }}</div>
      </div>
      <div class="me">
        <template v-if="myselfData.isBlind">
          <img class="card" src="@/assets/imgs/backface.jpg" />
          <img class="card" src="@/assets/imgs/backface.jpg" />
          <img class="card" src="@/assets/imgs/backface.jpg" />
        </template>
        <template v-else>
          <img
            class="card"
            v-for="i in myselfData.cards"
            :src="dynamicImageUrl(i.suitLabel, i.label)"
            :key="i.label + i.suitLabel"
          />
        </template>
      </div>

      <div class="handler" v-if="myselfData.remain > -1">
        <div>倒计时:{{ myselfData.remain }}</div>
        <el-button @click="handleFollowBet">跟注</el-button>
        <el-button @click="handleAddBet">下注</el-button>
        <el-button @click="handleAbandon">放弃</el-button>
        <el-button @click="handleShowPocker">看牌</el-button>
      </div>
    </div>
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
const isPlaying = ref(false)
const myselfData = ref<any>({})
const otherData = ref<any[]>([])
let ws: any
type notifyType = 'success' | 'warning' | 'error' | 'info'
const enterRoom = () => {
  ws = new WebSocket('ws://localhost:8000?token=' + token + '&roomId=' + roomId)

  ws.onopen = () => {
    console.log(`成功进入房间`)
  }
  ws.onmessage = handleMessage
}
const handleMessage = (e: any) => {
  const res = JSON.parse(e.data)
  if (res.data.type === 'update-chatting-records') {
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
  } else if (res.data.type === 'countdown') {
    if (myselfData.value.id === res.data.userId) return (myselfData.value.remain = res.data.remain)
    let player: any = null
    otherData.value.forEach((i) => {
      if (i.id === res.data.userId) player = i
      else i.remain = -1
    })
    if (player) player.remain = res.data.remain
  } else if (res.code === -1007) {
    router.push('/room/list')
  }
}
const dynamicImageUrl = (suit: any, label: any) => {
  return `/src/assets/imgs/${suit + label}.jpg`
}
onMounted(() => {
  enterRoom()
})
onUnmounted(() => {
  ws && ws.close()
})

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
}

// 下注
const handleAddBet = () => {
  ws.send(
    JSON.stringify({
      key: 'add-bet'
    })
  )
}

// 跟注
const handleFollowBet = () => {
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
}

// const handleCompare = () => {}
</script>
<style lang="less" scoped>
.users {
  display: flex;
  border: 1px solid #ccc;
}

.chatting-records {
  border: 1px solid red;
  color: #000;
  padding: 10px;
}

.screen {
  width: 600px;
  height: 300px;

  background: url(@/assets/imgs/desk.jpg);
  position: fixed;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
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
    bottom: 0px;
    left: 50%;
    transform: translateX(-50%);

    .card {
      width: 70px;
    }
  }

  .handler {
    position: absolute;
    bottom: 150px;
    left: 50%;
    transform: translateX(-50%);
  }
}
</style>
