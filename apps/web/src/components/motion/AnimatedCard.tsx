import { motion } from 'framer-motion'
import type { ReactNode, MouseEventHandler } from 'react'

/**
 * hover 확대 + shadow 전환 카드 컴포넌트
 *
 * Framer Motion motion.div 기반 마이크로 인터랙션:
 * - hover: scale 1.02, y -2px (살짝 위로 뜨는 효과)
 * - tap: scale 0.98 (터치/클릭 피드백)
 * - layoutId: Framer Motion 공유 레이아웃 애니메이션 지원
 *
 * 기존 Card 스타일(rounded-2xl, shadow)을 className으로 병합 가능.
 */
interface AnimatedCardProps {
  children: ReactNode
  /** 추가 CSS 클래스 */
  className?: string
  /** 클릭 핸들러 */
  onClick?: MouseEventHandler<HTMLDivElement>
  /** Framer Motion 공유 레이아웃 애니메이션 ID */
  layoutId?: string
}

export function AnimatedCard({
  children,
  className = '',
  onClick,
  layoutId,
}: AnimatedCardProps) {
  return (
    <motion.div
      layoutId={layoutId}
      className={`rounded-2xl bg-card shadow-sm ${className}`}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : undefined }}
    >
      {children}
    </motion.div>
  )
}
