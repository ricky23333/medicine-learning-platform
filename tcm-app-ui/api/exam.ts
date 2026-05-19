/**
 * 考试相关 API
 */
import { getDictTypeList, findDictValueByKey, DictType } from './dict'

// 默认考试时长（秒）- 15分钟
const DEFAULT_EXAM_DURATION = 15 * 60

/**
 * 获取考试时长配置
 * 从字典接口获取 global.exam.duration 的值
 * @returns 考试时长（秒）
 */
export async function getExamDuration(): Promise<number> {
  try {
    const result = await getDictTypeList({ pageNum: 1, pageSize: 999 })
    console.log(3333, result)
    const dictList: DictType[] = result.rows || []

    const durationValue = findDictValueByKey('global.exam.duration', dictList)

    if (durationValue) {
      const parsed = parseInt(durationValue, 10)
      if (!isNaN(parsed) && parsed > 0) {
        return parsed * 60 // 转换为秒（接口返回可能是分钟）
      }
    }

    // 如果未找到配置，使用默认值
    console.warn('未找到考试时长配置，使用默认值:', DEFAULT_EXAM_DURATION)
    return DEFAULT_EXAM_DURATION
  } catch (error) {
    console.error('获取考试时长配置失败:', error)
    return DEFAULT_EXAM_DURATION
  }
}
