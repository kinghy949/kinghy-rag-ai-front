<template>
  <div class="login-container">
    <el-form :model="loginForm" ref="formRef" label-width="100px">
      <el-form-item label="用户名" prop="userName" :rules="[{ required: true, message: '请输入用户名', trigger: 'blur' }]">
        <el-input v-model="loginForm.userName" placeholder="请输入用户名"></el-input>
      </el-form-item>
      <el-form-item label="密码" prop="password" :rules="[{ required: true, message: '请输入密码', trigger: 'blur' }]">
        <el-input v-model="loginForm.password" type="password" placeholder="请输入密码"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleLogin">登录</el-button>
        <el-button type="success" @click="showRegisterDialog">注册</el-button>
      </el-form-item>
    </el-form>

    <el-dialog 
      v-model="registerDialogVisible"
      title="注册" 
      width="30%"
      :close-on-click-modal="false"
    >
      <el-form :model="registerForm" ref="registerFormRef" label-width="100px">
        <el-form-item label="用户名" prop="userName" :rules="[{ required: true, message: '请输入用户名', trigger: 'blur' }]">
          <el-input v-model="registerForm.userName" placeholder="请输入用户名"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password" :rules="[{ required: true, message: '请输入密码', trigger: 'blur' }]">
          <el-input v-model="registerForm.password" type="password" placeholder="请输入密码"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="phone" :rules="[{ required: true, message: '请输入手机号', trigger: 'blur' }]">
          <el-input v-model="registerForm.phone" placeholder="请输入手机号"></el-input>
        </el-form-item>
        <el-form-item label="姓名" prop="name" :rules="[{ required: true, message: '请输入姓名', trigger: 'blur' }]">
          <el-input v-model="registerForm.name" placeholder="请输入姓名"></el-input>
        </el-form-item>
        <el-form-item label="性别" prop="sex">
          <el-select v-model="registerForm.sex" placeholder="请选择性别">
            <el-option label="男" value="男"></el-option>
            <el-option label="女" value="女"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="身份证号" prop="idNumber" :rules="[{ required: true, message: '请输入身份证号', trigger: 'blur' }]">
          <el-input v-model="registerForm.idNumber" placeholder="请输入身份证号"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="registerDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleRegister">注册</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import router from '@/router'
import { BASE_URL } from '@/http/config'
import { useChatOptionsStore } from '@/store/options'

const loginForm = ref({
  userName: '',
  password: '',
})

const registerForm = ref({
  name: '',
  userName: '',
  password: '',
  phone: '',
  sex: '男',
  idNumber: '',
  status: 1
})

const registerDialogVisible = ref(false)


const handleLogin = async () => {
  try {
    const response = await fetch(BASE_URL+`/user/login?userName=${loginForm.value.userName}&password=${loginForm.value.password}`, {
      method: 'POST',
    })
    const data = await response.json()
    if (data.code === 0) {
      localStorage.setItem('token', data.data.token)
      ElMessage({ message: '登录成功', type: 'success' })
      router.push('/')
    } else {
      ElMessage({ message: data.message, type: 'error' })
    }
  } catch (error) {
    console.error('登录错误:', error)
    ElMessage({ message: '登录失败，请稍后重试', type: 'error' })
  }
}

const handleRegister = async () => {
  try {
    const response = await fetch(BASE_URL+'/user/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(registerForm.value),
    })
    const data = await response.json()
    if (data.code === 0) {
      ElMessage({ message: '注册成功', type: 'success' })
      registerDialogVisible.value = false
      // 清空注册表单
      registerForm.value = {
        name: '',
        userName: '',
        password: '',
        phone: '',
        sex: '男',
        idNumber: '',
        status: 1
      }
    } else {
      ElMessage({ message: data.message, type: 'error' })
    }
  } catch (error) {
    console.error('注册错误:', error)
    ElMessage({ message: '注册失败，请稍后重试', type: 'error' })
  }
}

const showRegisterDialog = () => {
  registerDialogVisible.value = true
}
</script>

<style scoped lang="less">
.login-container {
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f5f5;
}

.el-form {
  width: 400px;
  padding: 20px;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style> 