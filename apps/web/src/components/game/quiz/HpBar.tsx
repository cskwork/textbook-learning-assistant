// HpBar.tsx
// HP 바 — 보스/플레이어 공용 프로그레스 바
// Phase 19 게임화 퀴즈 엔진

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface HpBarProps {
  /** 현재 HP */
  current: number
  /** 최대 HP */
  max: number
  /** 라벨 텍스트 (예: "보스 HP", "플레이어") */
  label?: string
  /** 바 색상 (Tailwind class, 기본 bg-red-500) */
  color?: string
  /** 크기 ('sm' | 'lg') */
  size?: 'sm' | 'lg'
}

export function HpBar({ current, max, label, color = 'bg-red-500', size = 'lg' }: HpBarProps) {
  const percentage = max > 0 ? Math.max(0, Math.min(100, (current / max) * 100)) : 0
  const isLow = percentage <= 20

  return (
    <div className="space-y-1">
      {/* 라벨 + 숫자 */}
      <div className="flex items-center justify-between">
        {label && (
          <span className={cn('font-semibold text-white/80', size === 'sm' ? 'text-xs' : 'text-sm')}>
            {label}
          </span>
        )}
        <span className={cn('font-bold tabular-nums', size === 'sm' ? 'text-xs text-white/60' : 'text-sm text-white/80')}>
          {current}/{max}
        </span>
      </div>

      {/* 프로그레스 바 */}
      <div
        className={cn(
          'w-full rounded-full overflow-hidden bg-white/10',
          size === 'sm' ? 'h-2' : 'h-4',
        )}
      >
        <motion.div
          className={cn('h-full rounded-full', color)}
          animate={{
            width: `${percentage}%`,
            opacity: isLow ? [1, 0.5, 1] : 1,
          }}
          transition={
            isLow
              ? { width: { duration: 0.4, ease: 'easeOut' }, opacity: { duration: 0.6, repeat: Infinity } }
              : { duration: 0.4, ease: 'easeOut' }
          }
        />
      </div>
    </div>
  )
}
