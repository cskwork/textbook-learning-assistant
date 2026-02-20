import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

/**
 * 범용 fade-in 래퍼 컴포넌트
 *
 * 자식 요소를 아래에서 위로 페이드인시킨다.
 * delay/duration/y props로 stagger 애니메이션 구성 가능.
 * whileInView + viewport.once로 스크롤 기반 fade-in 지원.
 */
interface FadeInProps {
  children: ReactNode
  /** 애니메이션 시작 지연 (초, 기본값: 0) */
  delay?: number
  /** 애니메이션 지속 시간 (초, 기본값: 0.4) */
  duration?: number
  /** 시작 y 오프셋 (px, 기본값: 16) */
  y?: number
  /** 추가 CSS 클래스 */
  className?: string
  /** 스크롤 진입 시 트리거 (기본값: false) */
  inView?: boolean
}

export function FadeIn({
  children,
  delay = 0,
  duration = 0.4,
  y = 16,
  className,
  inView = false,
}: FadeInProps) {
  const initial = { opacity: 0, y }
  const animate = { opacity: 1, y: 0 }
  const transition = { duration, delay, ease: [0.22, 1, 0.36, 1] as const }

  if (inView) {
    return (
      <motion.div
        className={className}
        initial={initial}
        whileInView={animate}
        viewport={{ once: true }}
        transition={transition}
      >
        {children}
      </motion.div>
    )
  }

  return (
    <motion.div
      className={className}
      initial={initial}
      animate={animate}
      transition={transition}
    >
      {children}
    </motion.div>
  )
}
