// BossCharacter.tsx
// 보스 캐릭터 + 공격/피격 애니메이션 래퍼
// Phase 19 게임화 퀴즈 엔진

import { motion, AnimatePresence } from 'framer-motion'
import { BossSvg } from './BossSvg'
import { HpBar } from './HpBar'

type BossState = 'idle' | 'attacked' | 'attacking' | 'defeated'

interface BossCharacterProps {
  /** 현재 HP */
  hp: number
  /** 최대 HP */
  maxHp: number
  /** 보스 상태 (애니메이션 트리거) */
  state: BossState
  /** 보스 타입 */
  bossType?: string
  /** 대미지 텍스트 (피격 시 표시) */
  damageText?: string
}

const bossVariants = {
  idle: {
    x: 0,
    y: 0,
    scale: 1,
    opacity: 1,
    rotate: 0,
  },
  attacked: {
    x: [0, 20, -10, 5, 0],
    opacity: [1, 0.3, 0.7, 0.3, 1],
    scale: 1,
    rotate: 0,
    transition: { duration: 0.6 },
  },
  attacking: {
    x: [0, -80, -40, 0],
    scale: [1, 1.2, 1.1, 1],
    opacity: 1,
    rotate: 0,
    transition: { duration: 0.5 },
  },
  defeated: {
    scale: [1, 1.1, 0],
    opacity: [1, 1, 0],
    rotate: [0, 10, -90],
    transition: { duration: 0.8, ease: 'easeIn' as const },
  },
}

export function BossCharacter({ hp, maxHp, state, bossType: _bossType, damageText }: BossCharacterProps) {
  const isDefeated = hp <= 0
  const currentState = isDefeated ? 'defeated' : state

  return (
    <div className="flex flex-col items-center gap-3">
      {/* 보스 SVG + 애니메이션 */}
      <div className="relative">
        <motion.div
          variants={bossVariants}
          animate={currentState}
          initial="idle"
        >
          <BossSvg size={160} />
        </motion.div>

        {/* 대미지 텍스트 플로팅 */}
        <AnimatePresence>
          {damageText && state === 'attacked' && (
            <motion.div
              key={Date.now()}
              initial={{ y: -20, opacity: 1, scale: 0.8 }}
              animate={{ y: -60, opacity: 0, scale: 1.2 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="absolute top-0 left-1/2 -translate-x-1/2 text-red-500 font-bold text-2xl pointer-events-none"
            >
              {damageText}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 보스 HP 바 */}
      <div className="w-40">
        <HpBar
          current={hp}
          max={maxHp}
          label="BOSS"
          color="bg-purple-500"
          size="lg"
        />
      </div>
    </div>
  )
}
