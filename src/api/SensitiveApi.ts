import service from "@/http";
type Res = any;

export const SensitiveApi = {
  QueryPage: "/sensitive/page",
  Add: "/sensitive/add",
  BatchDelete: "/sensitive/batch",
  CategoryAdd: "/category/add",
  CategoryPage: "/category/page",
  CategoryBatchDelete: "/category/batch",
  CategoryUpdate: "/category/update"
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

// 敏感词分类信息接口
export interface CategoryInfo {
  id: number;
  categoryName: string;
  createdTime: string;
  updateTime: string;
  status: string;
}

// 更新分类信息接口
export interface CategoryUpdateDto {
  id: number;
  categoryName: string;
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

// 新增敏感词分类
export const addCategoryApi = async (data: { categoryName: string }): Promise<Res> => {
  return service.post(SensitiveApi.CategoryAdd, data);
};

// 分页查询敏感词分类
export const queryCategoryPageApi = async (params: { page: number; size: number }): Promise<Res> => {
  return service.get(SensitiveApi.CategoryPage, { params });
};

// 批量删除敏感词分类
export const batchDeleteCategoryApi = async (ids: number[]): Promise<Res> => {
  return service.delete(SensitiveApi.CategoryBatchDelete, { data: ids });
};

// 更新敏感词分类
export const updateCategoryApi = async (data: CategoryUpdateDto): Promise<Res> => {
  return service.put(SensitiveApi.CategoryUpdate, data);
}; 