<template>
  <div class="chat-container">
    <div class="chat-messages" ref="messageContainer">
      <div v-for="(message, index) in messages" :key="index" 
           :class="['message', message.role === 'user' ? 'user-message' : 'assistant-message']">
        <div class="message-wrapper">
          <div class="message-content" :class="{ 'typing': message.isTyping }" v-html="renderMarkdown(message.content)">
          </div>
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
    </div>
    <div class="button-group">
      <el-button type="warning" @click="clearMessages">清空对话</el-button>
      <el-button type="primary" @click="handleSend" :loading="loading">普通回答</el-button>
      <el-button type="primary" @click="handleRagSend" :loading="loading">RAG回答</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { marked } from 'marked'
import { BASE_URL } from "@/http/config.ts"
import { Document } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  isTyping?: boolean
}

const messages = ref<ChatMessage[]>([])
const userInput = ref<string>('')
const loading = ref<boolean>(false)
const messageContainer = ref<HTMLElement | null>(null)

const handleSend = async () => {
  if (!userInput.value.trim() || loading.value) return

  messages.value.push({
    role: 'user',
    content: userInput.value
  })

  const currentInput = userInput.value
  userInput.value = ''
  loading.value = true
  let assistantMessage = {
    role: 'assistant',
    content: '',
    isTyping: true  // 添加打字机效果标记
  }
  messages.value.push(assistantMessage)

  try {
    const response = await fetch(BASE_URL+`/chat/stream?message=${encodeURIComponent(currentInput)}`)
    const reader = response.body.getReader()
    const decoder = new TextDecoder()

    while (true) {
      const { value, done } = await reader.read()
      if (done) break

      const text = decoder.decode(value)
      assistantMessage.content += text

      await nextTick()
      scrollToBottom()
    }
  } catch (error) {
    console.error('Error:', error)
    assistantMessage.content = '抱歉，发生了错误，请稍后重试。'
  } finally {
    loading.value = false
    assistantMessage.isTyping = false  // 结束打字机效果
  }
}

const handleRagSend = async () => {
  if (!userInput.value.trim() || loading.value) return

  messages.value.push({
    role: 'user',
    content: userInput.value
  })

  const currentInput = userInput.value
  userInput.value = ''
  loading.value = true
  let assistantMessage = {
    role: 'assistant',
    content: '',
    isTyping: true
  }
  messages.value.push(assistantMessage)

  try {
    const response = await fetch(BASE_URL+`/ai/rag?message=${encodeURIComponent(currentInput)}`)
    const reader = response.body.getReader()
    const decoder = new TextDecoder()

    while (true) {
      const { value, done } = await reader.read()
      if (done) break

      const text = decoder.decode(value)
      // 处理SSE格式的数据
      const lines = text.split('\n')
      for (const line of lines) {
        if (line.startsWith('data:')) {
          // 去掉'data:'前缀，获取实际内容
          const content = line.slice(5).trim()
          if (content) {
            assistantMessage.content += content
          }
        }
      }

      await nextTick()
      scrollToBottom()
    }
  } catch (error) {
    console.error('Error:', error)
    assistantMessage.content = '抱歉，发生了错误，请稍后重试。'
  } finally {
    loading.value = false
    assistantMessage.isTyping = false
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

const clearMessages = () => {
  messages.value = [{
    role: 'assistant',
    content: '你好！我是AI助手，请问有什么可以帮助你的吗？'
  }]
}

// 添加markdown渲染函数
const renderMarkdown = (content: string) => {
  try {
    return marked(content, {
      breaks: true, // 支持换行
      sanitize: true // 消毒HTML标签，防止XSS攻击
    })
  } catch (error) {
    console.error('Markdown parsing error:', error)
    return content
  }
}

onMounted(() => {
  messages.value.push({
    role: 'assistant',
    content: '你好！我是AI助手，请问有什么可以帮助你的吗？'
  })
})
</script>

<style scoped lang="less">
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

  :deep(p) {
    margin: 0;
  }

  :deep(pre) {
    background-color: #f8f8f8;
    padding: 10px;
    border-radius: 4px;
    overflow-x: auto;
  }

  :deep(code) {
    font-family: Consolas, Monaco, 'Andale Mono', monospace;
    background-color: #f8f8f8;
    padding: 2px 4px;
    border-radius: 3px;
  }

  :deep(ul), :deep(ol) {
    padding-left: 20px;
    margin: 8px 0;
  }

  :deep(blockquote) {
    margin: 8px 0;
    padding-left: 10px;
    border-left: 4px solid #ddd;
    color: #666;
  }
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

.typing-cursor {
  animation: blink 1s step-end infinite;
}

@keyframes blink {
  from, to {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}

.typing {
  border-right: none;
}

.button-group {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;  /* 改为靠右对齐 */
  gap: 8px;
  margin-top: 10px;
}

.button-group .el-button {
  width: 100px;
  height: 40px;
}
</style>
