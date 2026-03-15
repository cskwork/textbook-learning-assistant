/**
 * MonsterCard -- 개별 몬스터(틀린 문제) 카드
 */

import { motion } from 'framer-motion'
import { GlassCard, NeonBorder, NeonText } from '@/components/game/ui'
import { MonsterSvg } from './MonsterSvg'

type Difficulty = 'easy' | 'medium' | 'hard'

interface MonsterCardProps {
  questionId: number
  questionType?: string
  unitName?: string
  difficulty?: Difficulty
  wrongCount?: number
  lastAttemptDate?: string
  defeated?: boolean
  onClick?: () => void
}

const neonColorMap: Record<Difficulty, 'green' | 'magenta' | 'gold'> = {
  easy: 'green',
  medium: 'green',
  hard: 'magenta',
}

export function MonsterCard({
  questionType,
  unitName,
  difficulty = 'easy',
  wrongCount = 1,
  lastAttemptDate,
  defeated = false,
  onClick,
}: MonsterCardProps) {
  const borderColor = difficulty === 'easy' ? undefined : neonColorMap[difficulty]

  const card = (
    <GlassCard
      className="p-3 cursor-pointer"
      onClick={onClick}
    >
      <div className="flex flex-col items-center text-center gap-2">
        <MonsterSvg
          type={questionType}
          difficulty={difficulty}
          defeated={defeated}
          size={48}
        />
        <NeonText
          color={defeated ? 'green' : (difficulty === 'hard' ? 'magenta' : 'green')}
          glow="low"
          className="text-xs font-bold truncate max-w-full"
        >
          {unitName ?? questionType ?? '???'}
        </NeonText>
        <div className="flex items-center gap-2 text-[10px]" style={{ color: 'var(--fun-text-muted)' }}>
          <span>{wrongCount}회 오답</span>
          {lastAttemptDate && <span>{lastAttemptDate}</span>}
        </div>
        {defeated && (
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{
              background: 'rgba(0, 255, 136, 0.15)',
              color: 'var(--fun-neon-green)',
            }}
          >
            처치 완료
          </span>
        )}
      </div>
    </GlassCard>
  )

  return (
    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
      {borderColor ? <NeonBorder color={borderColor}>{card}</NeonBorder> : card}
    </motion.div>
  )
}
