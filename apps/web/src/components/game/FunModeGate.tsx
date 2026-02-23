// INFRA-04: React.lazy + Suspense 래퍼 — 반전 모드 번들 분리 게이트
// 반전 모드가 아닐 때 게임 컴포넌트를 절대 로드하지 않는다
import { Suspense } from 'react'
import type { ReactNode } from 'react'
import { GameLoadingSpinner } from '@/components/game/GameLoadingSpinner'

// Phase 19에서 PhaserBridge가 구현되면 아래 주석 해제
// const PhaserBridge = lazy(() => import('@/components/game/PhaserBridge'))

// Phase 18에서 ThreeBackground가 구현되면 아래 주석 해제
// const ThreeBackground = lazy(() => import('@/components/game/ThreeBackground'))

interface FunModeGateProps {
  children: ReactNode
}

/**
 * 반전 모드 게임 컴포넌트의 lazy loading 게이트.
 *
 * - Suspense로 게임 번들이 로드되는 동안 GameLoadingSpinner를 fallback으로 표시
 * - 현재 Phase 15: Suspense 인프라만 구축. 실제 게임 컴포넌트는 Phase 18, 19에서 연결.
 * - Phase 18: ThreeBackground lazy import 활성화
 * - Phase 19: PhaserBridge lazy import 활성화
 *
 * @example
 * // 반전 모드 전용 페이지에서:
 * <FunModeGate>
 *   <FunModeContent />
 * </FunModeGate>
 */
export function FunModeGate({ children }: FunModeGateProps) {
  return (
    <Suspense fallback={<GameLoadingSpinner />}>
      {children}
    </Suspense>
  )
}
