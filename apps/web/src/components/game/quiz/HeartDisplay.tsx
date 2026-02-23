// HeartDisplay.tsx
// 하트 표시 + 깨짐 애니메이션 — 서바이벌/보스배틀 공용
// Phase 19 게임화 퀴즈 엔진

import { motion, AnimatePresence } from 'framer-motion'

interface HeartDisplayProps {
  /** 현재 하트 개수 */
  hearts: number
  /** 최대 하트 개수 (기본 3) */
  maxHearts?: number
}

/** 빨간 하트 SVG 아이콘 (인라인 SVG, 이모지 금지) */
function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="w-8 h-8">
      <path
        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
        fill={filled ? '#ef4444' : 'none'}
        stroke={filled ? '#ef4444' : '#6b7280'}
        strokeWidth="2"
        opacity={filled ? 1 : 0.3}
      />
    </svg>
  )
}

export function HeartDisplay({ hearts, maxHearts = 3 }: HeartDisplayProps) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: maxHearts }, (_, i) => {
        const isFilled = i < hearts
        return (
          <AnimatePresence key={i} mode="wait">
            {isFilled ? (
              <motion.div
                key={`filled-${i}`}
                initial={{ scale: 0, rotate: -15 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{
                  scale: [1, 1.2, 0],
                  rotate: [-15, 15, 0],
                  opacity: [1, 1, 0],
                  transition: { duration: 0.5, ease: 'easeOut' },
                }}
              >
                <HeartIcon filled />
              </motion.div>
            ) : (
              <motion.div
                key={`empty-${i}`}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <HeartIcon filled={false} />
              </motion.div>
            )}
          </AnimatePresence>
        )
      })}
    </div>
  )
}
