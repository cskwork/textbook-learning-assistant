// XPBar.tsx
// 헤더 아래 XP 진행 바 컴포넌트 — 반전 모드 전용
// Phase 16 보상 시스템

import { motion } from 'framer-motion'

interface XPBarProps {
  /** 현재 레벨 내 XP 진행률 (0~1) */
  progress: number
  /** 현재 레벨 */
  level: number
  /** 현재 레벨 내 누적 XP (표시용) */
  currentXPInLevel: number
  /** 다음 레벨까지 필요한 XP (표시용) */
  xpForNextLevel: number
}

/**
 * XPBar — 헤더 바로 아래 배치되는 XP 진행 바
 *
 * - 좌측: 현재 레벨 표시 (Lv.N)
 * - 중앙: Framer Motion 채워지는 그라데이션 진행 바
 * - 우측: 현재XP / 다음레벨XP 수치
 * - 반전 모드 전용 게임 스타일 디자인
 */
export function XPBar({ progress, level, currentXPInLevel, xpForNextLevel }: XPBarProps) {
  const clampedProgress = Math.min(1, Math.max(0, progress))
  const isMaxLevel = xpForNextLevel === Infinity

  return (
    <div className="flex w-full items-center gap-3 px-4 py-2">
      {/* 레벨 표시 */}
      <span className="min-w-[52px] text-sm font-bold text-yellow-400 drop-shadow">
        Lv.{level}
      </span>

      {/* XP 진행 바 컨테이너 */}
      <div className="relative flex-1 h-3 rounded-full bg-gray-700/80 overflow-hidden">
        {/* 배경 글로우 효과 */}
        <div
          className="absolute inset-0 rounded-full opacity-20"
          style={{
            background:
              'linear-gradient(90deg, rgba(59,130,246,0.3) 0%, rgba(168,85,247,0.3) 100%)',
          }}
        />

        {/* 채워지는 진행 바 */}
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            background: 'linear-gradient(90deg, #3b82f6 0%, #8b5cf6 60%, #a855f7 100%)',
            boxShadow: '0 0 8px rgba(139, 92, 246, 0.6)',
          }}
          initial={{ width: 0 }}
          animate={{ width: `${clampedProgress * 100}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />

        {/* 반짝이는 하이라이트 */}
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full opacity-30"
          style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.5) 0%, transparent 100%)',
          }}
          animate={{ width: `${clampedProgress * 100}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>

      {/* XP 수치 표시 */}
      <span className="min-w-[90px] text-right text-xs font-semibold text-gray-300">
        {isMaxLevel ? (
          <span className="text-yellow-400 font-bold">MAX</span>
        ) : (
          <>
            {currentXPInLevel.toLocaleString()}
            <span className="text-gray-500">/</span>
            {xpForNextLevel.toLocaleString()}
            <span className="ml-0.5 text-gray-400">XP</span>
          </>
        )}
      </span>
    </div>
  )
}
