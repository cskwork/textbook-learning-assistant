// Phase 18: 스트릭 불꽃 CSS + Framer Motion 애니메이션
// StreakCounter 주변에 배치되는 불꽃 효과 (FunMode only)
import { motion } from 'framer-motion'

interface StreakFlameProps {
  /** 연속 학습 일수 */
  streakDays: number
  className?: string
}

type IntensityLevel = 'none' | 'weak' | 'medium' | 'strong' | 'max'

/** streakDays에 따른 인텐시티 레벨 */
function getIntensity(days: number): IntensityLevel {
  if (days >= 30) return 'max'
  if (days >= 14) return 'strong'
  if (days >= 7) return 'medium'
  if (days >= 3) return 'weak'
  return 'none'
}

/** 인텐시티별 불꽃 크기 (width, height) */
const flameSize: Record<IntensityLevel, { w: number; h: number }> = {
  none: { w: 0, h: 0 },
  weak: { w: 16, h: 20 },
  medium: { w: 22, h: 28 },
  strong: { w: 28, h: 36 },
  max: { w: 32, h: 42 },
}

/** 인텐시티별 불꽃 색상 */
const flameColors: Record<IntensityLevel, { primary: string; secondary: string; glow: string }> = {
  none: { primary: 'transparent', secondary: 'transparent', glow: 'transparent' },
  weak: { primary: '#fbbf24', secondary: '#f97316', glow: 'rgba(251,191,36,0.3)' },
  medium: { primary: '#f97316', secondary: '#ef4444', glow: 'rgba(249,115,22,0.4)' },
  strong: { primary: '#ef4444', secondary: '#dc2626', glow: 'rgba(239,68,68,0.5)' },
  max: { primary: '#60a5fa', secondary: '#8b5cf6', glow: 'rgba(96,165,250,0.6)' },
}

/** 인텐시티별 opacity */
const flameOpacity: Record<IntensityLevel, number> = {
  none: 0,
  weak: 0.6,
  medium: 0.8,
  strong: 1.0,
  max: 1.0,
}

/**
 * StreakFlame — 스트릭 불꽃 애니메이션 컴포넌트.
 *
 * - streakDays 기반 4단계 인텐시티: weak(3-6), medium(7-13), strong(14-29), max(30+)
 * - CSS gradient + Framer Motion 떨림 애니메이션
 * - 30일+ 스트릭 시 파란/보라 신비로운 불꽃 색상
 * - absolute 배치로 StreakCounter 아이콘 뒤에 위치
 */
export function StreakFlame({ streakDays, className = '' }: StreakFlameProps) {
  const intensity = getIntensity(streakDays)

  if (intensity === 'none') return null

  const size = flameSize[intensity]
  const colors = flameColors[intensity]
  const opacity = flameOpacity[intensity]

  return (
    <div className={`absolute pointer-events-none ${className}`} style={{ zIndex: -1 }}>
      {/* 메인 불꽃 레이어 */}
      <motion.div
        className="rounded-full"
        style={{
          width: size.w,
          height: size.h,
          background: `radial-gradient(ellipse at 50% 80%, ${colors.primary}, ${colors.secondary}, transparent)`,
          opacity,
          filter: `blur(3px)`,
          boxShadow: `0 0 ${size.w / 2}px ${colors.glow}`,
        }}
        animate={{
          y: [0, -3, 0],
          scale: [1, 1.08, 1],
          opacity: [opacity * 0.85, opacity, opacity * 0.85],
        }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* 보조 불꽃 레이어 (medium+) */}
      {(intensity === 'medium' || intensity === 'strong' || intensity === 'max') && (
        <motion.div
          className="absolute top-0 left-0 rounded-full"
          style={{
            width: size.w * 0.7,
            height: size.h * 0.8,
            left: size.w * 0.15,
            background: `radial-gradient(ellipse at 50% 70%, ${colors.primary}cc, transparent)`,
            opacity: opacity * 0.5,
            filter: 'blur(2px)',
          }}
          animate={{
            y: [0, -4, 0],
            scale: [1, 1.12, 1],
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.1,
          }}
        />
      )}

      {/* max 전용: 추가 파란 불꽃 레이어 */}
      {intensity === 'max' && (
        <motion.div
          className="absolute rounded-full"
          style={{
            width: size.w * 0.5,
            height: size.h * 0.6,
            left: size.w * 0.25,
            top: -size.h * 0.1,
            background: `radial-gradient(ellipse at 50% 60%, #c4b5fd, #818cf8, transparent)`,
            opacity: 0.7,
            filter: 'blur(4px)',
          }}
          animate={{
            y: [-2, -6, -2],
            scale: [0.9, 1.15, 0.9],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 1.0,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.2,
          }}
        />
      )}
    </div>
  )
}
