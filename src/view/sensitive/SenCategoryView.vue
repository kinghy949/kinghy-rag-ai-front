<template>
  <div class="category-manage">
    <el-card class="box-card">
      <div class="table-header">
        <div class="header-left">
          <el-button type="primary" @click="handleAdd">新增分类</el-button>
          <el-button 
            type="danger" 
            :disabled="!selectedRows.length"
            @click="handleBatchDelete"
          >
            批量删除
          </el-button>
        </div>
      </div>
      
      <div class="table-container">
        <el-table 
          v-loading="isLoading"
          element-loading-text="加载中..."
          element-loading-background="rgba(255, 255, 255, 0.8)"
          :data="categoryList" 
          style="width: 100%" 
          border
          height="calc(95vh - 180px)"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column prop="categoryName" label="分类名称" width="180"/>
          <el-table-column prop="status" label="状态" width="100">
            <template #default="scope">
              <el-tag :type="scope.row.status === '1' ? 'success' : 'danger'">
                {{ scope.row.status === '1' ? '启用' : '禁用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createdTime" label="创建时间" width="180"/>
          <el-table-column prop="updateTime" label="更新时间" width="180"/>
          <el-table-column label="操作" width="200" fixed="right">
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

    <!-- 分类信息对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500px"
    >
      <el-form
        ref="categoryFormRef"
        :model="categoryForm"
        :rules="categoryRules"
        label-width="100px"
      >
        <el-form-item label="分类名称" prop="categoryName">
          <el-input v-model="categoryForm.categoryName" />
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
  addCategoryApi, 
  queryCategoryPageApi, 
  updateCategoryApi,
  batchDeleteCategoryApi,
  type CategoryInfo,
  type CategoryUpdateDto 
} from '@/api/SensitiveApi'

const categoryList = ref<CategoryInfo[]>([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const isLoading = ref(false)
const selectedRows = ref<CategoryInfo[]>([])

const dialogVisible = ref(false)
const dialogTitle = ref('新增分类')
const categoryFormRef = ref<FormInstance>()
const isEdit = ref(false)
const currentId = ref<number | null>(null)

const categoryForm = ref({
  categoryName: ''
})

// 表单验证规则
const categoryRules: FormRules = {
  categoryName: [
    { required: true, message: '请输入分类名称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ]
}

// 加载分类列表
const loadCategoryData = async () => {
  isLoading.value = true
  try {
    const response = await queryCategoryPageApi({
      page: currentPage.value,
      size: pageSize.value
    })
    
    if (response.code === 0) {
      const data = response.data
      categoryList.value = data.records
      total.value = data.total
    } else {
      ElMessage.error(response.message || '获取数据失败')
    }
  } catch (error) {
    console.error('Error:', error)
    ElMessage.error('获取数据失败')
  } finally {
    isLoading.value = false
  }
}

// 处理页码改变
const handleCurrentChange = (val: number) => {
  currentPage.value = val
  loadCategoryData()
}

// 处理每页条数改变
const handleSizeChange = (val: number) => {
  pageSize.value = val
  currentPage.value = 1
  loadCategoryData()
}

// 处理表格选择
const handleSelectionChange = (rows: CategoryInfo[]) => {
  selectedRows.value = rows
}

// 新增分类
const handleAdd = () => {
  isEdit.value = false
  dialogTitle.value = '新增分类'
  currentId.value = null
  categoryForm.value = {
    categoryName: ''
  }
  dialogVisible.value = true
}

// 编辑分类
const handleEdit = (row: CategoryInfo) => {
  isEdit.value = true
  dialogTitle.value = '编辑分类'
  currentId.value = row.id
  categoryForm.value = {
    categoryName: row.categoryName
  }
  dialogVisible.value = true
}

// 删除分类
const handleDelete = (row: CategoryInfo) => {
  ElMessageBox.confirm(
    `确定要删除分类 ${row.categoryName} 吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(async () => {
    try {
      const response = await batchDeleteCategoryApi([row.id])
      if (response.code === 0) {
        ElMessage.success('删除成功')
        loadCategoryData()
      } else {
        ElMessage.error(response.message || '删除失败')
      }
    } catch (error) {
      console.error('Error:', error)
      ElMessage.error('删除失败')
    }
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

// 批量删除
const handleBatchDelete = () => {
  if (!selectedRows.value.length) {
    ElMessage.warning('请选择要删除的分类')
    return
  }

  const categoryNames = selectedRows.value.map(row => row.categoryName).join('、')
  ElMessageBox.confirm(
    `确定要删除以下分类吗？\n${categoryNames}`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(async () => {
    try {
      const ids = selectedRows.value.map(row => row.id)
      const response = await batchDeleteCategoryApi(ids)
      if (response.code === 0) {
        ElMessage.success('批量删除成功')
        loadCategoryData()
      } else {
        ElMessage.error(response.message || '批量删除失败')
      }
    } catch (error) {
      console.error('Error:', error)
      ElMessage.error('批量删除失败')
    }
  }).catch(() => {
    ElMessage.info('已取消批量删除')
  })
}

// 提交表单
const submitForm = async () => {
  if (!categoryFormRef.value) return
  
  await categoryFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        let response
        if (isEdit.value && currentId.value) {
          // 更新分类
          const updateData: CategoryUpdateDto = {
            id: currentId.value,
            categoryName: categoryForm.value.categoryName
          }
          response = await updateCategoryApi(updateData)
        } else {
          // 新增分类
          response = await addCategoryApi(categoryForm.value)
        }

        if (response.code === 0) {
          ElMessage.success(isEdit.value ? '更新分类成功' : '添加分类成功')
          dialogVisible.value = false
          loadCategoryData()
        } else {
          ElMessage.error(response.message || (isEdit.value ? '更新失败' : '添加失败'))
        }
      } catch (error) {
        console.error('Error:', error)
        ElMessage.error(isEdit.value ? '更新失败' : '添加失败')
      }
    }
  })
}

onMounted(() => {
  loadCategoryData()
})
</script>

<style scoped lang="less">
.category-manage {
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
    
    .header-left {
      display: flex;
      gap: 10px;
    }
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