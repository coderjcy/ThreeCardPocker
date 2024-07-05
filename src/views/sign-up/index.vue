<template>
  <div class="login">
    <div class="form_area">
      <p class="title">Sign Up</p>
      <form>
        <div class="form_group">
          <label class="sub_title" for="name">Name</label>
          <input
            v-model="userInfo.username"
            placeholder="Enter your full name"
            class="form_style"
            type="text"
          />
        </div>
        <div class="form_group">
          <label class="sub_title" for="email">Email</label>
          <input
            v-model="userInfo.email"
            placeholder="Enter your email"
            id="email"
            class="form_style"
            type="email"
          />
        </div>
        <div class="form_group">
          <label class="sub_title" for="password">Password</label>
          <input
            autocomplete="off"
            v-model="userInfo.password"
            placeholder="Enter your password"
            id="password"
            class="form_style"
            type="password"
          />
        </div>
        <div>
          <button class="btn" @click="handleLogin">Sign Up</button>

          <p>Has Account? <a class="link" @click="$router.push('/login')">Login Here!</a></p>
          <a class="link" href=""> </a>
        </div>
        <a class="link" href=""> </a>
      </form>
    </div>
    <a class="link" href=""> </a>
  </div>
</template>
<script setup lang="ts">
import { reactive, getCurrentInstance } from 'vue'
import { signUp } from '@/service/login'
import { useRouter } from 'vue-router'

const proxy = getCurrentInstance().proxy

const userInfo = reactive({
  username: undefined,
  password: undefined,
  email: undefined
})
const router = useRouter()
const handleLogin = async () => {
  if (!userInfo.username) return proxy.$message.warning('请输入账号')
  if (!userInfo.email) return proxy.$message.warning('请输入邮箱')
  if (!userInfo.password) return proxy.$message.warning('请输入密码')
  await signUp(userInfo)
  proxy.$message.success('注册成功')
  userInfo.email = undefined
  userInfo.password = undefined
  userInfo.username = undefined
  setTimeout(() => router.push('/login'), 1000)
}
</script>
<style lang="less" scoped>
.login {
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
