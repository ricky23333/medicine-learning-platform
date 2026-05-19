/**
 * 考试相关 API
 */
import { get, post } from '@/utils/request'
import { getDictTypeList, findDictValueByKey, DictType } from './dict'

// 默认考试时长（秒）- 15分钟
const DEFAULT_EXAM_DURATION = 15 * 60

// 考试题目数据类型
export interface ExamQuestion {
	id : string
	specimenId : string
	specimenName : string
	imageUrl : string
}

// 开始考试响应
export interface StartExamResponse {
	examId : string
	questions : ExamQuestion[]
}

// 提交考试响应
export interface SubmitExamResponse {
	examId : string
	score : number
	correctCount : number
	total : number
}

// 考试记录类型
export interface ExamRecordData {
	examId: string
	userId: string
	museumId: string
	museumName: string
	score: number
	totalQuestions: number
	correctCount: number
	status: string
	submittedAt: string
}

// 考试题目详情
export interface ExamQuestionDetail {
	id: string
	specimenId: string
	specimenName: string
	imageUrl: string
	userAnswer: string
	isCorrect: boolean
}

// 考试记录详情
export interface ExamRecordDetail extends ExamRecordData {
	questions: ExamQuestionDetail[]
}

/**
 * 获取考试记录列表
 */
export function getExamRecordList(): Promise<ExamRecordData[]> {
	return get<ExamRecordData[]>('/app/exam/history')
}

/**
 * 获取考试记录详情
 * @param examId 考试ID
 */
export function getExamRecordDetail(examId: string): Promise<ExamRecordDetail> {
	return get<ExamRecordDetail>(`/app/exam/${examId}`)
}

/**
 * 开始考试，获取考试题目
 * @param museumId 标本馆ID
 * @param categoryIds 分类ID数组（空数组表示全选）
 */
export function startExam(museumId : string, categoryIds : string[]) : Promise<StartExamResponse> {
	return post<StartExamResponse>('/app/exam/start', {
		museumId,
		categoryIds,
	})
}

/**
 * 提交考试答案
 * @param examId 考试ID
 * @param questions 题目列表 [{specimenId, imageId}]
 * @param answers 用户答案 [{imageId, userAnswer}]
 * @param museumId 标本馆ID
 */
export function submitExam(
	examId : string,
	questions : { specimenId : string; imageId : string }[],
	answers : { imageId : string; userAnswer : string; specimenId : string }[],
	museumId : string
) : Promise<SubmitExamResponse> {
	return post<SubmitExamResponse>('/app/exam/submit', {
		examId,
		questions,
		answers,
		museumId,
	})
}

/**
 * 获取考试时长配置
 * 从字典接口获取 global.exam.duration 的值
 * @returns 考试时长（秒）
 */
export async function getExamDuration() : Promise<number> {
	try {
		const result = await getDictTypeList({ pageNum: 1, pageSize: 999 })
		const dictList : DictType[] = result.rows || []

		const durationValue = findDictValueByKey('global.exam.duration', dictList)

		if (durationValue) {
			const parsed = parseInt(durationValue, 10)
			if (!isNaN(parsed) && parsed > 0) {
				return parsed * 60 // 转换为秒（接口返回是分钟）
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