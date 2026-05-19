/**
 * 考试计时器 Hook
 * 封装考试倒计时逻辑，包括时间格式化显示
 */
import { computed, watch, Ref } from 'vue'
import { useCountdown } from './useCountdown'

export interface ExamTimerOptions {
  /** 考试时长（秒） */
  durationSeconds: number
  /** 考试结束的回调（倒计时归零时触发） */
  onExamEnd?: () => void
}

/**
 * 考试计时器 Hook
 * @param options 配置选项
 */
export function useExamTimer(options: ExamTimerOptions) {
  const { durationSeconds, onExamEnd } = options

  // 使用倒计时 Hook
  const countdown = useCountdown({
    initialSeconds: durationSeconds,
    onComplete: () => {
      onExamEnd?.()
    },
  })

  /**
   * 格式化时间为 MM:SS 或 HH:MM:SS
   * @param seconds 秒数
   */
  function formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  /**
   * 格式化后的剩余时间显示
   */
  const formattedTime = computed(() => formatTime(countdown.remaining.value))

  /**
   * 是否处于紧急状态（剩余时间少于5分钟）
   */
  const isUrgent = computed(() => countdown.remaining.value > 0 && countdown.remaining.value <= 5 * 60)

  /**
   * 是否已超时
   */
  const isExpired = computed(() => countdown.remaining.value === 0 && !countdown.isRunning.value)

  /**
   * 获取剩余时间的百分比（用于进度条）
   */
  const remainingPercent = computed(() => {
    if (durationSeconds === 0) return 0
    return Math.round((countdown.remaining.value / durationSeconds) * 100)
  })

  /**
   * 开始考试计时
   */
  function startExam() {
    countdown.reset(durationSeconds)
    countdown.start()
  }

  /**
   * 暂停考试计时
   */
  function pauseExam() {
    countdown.pause()
  }

  /**
   * 恢复考试计时
   */
  function resumeExam() {
    countdown.start()
  }

  return {
    // 原始倒计时状态
    remaining: countdown.remaining,
    isRunning: countdown.isRunning,
    // 计算属性
    formattedTime,
    isUrgent,
    isExpired,
    remainingPercent,
    // 方法
    start: startExam,
    pause: pauseExam,
    resume: resumeExam,
    reset: countdown.reset,
    stop: countdown.stop,
  }
}
