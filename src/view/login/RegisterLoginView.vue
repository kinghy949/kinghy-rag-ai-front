<template>
  <div class="login-container">
    <el-form 
      v-if="!isLoggedIn" 
      :model="loginForm" 
      ref="formRef" 
      label-width="100px"
      v-loading="isLoading"
      element-loading-text="处理中..."
      element-loading-background="rgba(255, 255, 255, 0.8)"
    >
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
      <h1 class="welcome-title">欢迎使用基于RAG技术的个人知识库AI问答系统</h1>
      <div class="user-profile">
        <el-dropdown @command="handleCommand">
          <el-avatar :size="50" :src="avatarUrl" @error="() => true">
            {{ userInfo.userName?.charAt(0)?.toUpperCase() }}
          </el-avatar>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile">个人信息</el-dropdown-item>
              <el-dropdown-item command="password">修改密码</el-dropdown-item>
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
      width="500px"
      :close-on-click-modal="false"
    >
      <div class="user-info" v-if="!isEditing">
        <div class="info-item">
          <span class="info-label"><el-icon><User /></el-icon> 姓名</span>
          <span class="info-value">{{ userInfo.name }}</span>
        </div>
        <div class="info-item">
          <span class="info-label"><el-icon><UserFilled /></el-icon> 用户名</span>
          <span class="info-value">{{ userInfo.userName }}</span>
        </div>
        <div class="info-item">
          <span class="info-label"><el-icon><Iphone /></el-icon> 手机号</span>
          <span class="info-value">{{ userInfo.phone }}</span>
        </div>
        <div class="info-item">
          <span class="info-label"><el-icon><Male /></el-icon> 性别</span>
          <span class="info-value">{{ userInfo.sex }}</span>
        </div>
        <div class="info-item">
          <span class="info-label"><el-icon><Document /></el-icon> 身份证号</span>
          <span class="info-value">{{ userInfo.idNumber }}</span>
        </div>
        <div class="info-item">
          <span class="info-label"><el-icon><Timer /></el-icon> 创建时间</span>
          <span class="info-value">{{ userInfo.createTime }}</span>
        </div>
        <div class="info-item">
          <el-button type="primary" @click="showPasswordDialog">修改密码</el-button>
        </div>
      </div>

      <el-form v-else :model="editForm" ref="editFormRef" label-width="100px">
        <el-form-item label="用户名" prop="userName">
          <el-input v-model="editForm.userName" placeholder="请输入用户名"></el-input>
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="editForm.name" placeholder="请输入姓名"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="editForm.phone" placeholder="请输入手机号"></el-input>
        </el-form-item>
        <el-form-item label="性别" prop="sex">
          <el-select v-model="editForm.sex" placeholder="请选择性别">
            <el-option label="男" value="男"></el-option>
            <el-option label="女" value="女"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="身份证号" prop="idNumber">
          <el-input v-model="editForm.idNumber" placeholder="请输入身份证号"></el-input>
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <template v-if="!isEditing">
            <el-button @click="profileDialogVisible = false">关闭</el-button>
            <el-button type="primary" @click="startEdit">修改</el-button>
          </template>
          <template v-else>
            <el-button @click="cancelEdit">取消</el-button>
            <el-button type="primary" @click="handleUpdate">保存</el-button>
          </template>
        </span>
      </template>
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

    <!-- 修改密码对话框 -->
    <el-dialog
      v-model="passwordDialogVisible"
      title="修改密码"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="passwordFormRef"
        :model="passwordForm"
        :rules="passwordRules"
        label-width="100px"
      >
        <el-form-item label="原密码" prop="oldPassword">
          <el-input v-model="passwordForm.oldPassword" type="password" placeholder="请输入原密码" />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="passwordForm.newPassword" type="password" placeholder="请输入新密码" />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="passwordForm.confirmPassword" type="password" placeholder="请再次输入新密码" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="passwordDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleUpdatePassword">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {ElMessage, FormInstance, FormRules} from 'element-plus'
