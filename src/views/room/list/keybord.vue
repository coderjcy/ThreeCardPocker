<template>
  <div class="wrapper" v-if="isShow">
    <div class="keybord">
      <div class="header">
        <div class="title">加入房间</div>

        <div class="close" @click="handleClose">
          <img src="@/assets/imgs/close.png" alt="" />
        </div>
      </div>
      <div style="display: flex">
        <div class="number">
          <div class="num">{{ num[0] }}</div>
          <div class="num">{{ num[1] }}</div>
          <div class="num">{{ num[2] }}</div>
          <div class="num">{{ num[3] }}</div>
          <div class="num">{{ num[4] }}</div>
          <div class="num">{{ num[5] }}</div>
        </div>
      </div>
      <div class="keys" @click="handleKeyClick">
        <div>
          <div class="key">1</div>
          <div class="key">2</div>
          <div class="key">3</div>
        </div>

        <div>
          <div class="key">4</div>
          <div class="key">5</div>
          <div class="key">6</div>
        </div>
        <div>
          <div class="key">7</div>
          <div class="key">8</div>
          <div class="key">9</div>
        </div>
        <div>
          <div class="key">重输</div>
          <div class="key">0</div>
          <div class="key">
            <img src="@/assets/imgs/delete.png" alt="" />
            <!-- 删除 -->
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { queryRoomInfoByCode } from '@/service/room-list'
const isShow = defineModel(false)
const num = ref('')
const router = useRouter()
const handleKeyClick = async (e) => {
  if (num.value.length === 6) return
  if (e.target.innerText === '重输') {
    num.value = ''
  } else if (e.target.innerText === '删除') {
    num.value = num.value.slice(0, -1)
  } else {
    num.value += e.target.innerText
  }
  if (num.value.length === 6) {
    const res = await queryRoomInfoByCode(num.value)
    if (res.code !== 200) return
    router.push('/room/in/' + res.data.id)
  }
}

const handleClose = () => {
  num.value = ''
  isShow.value = false
}
</script>

<style scoped lang="less">
.wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 9;
  background: #0005;
}
.keybord {
  width: 300px;
  height: 220px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  position: absolute;
  border: 1px solid #ffff;
  border-radius: 3px;
  box-shadow: 0 0 5px 0px #999;
  overflow: hidden;
  user-select: none;
  background: #fff;
  .header {
    height: 26px;
    display: flex;
    justify-content: center;
    position: relative;
    background-color: green;
    .title {
      background: red;
      display: flex;
      align-items: center;
      padding: 0 36px;
      color: #fff;
      // 梯形
    }
    .close {
      position: absolute;
      right: 0;
      top: 0;
      height: 100%;
      background: red;
      border-bottom-left-radius: 3px;
      display: flex;
      cursor: pointer;
    }
  }
  .number {
    width: 80%;
    margin: 5px auto;
    height: 26px;
    background: #333;
    border-radius: 2px;
    display: flex;
    justify-content: space-between;
    .num {
      width: 16%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      color: #fff;
    }
  }
  .keys {
    position: relative;
    z-index: 9;
    display: flex;
    flex-direction: column;
    padding: 0 10px;
    gap: 10px;
    pointer-events: none;
    & > div {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 10px;
    }
    .key {
      width: 120px;
      height: 30px;
      background: #000;
      border-radius: 3px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      color: #fff;
      cursor: pointer;
      pointer-events: all;
    }
  }
}
</style>
