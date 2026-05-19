/**
 * 字典接口 API
 */
import { get } from '@/utils/request'

// 字典数据类型
export interface DictData {
  dictCode: string
  dictSort: number
  dictLabel: string
  dictValue: string
  dictType: string
  cssClass?: string
  listClass?: string
  isDefault?: string
  status: string
  createTime: string
  remark?: string
}

// 字典类型
export interface DictType {
  dictId: number
  dictName: string
  dictType: string
  status: string
  createTime: string
  remark?: string
  children?: DictData[]
}

// 字典类型分页结果
export interface DictTypePageResult {
  total: number
  rows: DictType[]
}

/**
 * 获取字典类型列表
 * @param params 分页参数 { pageNum, pageSize }
 */
export function getDictTypeList(params: { pageNum: number; pageSize: number }): Promise<DictTypePageResult> {
  return get<DictTypePageResult>('/system/config/list', params)
}

/**
 * 根据 dictType 获取字典数据
 * @param dictType 字典类型
 */
export function getDictDataByType(dictType: string): Promise<DictData[]> {
  return get<DictData[]>(`/system/dict/data/type/${dictType}`)
}

/**
 * 从字典列表中查找指定键名的值
 * @param key 字典类型键名（如 'global.exam.duration'）
 * @param dictList 字典类型列表
 * @returns 字典值字符串，如果未找到返回 null
 */
export function findDictValueByKey(key: string, dictList: DictType[]): string | null {
  const dict = dictList.find(d => d.dictType === key)
  if (dict && dict.children && dict.children.length > 0) {
    // 返回第一个字典数据的值
    return dict.children[0].dictValue
  }
  return null
}
