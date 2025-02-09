<template>
  <div class="draw-image">
    <div class="input-section">
      <textarea
          v-model="prompt"
          placeholder="描述你所想象的图片..."
          class="prompt-input"
      />
<!--      <div class="ratio-select">-->
<!--        <label v-for="option in ratioOptions" :key="option.value" class="ratio-option">-->
<!--          <input-->
<!--              type="radio"-->
<!--              v-model="ratio"-->
<!--              :value="option.value"-->
<!--          />-->
<!--          {{ option.label }}-->
<!--        </label>-->
<!--      </div>-->
      <div class="button-group">
        <button @click="generateImage" :disabled="isLoading" class="generate-btn">
          {{ isLoading ? '生成中...' : '生成图片' }}
        </button>
        <button v-if="generatedImage" @click="downloadImage" class="download-btn">
          下载图片
        </button>
      </div>
    </div>

    <div class="image-preview" v-if="generatedImage">
      <div class="preview-container">
        <img :src="generatedImage" alt="生成的图片" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {BASE_URL} from "@/http/config.ts";

const prompt = ref('')
const generatedImage = ref('')
const isLoading = ref(false)


const generateImage = async () => {
  if (!prompt.value) return
  
  isLoading.value = true
  try {
    const response = await fetch(BASE_URL+`/draw/image?prompt=${encodeURIComponent(prompt.value)}`)
    if (response.ok) {
      const blob = await response.blob()
      generatedImage.value = URL.createObjectURL(blob)
    }
  } catch (error) {
    console.error('生成图片失败:', error)
  } finally {
    isLoading.value = false
  }
}

const downloadImage = () => {
  if (!generatedImage.value) return
  
  // 创建一个临时的a标签用于下载
  const link = document.createElement('a')
  link.href = generatedImage.value
  link.download = `generated-image-${Date.now()}.png` // 使用时间戳确保文件名唯一
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
</script>

<style scoped lang="less">
.draw-image {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  
  .input-section {
    margin-bottom: 20px;
  }
  
  .prompt-input {
    width: 100%;
    height: 100px;
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 8px;
    resize: vertical;
    margin-bottom: 16px;
  }
  
  .ratio-select {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 16px;
    
    .ratio-option {
      display: flex;
      align-items: center;
      gap: 4px;
      cursor: pointer;
    }
  }
  
  .button-group {
    display: flex;
    gap: 12px;
    align-items: center;
  }
  
  .generate-btn {
    padding: 12px 24px;
    background: #1890ff;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    
    &:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
  }
  
  .download-btn {
    padding: 12px 24px;
    background: #52c41a;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.3s;
    
    &:hover {
      background: #389e0d;
    }
  }
  
  .image-preview {
    margin-top: 20px;
    display: flex;
    justify-content: center;
    
    .preview-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      
      img {
        max-width: 100%;
        max-height: 300px;
        width: auto;
        height: auto;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }
    }
  }
}
</style>