<template>
  <el-upload
    class="upload-demo"
    drag
    multiple
    v-model:file-list="fileList"
    :auto-upload="false"
    v-loading="isUploading"
  >
    <el-icon class="el-icon--upload"><upload-filled /></el-icon>
    <div class="el-upload__text">
      拖拽文件至此或<em>点击选择文件</em>进行上传
    </div>
    <template #tip>
      <div style="text-align: center">
        <el-text
          >文件支持 <i>pdf、doc、md、excel、text</i>等，最大可上传<em
            style="color: blue"
            >100MB</em
          ></el-text
        >
      </div>
    </template>
  </el-upload>

  <el-form
    style="display: flex; justify-content: space-between; align-items: center; margin: 20px 0"
    :model="queryFileDto"
  >
    <div style="display: flex; gap: 10px; align-items: center">
      <el-button
        type="danger"
        @click="batchDelete"
        :disabled="selectedFiles.length === 0"
      >
        批量删除
      </el-button>
      <el-form-item label="文件名:" style="margin-bottom: 0">
        <el-input placeholder="请输入文件名称" v-model="queryFileDto.fileName" />
      </el-form-item>
      <el-form-item style="margin-bottom: 0">
        <el-button type="primary" @click="loadStoreFileData" :disabled="isLoading"
          >搜索</el-button
        >
      </el-form-item>
    </div>
    <el-button
      type="warning"
      @click="uploadFile"
      :disabled="isUploading"
    >
      全部上传
    </el-button>
  </el-form>

  <el-table 
    :data="storeFileData" 
    border 
    v-loading="isLoading"
    height="calc(100vh - 400px)"
    @selection-change="handleSelectionChange"
  >
    <el-table-column type="selection" width="55" />
    <el-table-column label="序号" width="80">
      <template #default="scope">
        {{ (queryFileDto.page - 1) * queryFileDto.pageSize + scope.$index + 1 }}
      </template>
    </el-table-column>
    <el-table-column prop="fileName" label="文件名" width="580" />
    <el-table-column label="上传时间">
      <template #default="scope">
        {{ format(new Date(scope.row.createTime), "yyyy-MM-dd HH:mm") }}
      </template>
    </el-table-column>
    <el-table-column label="更新时间">
      <template #default="scope">
        {{ format(new Date(scope.row.updateTime), "yyyy-MM-dd HH:mm") }}
      </template>
    </el-table-column>
    <el-table-column label="操作" width="150" fixed="right">
      <template #default="scope">
        <el-button
          @click="deleteStoreFile(scope.row)"
          type="danger"
          size="small"
          >删除</el-button
        >
        <el-button
          @click="openFilePreview(scope.row)"
          type="primary"
          size="small"
          >预览</el-button
        >
      </template>
    </el-table-column>
  </el-table>

  <div style="margin-top: 20px; display: flex; justify-content: center;">
    <el-pagination
      v-model:current-page="queryFileDto.page"
      v-model:page-size="queryFileDto.pageSize"
      :page-sizes="[10, 20, 50, 100]"
      :total="storeFileTotal"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      layout="total, sizes, prev, pager, next, jumper"
    />
  </div>
</template>

<script setup lang="ts">
import { type UploadUserFile, ElMessage, ElMessageBox } from "element-plus";
import { uploadFileApi, queryFileApi, deleteFileApi } from "@/api/KnowHubApi";
import { StoreFile } from "@/api/data";
import { QueryFileDto } from "@/api/dto";
import { format } from "date-fns";

const storeFileData = ref<StoreFile[]>([]);
const queryFileDto = ref<QueryFileDto>({
  page: 1,
  pageSize: 10,
  fileName: "",
});
const isUploading = ref(false);
const isLoading = ref(false);
const storeFileTotal = ref(0);
const selectedFiles = ref<any[]>([])

const loadStoreFileData = () => {
  isLoading.value = true;
  const params = { ...queryFileDto.value, page: queryFileDto.value.page - 1 }
  queryFileApi(params)
    .then((res) => {
      if (res.code == 0) {
        const data = res.data;
        storeFileTotal.value = data.totalElements;
        storeFileData.value = data.records;
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

const fileList = ref<UploadUserFile[]>();

const uploadFile = () => {
  const files: File[] = [];
  fileList.value?.forEach((e) => {
    files.push(e.raw as File);
  });

  // 修改文件大小限制为100MB
  const maxSize = 100 * 1024 * 1024; // 100MB
  for (const file of files) {
    if (file.size > maxSize) {
      ElMessage({
        type: "error",
        message: `文件 ${file.name} 超过了最大上传大小限制 (100MB)`,
      });
      return;
    }
  }

  isUploading.value = true;
  uploadFileApi(files)
    .then((res) => {
      let code = res.data.code;
      if (code == 0) {
        ElMessage({
          type: "success",
          message: res.data.data,
        });
        fileList.value = [];
        loadStoreFileData();
      } else {
        ElMessage({
          type: "error",
          message: res.data.message,
        });
      }
    })
    .catch((err) => {
      console.log(err);
      ElMessage({
        type: "error",
        message: err,
      });
    })
    .finally(() => {
      isUploading.value = false;
    });
};
const deleteStoreFile = (e: any) => {
  ElMessageBox.confirm("确定要删除这个知识库吗？", "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      deleteFileApi({
        ids: e.id,
      })
        .then((res) => {
          let code = res.code;
          if (code == 0) {
            ElMessage({
              type: "success",
              message: res.data,
            });
            loadStoreFileData();
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
        });
    })
    .catch(() => {});
};
const openFilePreview = (e: any) => {
  window.open(e.url, "_blank");
};

const handleSizeChange = (val: number) => {
  queryFileDto.value.pageSize = val
  loadStoreFileData()
}

const handleCurrentChange = (val: number) => {
  queryFileDto.value.page = val
  loadStoreFileData()
}

const handleSelectionChange = (selection: any[]) => {
  selectedFiles.value = selection
}

const batchDelete = () => {
  if (selectedFiles.value.length === 0) return
  
  ElMessageBox.confirm("确定要删除选中的文件吗？", "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      const ids = selectedFiles.value.map(file => file.id).join(',')
      deleteFileApi({
        ids: ids,
      })
        .then((res) => {
          if (res.code == 0) {
            ElMessage({
              type: "success",
              message: res.data,
            });
            selectedFiles.value = [];
            loadStoreFileData();
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
        });
    })
    .catch(() => {});
}

onMounted(() => {
  loadStoreFileData();
});
</script>

<style scoped>
.el-table {
  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  ::-webkit-scrollbar-thumb {
    background: #ddd;
    border-radius: 3px;
  }
  ::-webkit-scrollbar-track {
    background: #f5f5f5;
  }
}

.upload-demo {
  margin-bottom: 20px;
}

.el-form {
  background-color: #fff;
  padding: 15px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}
</style>
