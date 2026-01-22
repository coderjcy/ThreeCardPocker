<template>
  <div class="login">
    <div class="form_area">
      <p class="title">登录</p>
      <form onsubmit="return false">
        <div class="form_group">
          <label class="sub_title" for="name">账号</label>
          <input
            v-model="userInfo.username"
            placeholder="请输入账号"
            class="form_style"
            type="text"
          />
        </div>
        <div class="form_group">
          <label class="sub_title" for="password">密码</label>
          <input
            v-model="userInfo.password"
            placeholder="请输入密码"
            id="password"
            class="form_style"
            type="password"
          />
        </div>
        <div>
          <button class="btn" @click="handleLogin">登录</button>
          <p>
            忘记密码?
            <a class="link" @click="$router.push('/reset')">点击重置密码!</a>
          </p>
          <p>没有账号? <a class="link" @click="$router.push('/sign-up')">去注册!</a></p>
          <a class="link" href=""> </a>
        </div>
        <a class="link" href=""> </a>
      </form>
    </div>
    <a class="link" href=""> </a>
  </div>
</template>
<script setup>
import { reactive, getCurrentInstance } from 'vue'
import { login } from '@/service/login'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import useUserStore from '@/store/user'
const proxy = getCurrentInstance().proxy
const userStore = useUserStore()
const userInfo = reactive({
  username: undefined,
  password: undefined
})

const router = useRouter()
const handleLogin = async () => {
  if (!userInfo.username) return proxy.$message.warning('请输入账号')
  if (!userInfo.password) return proxy.$message.warning('请输入密码')

  const res = await login(userInfo)
  localStorage.setItem('token', res.data.token)
  localStorage.setItem('userInfo', JSON.stringify(res.data))
  userStore.userInfo = res.data
  ElMessage.success('登录成功')
  router.push('/room/list')
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
  color: #fff;

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
a {
  cursor: pointer;
}
</style>
