import request from '@/utils/http'
import { BaseResult } from '@/types/axios'
import { LoginParams } from './model/loginModel'

export class UserService {
  // 登录
  static login(params: LoginParams) {
    return request.post<BaseResult>({
      url: '/admin/auth/sign_in',
      params
    })
  }
}
