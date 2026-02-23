// StreakCounter.tsx
// 스트릭 카운터 위젯 컴포넌트
// Phase 16 보상 시스템

import { motion } from 'framer-motion'
import { FlameIcon } from '@/components/game/icons'

interface StreakCounterProps {
  /** 연속 학습 일수 */
  streakDays: number
  /** 오늘 스트릭 보너스 XP (없으면 0) */
  bonusXP?: number
}

/** 스트릭 일수에 따른 불꽃 아이콘 크기 */
function getFlameSize(days: number): number {
  if (days >= 30) return 28
  if (days >= 14) return 24
  if (days >= 7) return 22
  return 20
}

/** 스트릭 일수에 따른 색상 클래스 */
function getStreakColor(days: number): string {
  if (days >= 30) return 'text-red-500'
  if (days >= 14) return 'text-orange-400'
  if (days >= 7) return 'text-orange-500'
  if (days >= 3) return 'text-yellow-500'
  return 'text-yellow-400'
}

/** 스트릭 일수에 따른 글로우 색상 */
function getGlowColor(days: number): string {
  if (days >= 30) return 'rgba(239, 68, 68, 0.6)'
  if (days >= 14) return 'rgba(251, 146, 60, 0.6)'
  if (days >= 7) return 'rgba(249, 115, 22, 0.5)'
  if (days >= 3) return 'rgba(234, 179, 8, 0.5)'
  return 'rgba(250, 204, 21, 0.4)'
}

/** 스트릭 불꽃 색상 */
function getFlameColor(days: number): string {
  if (days >= 30) return '#ef4444'
  if (days >= 14) return '#fb923c'
  if (days >= 7) return '#f97316'
  if (days >= 3) return '#eab308'
  return '#facc15'
}

/**
 * StreakCounter — 연속 학습 일수 위젯
 *
 * - 홈 화면이나 헤더에 배치 가능한 컴팩트 위젯
 * - 불꽃 아이콘 + 연속 일수 텍스트 표시
 * - streakDays >= 3이면 보너스 XP 뱃지 표시
 * - 스트릭이 높을수록(7+, 14+, 30+) 시각적 강도 증가
 * - 숫자 변경 시 bounce 애니메이션
 */
export function StreakCounter({ streakDays, bonusXP = 0 }: StreakCounterProps) {
  const flameSize = getFlameSize(streakDays)
  const flameColor = getFlameColor(streakDays)
  const streakColor = getStreakColor(streakDays)
  const glowColor = getGlowColor(streakDays)
  const showBonus = streakDays >= 3 && bonusXP > 0

  return (
    <div className="flex items-center gap-2">
      {/* 불꽃 아이콘 + 연속 일수 */}
      <motion.div
        key={streakDays}
        className="flex items-center gap-1.5"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', damping: 8, stiffness: 300 }}
      >
        {/* 불꽃 아이콘 */}
        <motion.span
          style={{
            filter: `drop-shadow(0 0 6px ${glowColor})`,
            display: 'inline-flex',
          }}
          animate={
            streakDays >= 7
              ? {
                  scale: [1, 1.15, 1],
                  rotate: [-5, 5, -5],
                }
              : {}
          }
          transition={
            streakDays >= 7
              ? {
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }
              : {}
          }
        >
          <FlameIcon size={flameSize} color={flameColor} glow />
        </motion.span>

        {/* 연속 일수 텍스트 */}
        <span className={`font-bold text-sm ${streakColor}`}>{streakDays}일 연속</span>
      </motion.div>

      {/* 보너스 XP 뱃지 (streakDays >= 3이면 표시) */}
      {showBonus && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-0.5 rounded-full bg-yellow-400/20 px-2 py-0.5 border border-yellow-400/40"
        >
          <span className="text-xs font-semibold text-yellow-400">
            +{bonusXP} XP
          </span>
        </motion.div>
      )}
    </div>
  )
}
