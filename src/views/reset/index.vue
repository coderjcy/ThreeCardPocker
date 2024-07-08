<template>
  <div class="reset">
    <div class="form_area">
      <p class="title">RESET PASSWORD</p>
      <form action="">
        <div class="form_group">
          <label class="sub_title" for="name">Email</label>
          <input
            :disabled="userInfo.id"
            v-model="userInfo.email"
            placeholder="Enter your email"
            class="form_style"
            type="email"
          />
        </div>
        <div v-if="isSendCode" class="form_group">
          <label class="sub_title" for="name">Password</label>
          <input
            v-model="userInfo.password"
            placeholder="Enter your password"
            class="form_style"
            type="text"
          />
        </div>
        <div v-if="isSendCode" class="form_group">
          <label class="sub_title" for="name">Code</label>
          <input
            v-model="userInfo.code"
            placeholder="Enter your code"
            class="form_style"
            type="text"
          />
        </div>
        <div>
          <button v-if="!isSendCode" class="btn" @click="getVerifyCode">GET CODE</button>
          <button v-else class="btn" @click="submitReset">RESET PASSWORD</button>
          <a class="link" href=""> </a>
        </div>
        <a class="link" href=""> </a>
      </form>
    </div>
    <a class="link" href=""> </a>
  </div>
</template>
<script setup lang="ts">
import { reactive, getCurrentInstance, ref } from 'vue'
import { applyVerifyCode, resetPassword } from '@/service/login'

import { useRouter } from 'vue-router'

const proxy = getCurrentInstance()!.proxy!

const userInfo = reactive({
  id: undefined,
  email: undefined,
  code: undefined,
  password: undefined
})
const isSendCode = ref(false)

const router = useRouter()
const getVerifyCode = () => {
  if (!userInfo.email) return proxy.$message.warning('请输入您的邮箱账号')

  applyVerifyCode(userInfo.email).then((res: any) => {
    userInfo.id = res.data.userId
    isSendCode.value = true
    proxy.$message.success('验证码发送成功！')
  })
}
const submitReset = async () => {
  if (!userInfo.password) return proxy.$message.warning('请输入您的新密码')
  if (!userInfo.code) return proxy.$message.warning('请输入验证码')

  await resetPassword({
    userId: userInfo.id,
    code: userInfo.code,
    password: userInfo.password
  })
  proxy.$message.success('密码修改成功')
  setTimeout(() => router.push('/login'), 1000)
}
</script>
<style lang="less" scoped>
.reset {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  text-align: center;
  height: 100vh;
}

.form_area {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  background-color: #eddcd9;
  height: auto;
  width: auto;
  border: 2px solid #264143;
  border-radius: 20px;
  box-shadow: 3px 4px 0px 1px #e99f4c;
}

.title {
  color: #264143;
  font-weight: 900;
  font-size: 1.5em;
  margin-top: 20px;
}

.sub_title {
  font-weight: 600;
  margin: 5px 0;
}

.form_group {
  display: flex;
  flex-direction: column;
  align-items: baseline;
  margin: 10px;
}

.form_style {
  outline: none;
  border: 2px solid #264143;
  box-shadow: 3px 4px 0px 1px #e99f4c;
  width: 290px;
  padding: 12px 10px;
  border-radius: 4px;
  font-size: 15px;
}

.form_style:focus,
.btn:focus {
  transform: translateY(4px);
  box-shadow: 1px 2px 0px 0px #e99f4c;
}

.btn {
  padding: 15px;
  margin: 25px 0px;
  width: 290px;
  font-size: 15px;
  background: #de5499;
  border-radius: 10px;
  font-weight: 800;
  box-shadow: 3px 3px 0px 0px #e99f4c;
}

.btn:hover {
  opacity: 0.9;
}

.link {
  font-weight: 800;
  color: #264143;
  padding: 5px;
}
</style>
