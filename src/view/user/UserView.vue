<template>
  <div class="user-manage">
    <el-card class="box-card">
      <div class="table-header">
        <el-button type="primary" @click="handleAdd">新增用户</el-button>
      </div>
      
      <div class="table-container">
        <el-table 
          v-loading="isLoading"
          element-loading-text="加载中..."
          element-loading-background="rgba(255, 255, 255, 0.8)"
          :data="userList" 
          style="width: 100%" 
          border
          height="calc(95vh - 180px)"
        >
          <el-table-column prop="name" label="姓名" width="120"/>
          <el-table-column prop="userName" label="用户名" width="120"/>
          <el-table-column prop="phone" label="手机号" width="130"/>
          <el-table-column prop="sex" label="性别" width="90"/>
          <el-table-column prop="idNumber" label="身份证号" width="190" />
          <el-table-column prop="status" label="状态" width="130">
            <template #default="scope">
              <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
                {{ scope.row.status === 1 ? '启用' : '禁用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="创建时间" width="120"/>
          <el-table-column label="操作" width="250" fixed="right">
            <template #default="scope">
              <el-button type="primary" size="small" @click="handleEdit(scope.row)">编辑</el-button>
              <el-button type="danger" size="small" @click="handleDelete(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 30, 40]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 用户信息对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500px"
    >
      <el-form
        ref="userFormRef"
        :model="userForm"
        :rules="isEdit ? editRules : userRules"
        label-width="100px"
      >
        <el-form-item label="姓名" prop="name">
          <el-input v-model="userForm.name" />
        </el-form-item>
        <el-form-item label="用户名" prop="userName">
          <el-input v-model="userForm.userName" />
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="!isEdit">
          <el-input v-model="userForm.password" type="password" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="userForm.phone" />
        </el-form-item>
        <el-form-item label="性别" prop="sex">
          <el-radio-group v-model="userForm.sex">
            <el-radio label="男">男</el-radio>
            <el-radio label="女">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="身份证号" prop="idNumber">
          <el-input v-model="userForm.idNumber" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { queryFileApi, registerUserApi, updateUserApi } from '@/api/UserApi'
import { QueryFileDto } from "@/api/dto.ts"
import type { FormInstance, FormRules } from 'element-plus'

interface UserInfo {
  id: number
  name: string
  userName: string
  password: string
  phone: string
  sex: string
  idNumber: string
  status: number
  createTime: string
  updateTime: string
  createUser: string | null
  updateUser: string | null
}
const queryFileDto = ref<QueryFileDto>({
  page: 1,
  pageSize: 10,
  fileName: "",
});
const userList = ref<UserInfo[]>([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const isLoading = ref(false);

const dialogVisible = ref(false)
const dialogTitle = ref('新增用户')
const userFormRef = ref<FormInstance>()

const userForm = ref({
  name: '',
  userName: '',
  password: '',
  phone: '',
  sex: '男',
  idNumber: ''
})

const isEdit = ref(false)
const currentUserId = ref<number | null>(null)

// 表单验证规则
const userRules: FormRules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  userName: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  sex: [{ required: true, message: '请选择性别', trigger: 'change' }],
  idNumber: [
    { required: true, message: '请输入身份证号', trigger: 'blur' },
    { pattern: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/, message: '请输入正确的身份证号', trigger: 'blur' }
  ]
}

// 编辑模式的表单验证规则（不需要密码验证）
const editRules: FormRules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  userName: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  sex: [{ required: true, message: '请选择性别', trigger: 'change' }],
  idNumber: [
    { required: true, message: '请输入身份证号', trigger: 'blur' },
    { pattern: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/, message: '请输入正确的身份证号', trigger: 'blur' }
  ]
}

// 获取用户列表
const loadStoreFileData = () => {
  isLoading.value = true;
  const params = { ...queryFileDto.value, page: queryFileDto.value.page - 1 }
  queryFileApi(params)
      .then((res) => {
        if (res.code == 0) {
          const data = res.data;
          total.value = data.total;
          userList.value = data.records;
        } else {
          ElMessage({
            type: "error",
            message: res.message,
          });
        }
      })
      .catch((err) => {
        ElMessage({
          type: "error",
          message: err,
        });
      })
      .finally(() => {
        isLoading.value = false;
      });
};

// 处理页码改变
const handleCurrentChange = (val: number) => {
  currentPage.value = val
  loadStoreFileData()
}

// 处理每页条数改变
const handleSizeChange = (val: number) => {
  pageSize.value = val
  currentPage.value = 1
  loadStoreFileData()
}

// 新增用户
const handleAdd = () => {
  isEdit.value = false
  dialogTitle.value = '新增用户'
  currentUserId.value = null
  userForm.value = {
    name: '',
    userName: '',
    password: '',
    phone: '',
    sex: '男',
    idNumber: ''
  }
  dialogVisible.value = true
}

// 编辑用户
const handleEdit = (row: UserInfo) => {
  isEdit.value = true
  dialogTitle.value = '编辑用户'
  currentUserId.value = row.id
  userForm.value = {
    name: row.name,
    userName: row.userName,
    password: '', // 编辑时不需要密码
    phone: row.phone,
    sex: row.sex,
    idNumber: row.idNumber
  }
  dialogVisible.value = true
}

// 删除用户
const handleDelete = (row: UserInfo) => {
  ElMessageBox.confirm(
    `确定要删除用户 ${row.name} 吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    // TODO: 实现删除用户功能
    ElMessage.info('删除用户功能待实现')
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

// 提交表单
const submitForm = async () => {
  if (!userFormRef.value) return
  
  await userFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        let response
        if (isEdit.value && currentUserId.value) {
          // 编辑用户
          response = await updateUserApi({
            id: currentUserId.value,
            name: userForm.value.name,
            userName: userForm.value.userName,
            phone: userForm.value.phone,
            sex: userForm.value.sex,
            idNumber: userForm.value.idNumber
          })
        } else {
          // 新增用户
          response = await registerUserApi(userForm.value)
        }

        if (response.code === 0) {
          ElMessage.success(isEdit.value ? '编辑用户成功' : '添加用户成功')
          dialogVisible.value = false
          loadStoreFileData() // 刷新用户列表
        } else {
          ElMessage.error(response.message || '操作失败')
        }
      } catch (error) {
        console.error('Error:', error)
        ElMessage.error('操作失败')
      }
    }
  })
}

onMounted(() => {
  loadStoreFileData()
})
</script>

<style scoped lang="less">
.user-manage {
  height: 95vh;
  padding: 20px;
  box-sizing: border-box;
  
  .box-card {
    height: 100%;
    display: flex;
    flex-direction: column;
    
    :deep(.el-card__body) {
      flex: 1;
      display: flex;
      flex-direction: column;
      padding: 20px;
    }
  }

  .table-header {
    margin-bottom: 20px;
  }

  .table-container {
    flex: 1;
    overflow: hidden;
  }

  .pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>
