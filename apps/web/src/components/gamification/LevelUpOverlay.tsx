// LevelUpOverlay.tsx
// 풀스크린 레벨업 시네마틱 오버레이 컴포넌트
// Phase 16 보상 시스템

import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

interface LevelUpOverlayProps {
  /** 새로 달성한 레벨 */
  newLevel: number
  /** 오버레이 표시 여부 */
  visible: boolean
  /** 오버레이 닫기 콜백 */
  onDone: () => void
}

/**
 * LevelUpOverlay — 레벨업 시 2-3초간 표시되는 풀스크린 시네마틱 오버레이
 *
 * - fixed inset-0 z-[100] — 모든 UI 위에 표시
 * - 배경: 블랙 반투명(80%) fade-in
 * - 중앙: "LEVEL UP!" 대형 텍스트 spring 애니메이션 (scale 0.3→1)
 * - 서브: "Lv. N" 0.3초 delay fade-in
 * - 방사형 빛 효과 (radial-gradient glow)
 * - 2초 후 자동 닫힘, 클릭으로도 닫기 가능
 */
export function LevelUpOverlay({ newLevel, visible, onDone }: LevelUpOverlayProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // visible이 true가 되면 2초 후 자동 닫기
  useEffect(() => {
    if (visible) {
      timerRef.current = setTimeout(() => {
        onDone()
      }, 2500)
    }
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }
  }, [visible, onDone])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center cursor-pointer select-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={onDone}
        >
          {/* 배경: 블랙 반투명 */}
          <div className="absolute inset-0 bg-black/80" />

          {/* 방사형 빛 효과 */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(250,204,21,0.18) 0%, rgba(139,92,246,0.12) 40%, transparent 70%)',
            }}
          />

          {/* 외곽 광선 효과 */}
          <motion.div
            className="absolute inset-0"
            style={{
              background:
                'conic-gradient(from 0deg at 50% 50%, transparent 0%, rgba(250,204,21,0.06) 10%, transparent 20%, rgba(139,92,246,0.06) 30%, transparent 40%, rgba(250,204,21,0.06) 50%, transparent 60%, rgba(139,92,246,0.06) 70%, transparent 80%, rgba(250,204,21,0.06) 90%, transparent 100%)',
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          />

          {/* 중앙 콘텐츠 컨테이너 */}
          <div className="relative z-10 flex flex-col items-center gap-4">
            {/* LEVEL UP! 텍스트 — spring 애니메이션 */}
            <motion.div
              className="text-6xl font-black text-yellow-400 tracking-widest"
              style={{
                textShadow:
                  '0 0 30px rgba(250,204,21,0.9), 0 0 60px rgba(250,204,21,0.5), 0 4px 12px rgba(0,0,0,0.8)',
                WebkitTextStroke: '1px rgba(180, 140, 0, 0.5)',
              }}
              initial={{ scale: 0.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', damping: 10, stiffness: 200 }}
            >
              LEVEL UP!
            </motion.div>

            {/* 레벨 숫자 — 0.3초 delay fade-in */}
            <motion.div
              className="text-4xl font-bold text-white"
              style={{
                textShadow: '0 0 20px rgba(255,255,255,0.5), 0 2px 8px rgba(0,0,0,0.6)',
              }}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5, ease: 'easeOut' }}
            >
              Lv. {newLevel}
            </motion.div>

            {/* 장식 별 파티클 */}
            <motion.div
              className="flex items-center gap-3 text-2xl"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.4 }}
            >
              <span>⭐</span>
              <span>✨</span>
              <span>⭐</span>
            </motion.div>

            {/* 클릭 안내 */}
            <motion.p
              className="text-sm text-white/50 mt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              탭하여 계속
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
