// XPFloatingText.tsx
// +NNN XP 플로팅 텍스트 애니메이션 컴포넌트
// Phase 16 보상 시스템

import { AnimatePresence, motion } from 'framer-motion'

interface XPFloatingTextProps {
  /** 획득 XP 수치 */
  amount: number
  /** 표시 여부 */
  visible: boolean
  /** 애니메이션 완료 콜백 */
  onComplete?: () => void
}

/**
 * XPFloatingText — XP 획득 시 위로 떠오르며 사라지는 플로팅 텍스트
 *
 * - visible=true일 때 AnimatePresence로 마운트/언마운트 애니메이션
 * - 위로 떠오르며(y: -60) 커지고(scale: 1.2) 사라짐(opacity: 0)
 * - pointer-events-none으로 클릭 이벤트 차단
 * - onComplete 콜백으로 부모에 완료 알림
 */
export function XPFloatingText({ amount, visible, onComplete }: XPFloatingTextProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key={`xp-float-${amount}`}
          className="pointer-events-none z-50 text-2xl font-bold text-yellow-400 drop-shadow-lg"
          style={{
            textShadow: '0 0 10px rgba(250, 204, 21, 0.8), 0 2px 4px rgba(0,0,0,0.5)',
          }}
          initial={{ opacity: 1, y: 0, scale: 1 }}
          animate={{ opacity: 0, y: -60, scale: 1.2 }}
          exit={{}}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          onAnimationComplete={onComplete}
        >
          +{amount} XP
        </motion.div>
      )}
    </AnimatePresence>
  )
}
