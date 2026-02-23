// CircularTimer.tsx
// SVG 원형 타이머 — stroke-dasharray 기반 카운트다운 프로그레스
// Phase 19 게임화 퀴즈 엔진

import { motion } from 'framer-motion'

interface CircularTimerProps {
  /** 남은 시간 (초) */
  timeRemaining: number
  /** 총 시간 (초) */
  totalTime: number
  /** 크기 (px, 기본 80) */
  size?: number
}

const RADIUS = 45
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export function CircularTimer({ timeRemaining, totalTime, size = 80 }: CircularTimerProps) {
  const progress = totalTime > 0 ? timeRemaining / totalTime : 0
  const offset = CIRCUMFERENCE * (1 - progress)
  const isWarning = timeRemaining <= 5

  // 색상 결정
  const strokeColor = isWarning ? '#ef4444' : '#22d3ee'  // red-500 : cyan-400
  const textColor = isWarning ? 'text-red-500' : 'text-cyan-400'

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className="transform -rotate-90" style={{ width: size, height: size }}>
        {/* 배경 원 */}
        <circle
          cx="50"
          cy="50"
          r={RADIUS}
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          className="text-white/10"
        />
        {/* 프로그레스 원 */}
        <circle
          cx="50"
          cy="50"
          r={RADIUS}
          fill="none"
          stroke={strokeColor}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.3s ease-out' }}
        />
      </svg>

      {/* 중앙 숫자 */}
      <motion.span
        animate={isWarning ? { opacity: [1, 0.3, 1] } : { opacity: 1 }}
        transition={isWarning ? { duration: 0.5, repeat: Infinity } : {}}
        className={`absolute text-lg font-bold ${textColor}`}
      >
        {timeRemaining}
      </motion.span>
    </div>
  )
}
