<template>
  <div class="login">
    <div class="form_area">
      <p class="title">SIGN UP</p>
      <form action="">
        <div class="form_group">
          <label class="sub_title" for="name">Name</label>
          <input placeholder="Enter your full name" class="form_style" type="text" />
        </div>
        <div class="form_group">
          <label class="sub_title" for="email">Email</label>
          <input placeholder="Enter your email" id="email" class="form_style" type="email" />
        </div>
        <div class="form_group">
          <label class="sub_title" for="password">Password</label>
          <input
            placeholder="Enter your password"
            id="password"
            class="form_style"
            type="password"
          />
        </div>
        <div>
          <button class="btn" @click="handle">SIGN UP</button>
          <p>Have an Account? <a class="link" @click="$router.push('/login')">Login Here!</a></p>
          <a class="link" href=""> </a>
        </div>
        <a class="link" href=""> </a>
      </form>
    </div>
    <a class="link" href=""> </a>
  </div>
</template>
<script setup lang="ts">
import { reactive } from 'vue'
import { ElForm } from 'element-plus'
import { login } from '@/service/login'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import useUserStores from '@/store/user'
const userStore = useUserStores()
const userInfo = reactive({
  username: undefined,
  password: undefined
})
const rules = {
  username: [
    {
      required: true,
      trigger: 'blur',
      message: '请输入账号'
    }
  ],
  password: [
    {
      required: true,
      trigger: 'blur',
      message: '请输入密码'
    }
  ]
}
const router = useRouter()
const handleLogin = async (formRef: InstanceType<typeof ElForm>) => {
  const isPass = await formRef.validate((v: any) => v)
  if (!isPass) return
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
