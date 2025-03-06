<template>
  <div class="sensitive-manage">
    <el-card class="box-card">
      <!-- 工具栏 -->
      <div class="table-header">
        <el-button type="primary" @click="handleAdd">新增敏感词</el-button>
        <el-button 
          type="danger" 
          :disabled="selectedIds.length === 0" 
          @click="handleBatchDelete"
        >
          批量删除
        </el-button>
      </div>
      
      <!-- 表格 -->
      <div class="table-container">
        <el-table 
          :data="sensitiveList" 
          style="width: 100%" 
          border
          height="calc(95vh - 180px)"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column prop="word" label="敏感词" width="180" />
          <el-table-column prop="category" label="类别" width="120">
            <template #default="scope">
              <el-tag>{{ scope.row.category === '1' ? '违禁词' : '其他' }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="120">
            <template #default="scope">
              <el-tag :type="scope.row.status === '1' ? 'success' : 'danger'">
                {{ scope.row.status === '1' ? '启用' : '禁用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" label="创建时间" width="180" />
          <el-table-column prop="updatedAt" label="更新时间" width="180" />
          <el-table-column label="操作" width="120" fixed="right">
            <template #default="scope">
              <el-button type="danger" size="small" @click="handleDelete(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="queryParams.page"
          v-model:page-size="queryParams.size"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 新增敏感词对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="新增敏感词"
      width="500px"
    >
      <el-form
        ref="formRef"
        :model="sensitiveForm"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="敏感词" prop="word">
          <el-input v-model="sensitiveForm.word" placeholder="请输入敏感词" />
        </el-form-item>
        <el-form-item label="类别" prop="category">
          <el-select v-model="sensitiveForm.category" placeholder="请选择类别">
            <el-option label="违禁词" value="1" />
            <el-option label="其他" value="2" />
          </el-select>
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
import type { FormInstance, FormRules } from 'element-plus'
import { 
  querySensitiveApi, 
  addSensitiveApi, 
  batchDeleteSensitiveApi,
  type SensitiveInfo 
} from '@/api/SensitiveApi'

const sensitiveList = ref<SensitiveInfo[]>([])
const total = ref(0)
const selectedIds = ref<number[]>([])
const dialogVisible = ref(false)
const formRef = ref<FormInstance>()

// 查询参数
const queryParams = ref({
  page: 1,
  size: 10
})

// 表单数据
const sensitiveForm = ref({
  word: '',
  category: '1'
})

// 表单验证规则
const formRules: FormRules = {
  word: [
    { required: true, message: '请输入敏感词', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '请选择类别', trigger: 'change' }
  ]
}

// 加载敏感词列表
const loadSensitiveList = async () => {
  try {
    const params = { 
      page: queryParams.value.page - 1,
      size: queryParams.value.size
    }
    const res = await querySensitiveApi(params)
    if (res.code === 0) {
      sensitiveList.value = res.data.records
      total.value = res.data.total
    } else {
      ElMessage.error(res.message || '获取敏感词列表失败')
    }
  } catch (error) {
    console.error('获取敏感词列表错误:', error)
    ElMessage.error('获取敏感词列表失败')
  }
}

// 处理多选
const handleSelectionChange = (selection: SensitiveInfo[]) => {
  selectedIds.value = selection.map(item => item.id)
}

// 新增敏感词
const handleAdd = () => {
  sensitiveForm.value = {
    word: '',
    category: '1'
  }
  dialogVisible.value = true
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const res = await addSensitiveApi(sensitiveForm.value)
        if (res.code === 0) {
          ElMessage.success('添加成功')
          dialogVisible.value = false
          loadSensitiveList()
        } else {
          ElMessage.error(res.message || '添加失败')
        }
      } catch (error) {
        console.error('添加敏感词错误:', error)
        ElMessage.error('添加失败')
      }
    }
  })
}

// 删除单个敏感词
const handleDelete = (row: SensitiveInfo) => {
  handleBatchDelete([row.id])
}

// 批量删除
const handleBatchDelete = (ids?: number[]) => {
  const deleteIds = ids || selectedIds.value
  if (deleteIds.length === 0) return
  
  ElMessageBox.confirm(
    `确定要删除选中的 ${deleteIds.length} 条敏感词吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(async () => {
    try {
      const res = await batchDeleteSensitiveApi(deleteIds)
      if (res.code === 0) {
        ElMessage.success('删除成功')
        loadSensitiveList()
      } else {
        ElMessage.error(res.message || '删除失败')
      }
    } catch (error) {
      console.error('删除敏感词错误:', error)
      ElMessage.error('删除失败')
    }
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

// 分页处理
const handleSizeChange = (val: number) => {
  queryParams.value.size = val
  queryParams.value.page = 1
  loadSensitiveList()
}

const handleCurrentChange = (val: number) => {
  queryParams.value.page = val
  loadSensitiveList()
}

onMounted(() => {
  loadSensitiveList()
})
</script>

<style scoped lang="less">
.sensitive-manage {
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