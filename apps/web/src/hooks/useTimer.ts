// apps/web/src/hooks/useTimer.ts
// 업카운트 타이머 훅 — 문제 풀이 경과 시간 측정
import { useState, useEffect, useRef, useCallback } from 'react'

export function useTimer() {
  const [seconds, setSeconds] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const start = useCallback(() => {
    setIsRunning(true)
  }, [])

  // stop은 isRunning을 false로 설정 — seconds 값은 state에 동기적으로 읽힘
  const stop = useCallback(() => {
    setIsRunning(false)
  }, [])

  const reset = useCallback(() => {
    setSeconds(0)
    setIsRunning(false)
  }, [])

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSeconds(s => s + 1)
      }, 1000)
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    // CRITICAL: cleanup — 언마운트 시 interval 정리 (메모리 누수 방지)
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isRunning])

  const formatted = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`

  return { seconds, formatted, isRunning, start, stop, reset }
}
