// Phase 18: 퀴즈 완료 컨페티 효과 — canvas-confetti 래퍼
// R3F Canvas와 완전 독립 (별도 canvas). game-confetti 청크로 분리.
import { useRef, useEffect } from 'react'
import confetti from 'canvas-confetti'

interface ConfettiEffectProps {
  /** true 전환 시 3단계 컨페티 폭발 재생 */
  fire: boolean
}

/**
 * ConfettiEffect — 퀴즈 완료 축하 컨페티 애니메이션.
 *
 * - canvas-confetti 라이브러리 사용 (worker 기반 비동기 처리)
 * - 3단계 폭발: 중앙(즉시) + 좌우(200ms 후)
 * - z-50: React DOM 위, LevelUpOverlay(z-100) 아래 레이어 배치
 * - pointer-events-none: 클릭 패스스루
 */
export default function ConfettiEffect({ fire }: ConfettiEffectProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const confettiRef = useRef<confetti.CreateTypes | null>(null)

  // canvas-confetti 인스턴스 초기화
  useEffect(() => {
    if (canvasRef.current) {
      confettiRef.current = confetti.create(canvasRef.current, {
        resize: true,
        useWorker: true,
      })
    }
    return () => {
      confettiRef.current?.reset()
    }
  }, [])

  // fire 트리거 시 3단계 폭발
  useEffect(() => {
    if (fire && confettiRef.current) {
      const shoot = confettiRef.current

      // 1단계: 중앙에서 폭발
      shoot({
        particleCount: 100,
        spread: 160,
        origin: { y: 0.6 },
        colors: ['#fbbf24', '#34d399', '#60a5fa', '#f472b6', '#a78bfa'],
      })

      // 2단계: 200ms 후 좌우에서 추가 폭발
      setTimeout(() => {
        shoot?.({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#fbbf24', '#34d399'],
        })
        shoot?.({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#60a5fa', '#f472b6'],
        })
      }, 200)
    }
  }, [fire])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-50 pointer-events-none"
    />
  )
}
