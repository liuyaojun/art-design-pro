import request from '@/utils/http'
import { PaginationResult, BaseResult } from '@/types/axios'
import { KuaituType, KuaituTypeType } from './model/kuaituModel'

// 快图
export class KuaituService {
  // 获取画布尺寸列表
  static getSizesList(params: any) {
    const { name, currentPage, pageSize } = params
    return request.get<PaginationResult<any>>({
      url: `/admin/sizes?name=${name}&currentPage=${currentPage}&pageSize=${pageSize}`
    })
  }

  // 新增画布尺寸
  static addSize(params: any) {
    return request.post<BaseResult>({
      url: '/admin/sizes',
      params
    })
  }

  // 编辑画布尺寸
  static editSize(id: number, params: any) {
    return request.put<BaseResult>({
      url: `/admin/sizes/${id}`,
      params
    })
  }

  // 删除画布尺寸
  static delSize(id: number) {
    return request.del<BaseResult>({
      url: `/admin/sizes/${id}`
    })
  }

  // 改变画布尺寸状态
  static setStatus(id: number, params: any) {
    return request.post<BaseResult>({
      url: `/admin/sizes/${id}`,
      params
    })
  }

  // 获取模板列表
  static getTemplateList(params: any) {
    const { name, currentPage, pageSize } = params
    return request.get<PaginationResult<any>>({
      url: `/admin/templates?name=${name}&currentPage=${currentPage}&pageSize=${pageSize}`
    })
  }

  // 获取模板类型列表
  static getTemplateTypeList(params: any) {
    const { name, currentPage, pageSize } = params
    return request.get<PaginationResult<any>>({
      url: `/admin/templateTypes?name=${name}&currentPage=${currentPage}&pageSize=${pageSize}`
    })
  }

  // 新增模板类型
  static addTemplateType(params: any) {
    return request.post<BaseResult>({
      url: '/admin/templateTypes',
      params
    })
  }

  // 编辑模板类型
  static editTemplateType(id: number, params: any) {
    return request.put<BaseResult>({
      url: `/admin/templateTypes/${id}`,
      params
    })
  }

  // 删除模板类型
  static delTemplateType(id: number) {
    return request.del<BaseResult>({
      url: `/admin/templateTypes/${id}`
    })
  }

  // 获取素材列表
  static getMaterialList(params: any) {
    const { name, currentPage, pageSize } = params
    return request.get<PaginationResult<any>>({
      url: `/admin/materials?name=${name}&currentPage=${currentPage}&pageSize=${pageSize}`
    })
  }

  // 新增素材
  static addMaterial(params: any) {
    return request.post<BaseResult>({
      url: '/admin/materials',
      params
    })
  }

  // 编辑素材
  static editMaterial(id: number, params: any) {
    return request.put<BaseResult>({
      url: `/admin/materials/${id}`,
      params
    })
  }

  // 删除素材
  static delMaterial(id: number) {
    return request.del<BaseResult>({
      url: `/admin/materials/${id}`
    })
  }

  // 获取素材类型列表
  static getMaterialTypeList(params: any) {
    const { name, currentPage, pageSize } = params
    return request.get<PaginationResult<any>>({
      url: `/admin/materialTypes?name=${name}&currentPage=${currentPage}&pageSize=${pageSize}`
    })
  }

  // 新增素材类型
  static addMaterialType(params: any) {
    return request.post<BaseResult>({
      url: '/admin/materialTypes',
      params
    })
  }

  // 编辑素材类型
  static editMaterialType(id: number, params: any) {
    return request.put<BaseResult>({
      url: `/admin/materialTypes/${id}`,
      params
    })
  }

  // 删除素材类型
  static delMaterialType(id: number) {
    return request.del<BaseResult>({
      url: `/admin/materialTypes/${id}`
    })
  }

  // 获取字体列表
  static getFontList(params: any) {
    const { name, currentPage, pageSize } = params
    return request.get<PaginationResult<any>>({
      url: `/admin/fonts?name=${name}&currentPage=${currentPage}&pageSize=${pageSize}`
    })
  }

  // 新增字体
  static addFont(params: any) {
    return request.post<BaseResult>({
      url: '/admin/fonts',
      params
    })
  }

  // 编辑字体
  static editFont(id: number, params: any) {
    return request.put<BaseResult>({
      url: `/admin/fonts/${id}`,
      params
    })
  }

  // 删除字体
  static delFont(id: number) {
    return request.del<BaseResult>({
      url: `/admin/fonts/${id}`
    })
  }
}
