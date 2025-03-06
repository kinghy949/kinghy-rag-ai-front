import service from "@/http";
type Res = any;

export const SensitiveApi = {
  QueryPage: "/sensitive/page",
  Add: "/sensitive/add",
  BatchDelete: "/sensitive/batch",
};

export interface SensitiveInfo {
  id: number;
  word: string;
  category: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface SensitiveAddDto {
  word: string;
  category: string;
}

// 分页查询
export const querySensitiveApi = async (params: { page: number; size: number }): Promise<Res> => {
  return service.get(SensitiveApi.QueryPage, { params });
};

// 新增敏感词
export const addSensitiveApi = async (data: SensitiveAddDto): Promise<Res> => {
  return service.post(SensitiveApi.Add, data);
};

// 批量删除
export const batchDeleteSensitiveApi = async (ids: number[]): Promise<Res> => {
  return service.post(SensitiveApi.BatchDelete, ids);
}; 