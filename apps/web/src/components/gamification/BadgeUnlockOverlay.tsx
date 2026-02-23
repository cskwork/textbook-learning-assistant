// BadgeUnlockOverlay.tsx
// 풀스크린 뱃지 획득 축하 오버레이 컴포넌트
// Phase 16 보상 시스템

import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { BadgeDefinition, BadgeRarity } from '@/lib/gamification/badge-definitions'

interface BadgeUnlockOverlayProps {
  /** 획득한 뱃지 정의 */
  badge: BadgeDefinition | null
  /** 오버레이 표시 여부 */
  visible: boolean
  /** 오버레이 닫기 콜백 */
  onDone: () => void
}

/** 희귀도별 배경 투명도 */
const RARITY_BG_OPACITY: Record<BadgeRarity, string> = {
  common: 'bg-black/60',
  rare: 'bg-black/70',
  epic: 'bg-black/85',
}

/** 희귀도별 주요 색상 클래스 */
const RARITY_COLOR: Record<BadgeRarity, string> = {
  common: 'text-blue-400',
  rare: 'text-purple-400',
  epic: 'text-yellow-400',
}

/** 희귀도별 글로우 색상 */
const RARITY_GLOW: Record<BadgeRarity, string> = {
  common: 'rgba(96, 165, 250, 0.7)',
  rare: 'rgba(192, 132, 252, 0.7)',
  epic: 'rgba(250, 204, 21, 0.9)',
}

/** 희귀도별 radial gradient 색상 */
const RARITY_GRADIENT: Record<BadgeRarity, string> = {
  common: 'rgba(96,165,250,0.15)',
  rare: 'rgba(192,132,252,0.18)',
  epic: 'rgba(250,204,21,0.22)',
}

/** 희귀도별 자동 닫힘 시간(ms) */
const RARITY_DURATION: Record<BadgeRarity, number> = {
  common: 1500,
  rare: 2000,
  epic: 3000,
}

/** 희귀도별 뱃지 아이콘 spring 설정 */
function getIconSpring(rarity: BadgeRarity) {
  if (rarity === 'epic')
    return { type: 'spring' as const, damping: 6, stiffness: 150 }
  if (rarity === 'rare')
    return { type: 'spring' as const, damping: 10, stiffness: 180 }
  return { type: 'spring' as const, damping: 15, stiffness: 200 }
}

/** 희귀도별 뱃지 이름 텍스트 */
const RARITY_LABEL: Record<BadgeRarity, string> = {
  common: 'COMMON',
  rare: 'RARE',
  epic: 'EPIC',
}

/**
 * BadgeUnlockOverlay — 뱃지 획득 시 표시되는 풀스크린 축하 오버레이
 *
 * - fixed inset-0 z-[100] — 모든 UI 위에 표시
 * - 희귀도(common/rare/epic)에 따라 배경 투명도, 색상, 애니메이션 강도 차등
 * - common: 1.5초, rare: 2초, epic: 3초 후 자동 닫힘
 * - 클릭으로도 닫기 가능
 */
export function BadgeUnlockOverlay({ badge, visible, onDone }: BadgeUnlockOverlayProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const rarity = badge?.rarity ?? 'common'

  // visible이 true가 되면 희귀도별 시간 후 자동 닫기
  useEffect(() => {
    if (visible && badge) {
      const duration = RARITY_DURATION[badge.rarity]
      timerRef.current = setTimeout(() => {
        onDone()
      }, duration)
    }
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }
  }, [visible, badge, onDone])

  return (
    <AnimatePresence>
      {visible && badge && (
        <motion.div
          className={`fixed inset-0 z-[100] flex flex-col items-center justify-center cursor-pointer select-none ${RARITY_BG_OPACITY[rarity]}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onDone}
        >
          {/* 방사형 빛 효과 — 희귀도별 색상 */}
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(ellipse 50% 45% at 50% 50%, ${RARITY_GRADIENT[rarity]} 0%, transparent 70%)`,
            }}
          />

          {/* epic 전용: 회전하는 광선 */}
          {rarity === 'epic' && (
            <motion.div
              className="absolute inset-0"
              style={{
                background:
                  'conic-gradient(from 0deg at 50% 50%, transparent 0%, rgba(250,204,21,0.08) 10%, transparent 20%, rgba(250,204,21,0.08) 30%, transparent 40%, rgba(250,204,21,0.08) 50%, transparent 60%, rgba(250,204,21,0.08) 70%, transparent 80%, rgba(250,204,21,0.08) 90%, transparent 100%)',
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
            />
          )}

          {/* 중앙 콘텐츠 */}
          <div className="relative z-10 flex flex-col items-center gap-3">
            {/* 상단 레이블 */}
            <motion.p
              className={`text-sm font-bold tracking-widest ${RARITY_COLOR[rarity]} opacity-80`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 0.8, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
            >
              뱃지 획득!
            </motion.p>

            {/* 뱃지 아이콘 — spring 물리, 희귀도별 glowing */}
            <motion.div
              className="text-8xl leading-none"
              style={{
                filter: `drop-shadow(0 0 20px ${RARITY_GLOW[rarity]}) drop-shadow(0 0 40px ${RARITY_GLOW[rarity]})`,
              }}
              initial={{ scale: 0, opacity: 0, rotate: rarity !== 'common' ? -15 : 0 }}
              animate={{
                scale: 1,
                opacity: 1,
                rotate: 0,
              }}
              transition={getIconSpring(rarity)}
            >
              {badge.icon}
            </motion.div>

            {/* epic 전용: pulse 효과 */}
            {rarity === 'epic' && (
              <motion.div
                className="absolute -inset-4 rounded-full"
                style={{
                  background: `radial-gradient(circle, ${RARITY_GLOW[rarity]} 0%, transparent 70%)`,
                }}
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.15, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              />
            )}

            {/* 뱃지 이름 */}
            <motion.div
              className={`text-2xl font-black ${RARITY_COLOR[rarity]}`}
              style={{
                textShadow: `0 0 15px ${RARITY_GLOW[rarity]}, 0 2px 6px rgba(0,0,0,0.6)`,
              }}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.4 }}
            >
              {badge.name}
            </motion.div>

            {/* 뱃지 설명 */}
            <motion.p
              className="text-sm text-white/70 max-w-xs text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.4 }}
            >
              {badge.description}
            </motion.p>

            {/* 희귀도 표시 */}
            <motion.div
              className={`mt-1 rounded-full px-3 py-0.5 text-xs font-bold ${RARITY_COLOR[rarity]} border border-current/30`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.3 }}
            >
              {RARITY_LABEL[rarity]}
            </motion.div>

            {/* 카테고리 표시 */}
            <motion.p
              className="text-xs text-white/40 capitalize"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.3 }}
            >
              {badge.category} 카테고리
            </motion.p>

            {/* 클릭 안내 */}
            <motion.p
              className="mt-2 text-xs text-white/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.4 }}
            >
              탭하여 계속
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
