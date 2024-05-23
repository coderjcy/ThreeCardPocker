<template>
  <el-form ref="formRef" :rules="rules" :model="userInfo">
    <el-form-item label="账号" prop="username">
      <el-input v-model="userInfo.username" placeholder="请输入账号"></el-input>
    </el-form-item>
    <el-form-item label="密码" prop="password">
      <el-input v-model="userInfo.password" placeholder="请输入密码"></el-input>
    </el-form-item>
    <el-button @click="handleLogin($refs.formRef as any)">登录</el-button>
  </el-form>
</template>
<script setup lang="ts">
import { reactive, getCurrentInstance } from 'vue'
import { ElForm } from 'element-plus'
import { login } from '@/service/login'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
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
  localStorage.setItem('token', res.token)
  localStorage.setItem('userInfo', JSON.stringify(res))

  ElMessage.success('登录成功')
  router.push('/room/list')
}
</script>
<style lang="scss" scoped></style>
