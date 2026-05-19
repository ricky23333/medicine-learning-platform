/**
 * 倒计时 Hook
 * 提供通用的倒计时功能
 */
import { ref, onUnmounted } from 'vue'

export interface CountdownOptions {
  /** 初始倒计时秒数 */
  initialSeconds: number
  /** 倒计时结束的回调 */
  onComplete?: () => void
}

/**
 * 倒计时 Hook
 * @param options 配置选项
 */
export function useCountdown(options: CountdownOptions) {
  const { initialSeconds, onComplete } = options

  // 剩余秒数
  const remaining = ref(initialSeconds)
  // 是否正在运行
  const isRunning = ref(false)
  // 定时器 ID
  let timerId: number | null = null

  /**
   * 开始/恢复倒计时
   */
  function start() {
    if (isRunning.value || remaining.value <= 0) return

    isRunning.value = true
    timerId = setInterval(() => {
      if (remaining.value > 0) {
        remaining.value--
        if (remaining.value === 0) {
          stop()
          onComplete?.()
        }
      }
    }, 1000)
  }

  /**
   * 暂停倒计时
   */
  function pause() {
    if (!isRunning.value) return
    isRunning.value = false
    if (timerId !== null) {
      clearInterval(timerId)
      timerId = null
    }
  }

  /**
   * 重置倒计时
   * @param seconds 新的倒计时秒数（可选）
   */
  function reset(seconds?: number) {
    pause()
    remaining.value = seconds ?? initialSeconds
  }

  /**
   * 停止倒计时
   */
  function stop() {
    pause()
    remaining.value = 0
  }

  // 组件卸载时清理定时器
  onUnmounted(() => {
    if (timerId !== null) {
      clearInterval(timerId)
      timerId = null
    }
  })

  return {
    remaining,
    isRunning,
    start,
    pause,
    reset,
    stop,
  }
}
