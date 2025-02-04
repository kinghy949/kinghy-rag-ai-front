<template>
  <div class="chat-container">
    <div class="chat-messages" ref="messageContainer">
      <div v-for="(message, index) in messages" :key="index" 
           :class="['message', message.role === 'user' ? 'user-message' : 'assistant-message']">
        <div class="message-wrapper">
          <div class="message-content">{{ message.content }}</div>
          <el-button
            class="copy-button"
            type="text"
            size="small"
            @click="copyMessage(message.content)"
          >
            <el-icon><Document /></el-icon>
          </el-button>
        </div>
      </div>
    </div>
    
    <div class="input-container">
      <el-input
        v-model="userInput"
        type="textarea"
        :rows="3"
        placeholder="请输入您的问题..."
        @keyup.enter.native="handleSend"
      />
      <el-button type="primary" @click="handleSend" :loading="loading">发送</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import {BASE_URL} from "@/http/config.ts";
import { Document } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const messages = ref([])
const userInput = ref('')
const loading = ref(false)
const messageContainer = ref(null)

const handleSend = async () => {
  if (!userInput.value.trim() || loading.value) return
  
  // 添加用户消息
  messages.value.push({
    role: 'user',
    content: userInput.value
  })
  
  loading.value = true
  let assistantMessage = {
    role: 'assistant',
    content: ''
  }
  messages.value.push(assistantMessage)
  
  try {
    const response = await fetch(BASE_URL+`/chat/stream?message=${encodeURIComponent(userInput.value)}`)
    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    
    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      
      const text = decoder.decode(value)
      assistantMessage.content += text
      
      // 滚动到底部
      await nextTick()
      scrollToBottom()
    }
  } catch (error) {
    console.error('Error:', error)
    assistantMessage.content = '抱歉，发生了错误，请稍后重试。'
  } finally {
    loading.value = false
    userInput.value = ''
  }
}

const scrollToBottom = () => {
  if (messageContainer.value) {
    messageContainer.value.scrollTop = messageContainer.value.scrollHeight
  }
}

const copyMessage = async (content) => {
  try {
    await navigator.clipboard.writeText(content)
    ElMessage({
      message: '复制成功',
      type: 'success',
      duration: 2000
    })
  } catch (err) {
    ElMessage({
      message: '复制失败',
      type: 'error',
      duration: 2000
    })
  }
}

onMounted(() => {
  // 可以在这里添加欢迎消息
  messages.value.push({
    role: 'assistant',
    content: '你好！我是AI助手，请问有什么可以帮助你的吗？'
  })
})
</script>

<style scoped>
.chat-container {
  height: 90vh;  /* 调整容器高度 */
  display: flex;
  flex-direction: column;
  padding: 20px;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  margin-bottom: 20px;
  padding: 10px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
}

.message {
  margin-bottom: 15px;
  max-width: 80%;
}

.message-wrapper {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.user-message {
  margin-left: auto;
  text-align: right;
}

.user-message .message-wrapper {
  flex-direction: row-reverse; /* 调整用户消息的复制按钮位置 */
  justify-content: flex-start;
}

.assistant-message {
  margin-right: auto;
  text-align: left;
}

.message-content {
  display: inline-block;
  padding: 10px 15px;
  border-radius: 10px;
  background-color: #f0f0f0;
  word-break: break-word;
}

.user-message .message-content {
  background-color: #007AFF;
  color: white;
}

.copy-button {
  opacity: 0;
  transition: opacity 0.3s;
  padding: 4px;
  height: auto;
}

.message-wrapper:hover .copy-button {
  opacity: 1;
}

.input-container {
  display: flex;
  gap: 10px;
  padding: 10px;
  background-color: #fff;
  border: 1px solid #ebeef5;
  border-radius: 4px;
}

.input-container .el-textarea {
  flex: 1;
}

/* 自定义滚动条样式 */
.chat-messages::-webkit-scrollbar {
  width: 6px;
}

.chat-messages::-webkit-scrollbar-thumb {
  background-color: #909399;
  border-radius: 3px;
}

.chat-messages::-webkit-scrollbar-track {
  background-color: #f0f2f5;
}
</style>
