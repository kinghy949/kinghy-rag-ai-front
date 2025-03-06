import service from "@/http";
type Res = any;

export const LogInfoApi = {
  QueryPage: "/log/page",
  BatchDelete: "/log/batch",
};

export interface LogQueryParams {
  page: number;
  size: number;
  methodName?: string;
  className?: string;
  requestParams?: string;
}

export interface LogInfo {
  id: string;
  methodName: string;
  className: string;
  requestTime: string;
  requestParams: string;
  response: string | null;
}

// 分页查询日志
export const queryLogApi = async (params: LogQueryParams): Promise<Res> => {
  return service.get(LogInfoApi.QueryPage, { params });
};

// 批量删除日志
export const batchDeleteLogApi = async (): Promise<Res> => {
  return service.post(LogInfoApi.BatchDelete);
};