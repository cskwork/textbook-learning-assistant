// Phase 18: 오답 CSS shake + flash 이펙트
// Three.js 불필요 — CSS-only로 구현 (CONTEXT.md 결정)
import { useEffect, useRef } from 'react'

interface WrongAnswerFxProps {
  /** true일 때 플래시 + shake 재생 */
  active: boolean
  /** 애니메이션 완료 후 콜백 (부모에서 active를 false로 전환) */
  onComplete?: () => void
}

/**
 * 오답 시 화면 전체 빨간 플래시(0.2초) + 흔들림(0.3초) CSS 이펙트.
 *
 * - 빨간 플래시: fixed inset-0 z-40 pointer-events-none div
 * - shake: 부모 컨테이너에 animate-wrong-shake 클래스 추가 방식 (부모 관리)
 * - 300ms 후 onComplete 콜백 호출
 */
export function WrongAnswerFx({ active, onComplete }: WrongAnswerFxProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (active) {
      timerRef.current = setTimeout(() => {
        onComplete?.()
      }, 300)
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }
  }, [active, onComplete])

  if (!active) return null

  return (
    <div className="fixed inset-0 z-40 pointer-events-none animate-wrong-flash" />
  )
}
