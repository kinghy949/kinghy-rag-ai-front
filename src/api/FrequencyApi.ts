import service from "@/http";
import { Res } from "./common";

export const FrequencyApi = {
  QueryPage: "/frequency/page",
  Clean: "/frequency/clean",
};

// 查询参数接口
export interface FrequencyQueryParams {
  page: number;
  pageSize: number;
  word?: string;
  businessType?: string;
  countNumMin?: number;
}

// 词频信息接口
export interface FrequencyInfo {
  id: number;
  word: string;
  countNum: number;
  businessType: string;
  createTime: string;
  updateTime: string;
}

// 分页查询词频
export const queryFrequencyApi = async (params: FrequencyQueryParams): Promise<Res> => {
  return service.post(FrequencyApi.QueryPage, params);
};

// 清空词频数据
export const cleanFrequencyApi = async (): Promise<Res> => {
  return service.post(FrequencyApi.Clean);
}; 