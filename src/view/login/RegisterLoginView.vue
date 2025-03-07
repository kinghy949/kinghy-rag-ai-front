<template>
  <div class="login-container">
    <el-form v-if="!isLoggedIn" :model="loginForm" ref="formRef" label-width="100px">
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

    <div v-else class="welcome-container">
      <h1>欢迎使用基于RAG技术的个人知识库AI问答系统</h1>
      <div class="user-profile">
        <el-dropdown @command="handleCommand">
          <el-avatar :size="50" :src="avatarUrl" @error="() => true">
            {{ userInfo.userName?.charAt(0)?.toUpperCase() }}
          </el-avatar>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile">个人信息</el-dropdown-item>
              <el-dropdown-item command="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <!-- 个人信息对话框 -->
    <el-dialog
      v-model="profileDialogVisible"
      title="个人信息"
      width="30%"
    >
      <div class="user-info">
        <p><strong>姓名：</strong>{{ userInfo.name }}</p>
        <p><strong>用户名：</strong>{{ userInfo.userName }}</p>
        <p><strong>手机号：</strong>{{ userInfo.phone }}</p>
        <p><strong>性别：</strong>{{ userInfo.sex }}</p>
        <p><strong>身份证号：</strong>{{ userInfo.idNumber }}</p>
        <p><strong>创建时间：</strong>{{ userInfo.createTime }}</p>
      </div>
    </el-dialog>

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
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import router from '@/router'
import { BASE_URL } from '@/http/config'

interface UserInfo {
  id: number;
  name: string;
  userName: string;
  password: string;
  phone: string;
  sex: string;
  idNumber: string;
  status: number;
  createTime: string;
  updateTime: string;
  createUser: string | null;
  updateUser: string | null;
}

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
const isLoggedIn = ref(false)
const userInfo = ref<UserInfo>({
  id: 0,
  name: '',
  userName: '',
  password: '',
  phone: '',
  sex: '',
  idNumber: '',
  status: 1,
  createTime: '',
  updateTime: '',
  createUser: null,
  updateUser: null
})
const profileDialogVisible = ref(false)
const avatarUrl = ref('')

const fetchUserInfo = async () => {
  try {
    const token = localStorage.getItem('token')
    if (!token) return

    const response = await fetch(BASE_URL + '/user/1896504025411887106', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    const data = await response.json()
    if (data.code === 0) {
      userInfo.value = data.data
      isLoggedIn.value = true
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
  }
}

const handleCommand = (command: string) => {
  if (command === 'profile') {
    profileDialogVisible.value = true
  } else if (command === 'logout') {
    localStorage.removeItem('token')
    localStorage.removeItem('userRole')
    isLoggedIn.value = false
    userInfo.value = {
      id: 0,
      name: '',
      userName: '',
      password: '',
      phone: '',
      sex: '',
      idNumber: '',
      status: 1,
      createTime: '',
      updateTime: '',
      createUser: null,
      updateUser: null
    }
    router.push('/login')
    ElMessage({ message: '已成功退出登录', type: 'success' })
  }
}

const handleLogin = async () => {
  try {
    const response = await fetch(BASE_URL+`/user/login?userName=${loginForm.value.userName}&password=${loginForm.value.password}`, {
      method: 'POST',
    })
    const data = await response.json()
    if (data.code === 0) {
      localStorage.setItem('token', data.data.token)
      localStorage.setItem('userRole', data.data.userName)
      ElMessage({ message: '登录成功', type: 'success' })
      await fetchUserInfo()
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

onMounted(() => {
  const token = localStorage.getItem('token')
  if (token) {
    fetchUserInfo()
  }
})
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

.welcome-container {
  text-align: center;

  h1 {
    margin-bottom: 20px;
    color: #409EFF;
  }
}

.user-profile {
  margin-top: 20px;
  cursor: pointer;
}

.user-info {
  p {
    margin: 10px 0;
    font-size: 14px;
  }
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