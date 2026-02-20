import { AnimatePresence, motion } from 'framer-motion'
import { useLocation, useOutlet } from 'react-router'
import { useRef } from 'react'

/**
 * AnimatePresence 기반 페이지 전환 컴포넌트
 *
 * 라우트 변경 시 exit → enter 전환 애니메이션을 재생한다.
 * - exit: opacity 0, y -8 (위로 빠져나감)
 * - enter: opacity 0 → 1, y 12 → 0 (아래에서 올라옴)
 * - easing: cubic-bezier easeOutExpo (0.22, 1, 0.36, 1)
 *
 * outlet 캐싱 전략:
 *   useOutlet()은 현재 라우트 아울렛을 반환하며, 라우트 변경 직후에는 null이 된다.
 *   AnimatePresence mode="wait"로 exit 애니메이션이 끝나기 전에 새 컴포넌트가
 *   렌더링되지 않도록 하고, prevOutletRef로 exit 중에 이전 outlet을 유지한다.
 */
export function PageTransition() {
  const location = useLocation()
  const outlet = useOutlet()
  const prevOutletRef = useRef(outlet)

  // outlet이 null이 아닐 때만 ref 업데이트 (exit 애니메이션 중 null 방지)
  if (outlet !== null) {
    prevOutletRef.current = outlet
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="h-full w-full"
      >
        {prevOutletRef.current}
      </motion.div>
    </AnimatePresence>
  )
}
