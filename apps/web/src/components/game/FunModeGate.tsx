// INFRA-04: React.lazy + Suspense 래퍼 — 반전 모드 번들 분리 게이트
// 반전 모드가 아닐 때 게임 컴포넌트를 절대 로드하지 않는다
import { lazy, Suspense } from 'react'
import type { ReactNode } from 'react'
import { GameLoadingSpinner } from '@/components/game/GameLoadingSpinner'
import { useFunMode } from '@/contexts/FunModeContext'

// Phase 19에서 PhaserBridge가 구현되면 아래 주석 해제
// const PhaserBridge = lazy(() => import('@/components/game/PhaserBridge'))

// Phase 18: ThreeBackground lazy import 활성화
const ThreeBackground = lazy(() => import('@/components/game/ThreeBackground'))

interface FunModeGateProps {
  children: ReactNode
  /** 3D 배경 씬 타입. 제공 시 FunMode에서 ThreeBackground 렌더링 */
  scene?: 'space' | 'neon' | 'wave' | 'mountain'
}

/**
 * 반전 모드 게임 컴포넌트의 lazy loading 게이트.
 *
 * - Suspense로 게임 번들이 로드되는 동안 GameLoadingSpinner를 fallback으로 표시
 * - Phase 18: scene prop 제공 시 ThreeBackground 렌더링 (FunMode only)
 * - Phase 19: PhaserBridge lazy import 활성화 예정
 *
 * @example
 * // 반전 모드 전용 페이지에서:
 * <FunModeGate scene="space">
 *   <FunModeContent />
 * </FunModeGate>
 */
export function FunModeGate({ children, scene }: FunModeGateProps) {
  const { isFunMode } = useFunMode()

  return (
    <Suspense fallback={<GameLoadingSpinner />}>
      {isFunMode && scene && (
        <Suspense fallback={null}>
          <ThreeBackground scene={scene} />
        </Suspense>
      )}
      {children}
    </Suspense>
  )
}
