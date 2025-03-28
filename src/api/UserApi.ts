import service from "@/http";
import {QueryFileDto} from "@/api/dto.ts";
type Res = any;
export const UserApi = {
  QueryPage: "/user/page",
  Download: "/user/download",
  Register: "/user/register",
  Update: "/user/update",
  Login: "/user/login",
  UpdatePassword: "/user/updatePassword"
};

interface RegisterUserDto {
  name: string;
  userName: string;
  password: string;
  phone: string;
  sex: string;
  idNumber: string;
}


// 更新用户信息接口
interface UpdateUserDto {
  id: number;
  name: string;
  userName: string;
  phone: string;
  sex: string;
  idNumber: string;
}

// 修改密码请求参数接口
export interface UpdatePasswordDto {
  id: number;
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const registerUserApi = async (data: RegisterUserDto): Promise<Res> => {
  return service.post(UserApi.Register, data);
};
export const queryFileApi = async (params: QueryFileDto): Promise<Res> => {
  console.log("请求参数：", params);

  return service.get(UserApi.QueryPage, {
    params,
  });
};

export const updateUserApi = async (data: UpdateUserDto): Promise<Res> => {
  return service.put(UserApi.Update, data);
};

// 修改密码
export const updatePasswordApi = async (data: UpdatePasswordDto) => {
  return service.post(UserApi.UpdatePassword, data);
};