import { motion } from 'framer-motion'
import { useLocation, useOutlet } from 'react-router'

export function PageTransition() {
  const location = useLocation()
  const outlet = useOutlet()

  return (
    <motion.div
      key={location.pathname}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="h-full w-full"
    >
      {outlet}
    </motion.div>
  )
}
