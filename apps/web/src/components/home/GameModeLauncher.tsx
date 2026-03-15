/**
 * GameModeLauncher — 4종 게임 모드 런처 카드 그리드
 *
 * 타임어택 / 서바이벌 / 보스배틀 / 미니게임
 * 각 카드는 GlassCard + NeonBorder 래핑, 호버 시 아이콘 glow 활성.
 */

import { useNavigate } from 'react-router'
import { motion } from 'framer-motion'
import { GlassCard, NeonBorder, NeonText } from '@/components/game/ui'
import { LightningIcon, HeartIcon, SkullIcon, StarIcon } from '@/components/game/icons'
import { db } from '@/lib/db'

interface GameMode {
  id: 'timeAttack' | 'survival' | 'bossBattle' | 'miniGame'
  label: string
  desc: string
  icon: typeof LightningIcon
  neonColor: 'green' | 'magenta' | 'gold'
  iconColor: string
}

const modes: GameMode[] = [
  {
    id: 'timeAttack',
    label: '타임어택',
    desc: '시간과의 싸움!',
    icon: LightningIcon,
    neonColor: 'green',
    iconColor: 'var(--fun-neon-cyan)',
  },
  {
    id: 'survival',
    label: '서바이벌',
    desc: '3번 틀리면 끝!',
    icon: HeartIcon,
    neonColor: 'green',
    iconColor: 'var(--fun-neon-red)',
  },
  {
    id: 'bossBattle',
    label: '보스배틀',
    desc: '보스를 쓰러뜨려라!',
    icon: SkullIcon,
    neonColor: 'magenta',
    iconColor: 'var(--fun-neon-magenta)',
  },
  {
    id: 'miniGame',
    label: '미니게임',
    desc: '재미있는 도전!',
    icon: StarIcon,
    neonColor: 'gold',
    iconColor: 'var(--fun-neon-gold)',
  },
]

export function GameModeLauncher() {
  const navigate = useNavigate()

  async function handleLaunch(modeId: GameMode['id']) {
    const allQuestions = await db.questions.toArray()
    if (allQuestions.length === 0) {
      navigate('/student/problems')
      return
    }

    const randomQuestion = allQuestions[Math.floor(Math.random() * allQuestions.length)]
    navigate(`/student/quiz/${randomQuestion.id}?mode=${modeId}`)
  }

  return (
    <div className="space-y-3">
      <NeonText as="h2" color="green" glow="low" className="text-sm font-bold tracking-wide">
        게임 모드
      </NeonText>

      <div className="grid grid-cols-2 gap-3">
        {modes.map((mode) => {
          const Icon = mode.icon
          return (
            <motion.div
              key={mode.id}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <NeonBorder color={mode.neonColor}>
                <GlassCard
                  className="p-4 cursor-pointer"
                  onClick={() => {
                    void handleLaunch(mode.id)
                  }}
                >
                  <div className="flex flex-col items-center text-center gap-2">
                    <Icon size={36} color={mode.iconColor} glow />
                    <NeonText
                      color={mode.neonColor}
                      glow="medium"
                      className="text-sm font-bold"
                    >
                      {mode.label}
                    </NeonText>
                    <p className="text-xs" style={{ color: 'var(--fun-text-muted)' }}>
                      {mode.desc}
                    </p>
                  </div>
                </GlassCard>
              </NeonBorder>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
