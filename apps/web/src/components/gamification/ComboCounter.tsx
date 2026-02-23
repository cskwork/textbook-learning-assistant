// ComboCounter.tsx
// 격투 게임 스타일 콤보 카운터 팝업 컴포넌트
// Phase 16 보상 시스템

import { AnimatePresence, motion } from 'framer-motion'

interface ComboCounterProps {
  /** 현재 콤보 수 */
  comboCount: number
  /** 현재 콤보 XP 배수 (1x ~ 3x) */
  multiplier: number
}

/** 콤보 수에 따른 색상 클래스 반환 */
function getComboColor(count: number): string {
  if (count >= 5) return 'text-purple-400'
  if (count >= 4) return 'text-red-500'
  if (count >= 3) return 'text-orange-500'
  return 'text-yellow-400'
}

/** 콤보 수에 따른 글로우 색상 반환 */
function getGlowColor(count: number): string {
  if (count >= 5) return 'rgba(168, 85, 247, 0.7)'
  if (count >= 4) return 'rgba(239, 68, 68, 0.7)'
  if (count >= 3) return 'rgba(249, 115, 22, 0.7)'
  return 'rgba(250, 204, 21, 0.7)'
}

/** 콤보 수에 따른 spring 물리 설정 */
function getSpringConfig(count: number) {
  if (count >= 4)
    return { type: 'spring' as const, damping: 5, stiffness: 250 } // 더 강렬한 탄성
  if (count >= 3) return { type: 'spring' as const, damping: 6, stiffness: 220 }
  return { type: 'spring' as const, damping: 8, stiffness: 200 }
}

/**
 * ComboCounter — 격투 게임 스타일 콤보 카운터
 *
 * - comboCount >= 2일 때만 표시
 * - key={comboCount}로 매 콤보마다 새 애니메이션 트리거
 * - 콤보 수에 따라 색상, 글로우, 스프링 물리가 강해짐
 * - 화면 중앙에 fixed 포지션으로 오버레이
 */
export function ComboCounter({ comboCount, multiplier }: ComboCounterProps) {
  const show = comboCount >= 2

  const comboColor = getComboColor(comboCount)
  const glowColor = getGlowColor(comboCount)
  const springConfig = getSpringConfig(comboCount)

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key={comboCount}
          className="pointer-events-none fixed inset-0 z-50 flex flex-col items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.3 } }}
        >
          {/* 콤보 카운트 텍스트 */}
          <motion.div
            key={`combo-text-${comboCount}`}
            className={`text-5xl font-black leading-none ${comboColor}`}
            style={{
              textShadow: `0 0 20px ${glowColor}, 0 0 40px ${glowColor}, 0 4px 8px rgba(0,0,0,0.6)`,
              WebkitTextStroke: '1px rgba(0,0,0,0.3)',
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={springConfig}
          >
            {comboCount}x 콤보!
          </motion.div>

          {/* 배수 표시 */}
          <motion.div
            key={`multiplier-${comboCount}`}
            className="mt-1 text-xl font-bold text-white/80"
            style={{
              textShadow: '0 2px 4px rgba(0,0,0,0.5)',
            }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          >
            ×{multiplier} XP 배수
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