import { User, UserFilled, Iphone, Male, Document, Timer } from '@element-plus/icons-vue'
import router from '@/router'
import { BASE_URL } from '@/http/config'
import { updatePasswordApi } from '@/api/UserApi'

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
const isLoading = ref(false)
const isEditing = ref(false)
const editForm = ref({
  id: 0,
  userName: '',
  name: '',
  phone: '',
  sex: '',
  idNumber: ''
})
const passwordDialogVisible = ref(false)
const passwordFormRef = ref<FormInstance>()
const passwordForm = ref({
  id: 0,
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const fetchUserInfo = async () => {
  try {
    const token = localStorage.getItem('token')
    const userId = localStorage.getItem('userId')
    if (!token || !userId) return
    const response = await fetch(BASE_URL + `/user/${userId}`, {
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
  } else if (command === 'password') {
    showPasswordDialog()
  } else if (command === 'logout') {
    localStorage.removeItem('token')
    localStorage.removeItem('userRole')
    localStorage.removeItem('userId')
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
    isLoading.value = true
    const response = await fetch(BASE_URL+`/user/login?userName=${loginForm.value.userName}&password=${loginForm.value.password}`, {
      method: 'POST',
    })
    const data = await response.json()
    if (data.code === 0) {
      localStorage.setItem('token', data.data.token)
      localStorage.setItem('userRole', data.data.userName)
      localStorage.setItem('userId',data.data.id)

      ElMessage({ message: '登录成功', type: 'success' })
      await fetchUserInfo()
      router.push('/login')
    } else {
      ElMessage({ message: data.message, type: 'error' })
    }
  } catch (error) {
    console.error('登录错误:', error)
    ElMessage({ message: '登录失败，请稍后重试', type: 'error' })
  } finally {
    isLoading.value = false
  }
}

const handleRegister = async () => {
  try {
    isLoading.value = true
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
  } finally {
    isLoading.value = false
  }
}

const showRegisterDialog = () => {
  registerDialogVisible.value = true
}

const startEdit = () => {
  editForm.value = {
    id: userInfo.value.id,
    userName: userInfo.value.userName,
    name: userInfo.value.name,
    phone: userInfo.value.phone,
    sex: userInfo.value.sex,
    idNumber: userInfo.value.idNumber
  }
  isEditing.value = true
}

const cancelEdit = () => {
  isEditing.value = false
}

const handleUpdate = async () => {
  try {
    isLoading.value = true
    const token = localStorage.getItem('token')
    const response = await fetch(BASE_URL + '/user/update', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(editForm.value)
    })
    const data = await response.json()
    if (data.code === 0) {
      ElMessage({ message: '更新成功', type: 'success' })
      await fetchUserInfo() // 重新获取用户信息
      isEditing.value = false
    } else {
      ElMessage({ message: data.message || '更新失败', type: 'error' })
    }
  } catch (error) {
    console.error('更新用户信息失败:', error)
    ElMessage({ message: '更新失败，请稍后重试', type: 'error' })
  } finally {
    isLoading.value = false
  }
}

// 密码表单验证规则
const passwordRules: FormRules = {
  oldPassword: [
    { required: true, message: '请输入原密码', trigger: 'blur' },
    { min: 5, max: 20, message: '密码长度在 5 到 20 个字符', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 5, max: 20, message: '密码长度在 5 到 20 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    { min: 5, max: 20, message: '密码长度在 5 到 20 个字符', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.value.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 显示修改密码对话框
const showPasswordDialog = () => {
  passwordForm.value = {
    id: userInfo.value.id,
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  }
  passwordDialogVisible.value = true
}

// 处理修改密码
const handleUpdatePassword = async () => {
  if (!passwordFormRef.value) return
  
  await passwordFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        isLoading.value = true
        const response = await updatePasswordApi(passwordForm.value)
        if (response.code === 0) {
          ElMessage.success('密码修改成功')
          passwordDialogVisible.value = false
          // 清空表单
          passwordForm.value = {
            id: userInfo.value.id,
            oldPassword: '',
            newPassword: '',
            confirmPassword: ''
          }
        } else {
          ElMessage.error(response.message || '密码修改失败')
        }
      } catch (error) {
        console.error('修改密码失败:', error)
        ElMessage.error('密码修改失败，请稍后重试')
      } finally {
        isLoading.value = false
      }
    }
  })
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
  width: 100%;
  position: relative;

  h1 {
    margin-bottom: 80px;
    color: #409EFF;
    font-size: 45px;
  }
}

.user-profile {
  position: fixed;
  top: 20px;
  right: 20px;
  cursor: pointer;
  z-index: 1000;
  color: #409EFF;
}

.user-info {
  padding: 20px;
  
  .info-item {
    display: flex;
    align-items: center;
    margin-bottom: 15px;
    padding: 10px;
    border-radius: 4px;
    background-color: #f5f7fa;
    
    .info-label {
      width: 80px;
      color: #909399;
      font-size: 14px;
    }
    
    .info-value {
      color: #303133;
      font-size: 14px;
      flex: 1;
    }
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