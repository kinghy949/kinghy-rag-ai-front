import { ChatApi } from "./common";
import { BASE_URL } from "../http/config";

import { useChatOptionsStore } from "../store/options";
import { useChatMessageStore } from "../store/message";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import service from "@/http";
const chatOptions = useChatOptionsStore();
const chatMessageStore = useChatMessageStore();


// 获取所有对话模型
export const getModelsApi = async (): Promise<any> => {
  return await service.get(ChatApi.Models);
};

// 流式对话
export const streamChatApi = (input: string) => {
  // 添加用户提问
  chatMessageStore.addMessage({
    role: "user",
    content: input,
  });
  // 添加当前AI回复
  let answer = "";
  chatMessageStore.addMessage({
    role: "assistant",
    content: answer,
  });

  // 修改为GET请求，并传入参数
  fetchEventSource(`${BASE_URL}/chat/stream?message=${encodeURIComponent(input)}&prompt=${(chatOptions.getSystemPrompt)}`, {
    method: "GET",
  });
};
