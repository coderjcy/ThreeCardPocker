<template>
  <router-view></router-view>
  <!-- <el-button @click="startGame()">开始游戏</el-button>
  <el-button @click="closeGame($message)">查看结果</el-button>
  <div class="screen">
    <template v-if="players.length">
      <div class="player-1">
        <img
          class="card"
          v-for="i in players[1].cards"
          :src="dynamicImageUrl(i.suitLabel, i.label)"
          :key="i.label + i.suitLabel"
        />
      </div>
      <div class="player-2">
        <img
          class="card"
          v-for="i in players[2].cards"
          :src="dynamicImageUrl(i.suitLabel, i.label)"
          :key="i.label + i.suitLabel"
        />
      </div>
      <div class="me">
        <img
          class="card"
          v-for="i in players[0].cards"
          :src="dynamicImageUrl(i.suitLabel, i.label)"
          :key="i.label + i.suitLabel"
        />
      </div>
    </template>
  </div> -->
</template>
<script setup lang="ts">
import { ref } from 'vue'
import Game from './index'
import type { IPlayer } from './index'
const game = new Game(3)
const dynamicImageUrl = (suit: any, label: any) => {
  return `/src/assets/imgs/${suit + label}.jpg`
}

const players = ref<IPlayer[]>([])
const startGame = () => {
  game.start()
  players.value = game.players
}

const closeGame = (message: any) => {
  console.log(`output->`, message)
  const winner = game.computeWinner()
  message.success(`胜利者是${winner.name}`)
}
</script>
<style scoped lang="less">
.card {
  margin-right: 10px;
}

.screen {
  width: 600px;
  height: 300px;
  background-color: red;
  position: relative;
  .player-1 {
    left: 20px;
  }
  .player-2 {
    right: 20px;
  }
  .player-1,
  .player-2 {
    position: absolute;
    top: 20px;
    .card {
      width: 50px;
    }
  }

  .me {
    position: absolute;
    bottom: 0px;
    left: 50%;
    transform: translateX(-50%);
    .card {
      width: 70px;

      // &:nth-child(n + 1) {
      //   margin-right: -50px;
      // }
    }
  }
}
</style>
