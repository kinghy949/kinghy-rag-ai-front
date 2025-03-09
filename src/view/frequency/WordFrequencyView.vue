<template>
  <div class="frequency-manage">
    <el-card class="box-card">
      <!-- 搜索表单 -->
      <div class="search-form">
        <el-form :inline="true" :model="searchForm" ref="searchFormRef">
          <el-form-item label="词语" prop="word">
            <el-input v-model="searchForm.word" placeholder="请输入词语" clearable />
          </el-form-item>
          <el-form-item label="业务类型" prop="businessType">
            <el-input v-model="searchForm.businessType" placeholder="请输入业务类型" clearable />
          </el-form-item>
          <el-form-item label="最小出现次数" prop="countNumMin">
            <el-input-number v-model="searchForm.countNumMin" :min="0" placeholder="请输入最小出现次数" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="resetSearch">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 工具栏 -->
      <div class="table-header">
        <el-button type="danger" @click="handleClean">清空数据</el-button>
      </div>
      
      <!-- 表格 -->
      <div class="table-container">
        <el-table 
          v-loading="isLoading"
          element-loading-text="加载中..."
          element-loading-background="rgba(255, 255, 255, 0.8)"
          :data="frequencyList" 
          style="width: 100%" 
          border
          height="calc(95vh - 280px)"
        >
          <el-table-column prop="word" label="词语" width="180" />
          <el-table-column prop="countNum" label="出现次数" width="120" sortable />
          <el-table-column prop="businessType" label="业务类型" width="120" />
          <el-table-column prop="createTime" label="创建时间" width="180">
            <template #default="scope">
              {{ new Date(scope.row.createTime).toLocaleString() }}
            </template>
          </el-table-column>
          <el-table-column prop="updateTime" label="更新时间" width="180">
            <template #default="scope">
              {{ new Date(scope.row.updateTime).toLocaleString() }}
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="queryParams.page"
          v-model:page-size="queryParams.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { queryFrequencyApi, cleanFrequencyApi, type FrequencyInfo, type FrequencyQueryParams } from '@/api/FrequencyApi'

const frequencyList = ref<FrequencyInfo[]>([])
const total = ref(0)
const isLoading = ref(false)
const searchFormRef = ref<FormInstance>()

// 查询参数
const queryParams = ref<FrequencyQueryParams>({
  page: 1,
  pageSize: 10,
  word: '',
  businessType: '',
  countNumMin: 100
})

// 搜索表单
const searchForm = ref({
  word: '',
  businessType: '',
  countNumMin: 100
})

// 加载词频数据
const loadFrequencyData = async () => {
  isLoading.value = true
  try {
    const res = await queryFrequencyApi(queryParams.value)
    if (res.code === 0) {
      frequencyList.value = res.data.records
      total.value = res.data.total
    } else {
      ElMessage.error(res.message || '获取词频列表失败')
    }
  } catch (error) {
    console.error('获取词频列表错误:', error)
    ElMessage.error('获取词频列表失败')
  } finally {
    isLoading.value = false
  }
}

// 清空数据
const handleClean = () => {
  ElMessageBox.confirm(
    '确定要清空所有词频数据吗？此操作不可恢复！',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(async () => {
    try {
      const res = await cleanFrequencyApi()
      if (res.code === 0) {
        ElMessage.success('清空成功')
        loadFrequencyData()
      } else {
        ElMessage.error(res.message || '清空失败')
      }
    } catch (error) {
      console.error('清空词频数据错误:', error)
      ElMessage.error('清空失败')
    }
  }).catch(() => {
    ElMessage.info('已取消清空')
  })
}

// 搜索
const handleSearch = () => {
  queryParams.value = {
    ...queryParams.value,
    ...searchForm.value
  }
  loadFrequencyData()
}

// 重置搜索
const resetSearch = () => {
  if (searchFormRef.value) {
    searchFormRef.value.resetFields()
  }
  queryParams.value = {
    page: 1,
    pageSize: 10,
    word: '',
    businessType: '',
    countNumMin: 100
  }
  loadFrequencyData()
}

// 分页处理
const handleSizeChange = (val: number) => {
  queryParams.value.pageSize = val
  queryParams.value.page = 1
  loadFrequencyData()
}

const handleCurrentChange = (val: number) => {
  queryParams.value.page = val
  loadFrequencyData()
}

onMounted(() => {
  loadFrequencyData()
})
</script>

<style scoped lang="less">
.frequency-manage {
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

  .search-form {
    margin-bottom: 20px;
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