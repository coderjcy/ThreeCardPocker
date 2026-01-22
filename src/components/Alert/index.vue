<template>
  <div class="game-alert" v-if="isShow">
    <div class="alert-content">
      <div class="alert-title">
        <span style="margin-right: 10px">⚠️</span>
        {{ title }}
      </div>
      <div class="alert-message">{{ message }}</div>
    </div>
    <div class="alert-btn">
      <div class="btn" @click="confirmAlert">{{ confirmText }}</div>
      <div class="btn" @click="cancelAlert">{{ cancelText }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const isShow = ref(false)
const title = ref('')
const message = ref('')

const confirmAlert = () => {
  if (confirmCallbak) confirmCallbak()
  isShow.value = false
}
const cancelAlert = () => {
  isShow.value = false
}
let confirmCallbak: () => void
const confirmText = ref('确定')
const cancelText = ref('取消')
const open = (_title: string, _message: string, config: any) => {
  isShow.value = true
  title.value = _title
  message.value = _message
  if (config.confirmButtonText) confirmText.value = config.confirmButtonText
  if (config.cancelButtonText) cancelText.value = config.cancelButtonText
  if (config.confirmCallback) confirmCallbak = config.confirmCallback
}
defineExpose({ open })
</script>

<style scoped lang="less">
.game-alert {
  width: 42vw;
  height: 24vw;
  left: 50%;
  top: 40%;
  background: linear-gradient(135deg, #2d3748, #1a202c);
  border: 2px solid #63b3ed;
  border-radius: 12px;
  padding: 24px;
  color: #fff;
  box-shadow: 0 0 30px rgba(99, 179, 237, 0.6);
  position: fixed;
  z-index: 999;
  transform: translate(-50%, -50%) scale(0.9);
  transition: transform 0.3s ease;
  display: flex;
  flex-direction: column;
}
.alert-content {
  margin-bottom: 20px;
  flex: 1;
  text-align: center;
}
.alert-title {
  font-size: 2.8vw;
  font-weight: bold;
  margin-bottom: 20px;
}
.alert-message {
  font-size: 2vw;
}
.alert-btn {
  display: flex;
  justify-content: space-evenly;
}
.btn {
  width: 8vw;
  height: 3.8vw;
  display: flex;
  justify-content: center;
  align-items: center;
  letter-spacing: 2px;
  margin-left: 10px;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  background-color: #95a6a6;
}
.btn:first-child {
  margin-left: 0;
  background-color: #3498db;
}
</style>
