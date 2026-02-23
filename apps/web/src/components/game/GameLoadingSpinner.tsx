// INFRA-05: 반전 모드 최초 진입 시 로딩 화면
// React Suspense의 fallback으로 사용됨
import { useEffect, useState } from 'react'
import { EventBus } from '@/game/EventBus'
import { SwordIcon } from '@/components/game/icons'

/**
 * 반전 모드 게임 번들 로딩 중 표시되는 로딩 화면.
 *
 * - EventBus의 'load-progress' 이벤트로 실제 진행률 수신 (Phase 19 Phaser PreloadScene 연동)
 * - Phase 19 전까지는 setTimeout으로 가짜 진행률 시뮬레이션
 * - Suspense fallback이므로 게임 번들 로드 완료 시 자동으로 언마운트됨
 */
export function GameLoadingSpinner() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Phaser PreloadScene에서 발생하는 load-progress 이벤트 수신
    const handler = (value: unknown) => {
      if (typeof value === 'number') setProgress(value)
    }
    EventBus.on('load-progress', handler)

    // Phaser 설치 전까지는 setTimeout으로 프로그레스 시뮬레이션
    let fake = 0
    const interval = setInterval(() => {
      fake = Math.min(fake + 10, 90)
      setProgress(fake)
    }, 150)

    return () => {
      EventBus.off('load-progress', handler)
      clearInterval(interval)
    }
  }, [])

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-background z-50">
      <div className="mb-6 animate-bounce select-none">
        <SwordIcon size={64} color="var(--fun-neon-cyan, hsl(var(--primary)))" glow />
      </div>
      <p className="text-primary font-bold text-xl mb-4">반전 모드 로딩 중...</p>
      <div className="w-64 h-3 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-muted-foreground text-sm mt-2">{progress}%</p>
      <p className="text-muted-foreground text-xs mt-4 animate-pulse">
        게임 엔진을 준비하고 있어요
      </p>
    </div>
  )
}
