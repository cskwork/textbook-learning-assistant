// GameModeSelector.tsx
// 게임 모드 선택 카드 UI — FunMode 활성화 시 5가지 모드 카드 표시
// Phase 19 게임화 퀴즈 엔진

import { motion } from 'framer-motion'
import type { GameMode } from '@/lib/db'
import type { Question } from '@/lib/db'

// ─── 모드 정의 ─────────────────────────────────────────────────────────────────

type SelectableMode = GameMode | 'normal'

interface ModeCardConfig {
  mode: SelectableMode
  name: string
  description: string
  icon: React.ReactNode
  color: string       // 테두리/강조 색상 (Tailwind)
  bgGradient: string  // 배경 그라데이션
}

const MODE_CARDS: ModeCardConfig[] = [
  {
    mode: 'normal',
    name: '일반 모드',
    description: '기존 문제 풀기',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8">
        <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    color: 'border-blue-500/50',
    bgGradient: 'from-blue-950/50 to-blue-900/30',
  },
  {
    mode: 'timeAttack',
    name: '타임어택',
    description: '제한 시간 내 10문제!',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    color: 'border-amber-500/50',
    bgGradient: 'from-amber-950/50 to-amber-900/30',
  },
  {
    mode: 'survival',
    name: '서바이벌',
    description: '하트 3개로 끝까지!',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
        <path
          d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
          fill="#ef4444"
          stroke="#ef4444"
          strokeWidth="2"
        />
      </svg>
    ),
    color: 'border-red-500/50',
    bgGradient: 'from-red-950/50 to-red-900/30',
  },
  {
    mode: 'bossBattle',
    name: '보스 배틀',
    description: 'RPG 전투로 보스 처치!',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8">
        <path d="M14.5 17.5L3 6V3h3l11.5 11.5" />
        <path d="M13 19l6-6" />
        <path d="M16 16l4 4" />
        <path d="M19 21l2-2" />
      </svg>
    ),
    color: 'border-purple-500/50',
    bgGradient: 'from-purple-950/50 to-purple-900/30',
  },
  {
    mode: 'miniGame',
    name: '미니게임',
    description: '수식 조합 게임!',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8">
        <rect x="2" y="6" width="20" height="12" rx="2" />
        <path d="M6 12h4" />
        <path d="M8 10v4" />
        <circle cx="15" cy="11" r="1" />
        <circle cx="18" cy="13" r="1" />
      </svg>
    ),
    color: 'border-cyan-500/50',
    bgGradient: 'from-cyan-950/50 to-cyan-900/30',
  },
]

// ─── 컨테이너 애니메이션 ───────────────────────────────────────────────────────

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.15,
    },
  },
}

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { duration: 0.4, ease: 'easeOut' as const } },
}

// ─── Props ──────────────────────────────────────────────────────────────────

interface GameModeSelectorProps {
  /** 모드 선택 콜백 */
  onSelectMode: (mode: SelectableMode) => void
  /** 사용 가능한 문제 목록 (문제 수 표시용) */
  questions?: Question[]
  /** 게임 문제 세트 준비 여부 (타임어택/서바이벌/보스배틀 활성화 기준) */
  isGameQuestionsReady?: boolean
}

// ─── 컴포넌트 ────────────────────────────────────────────────────────────────

export function GameModeSelector({
  onSelectMode,
  questions,
  isGameQuestionsReady = false,
}: GameModeSelectorProps) {
  const questionCount = questions?.length ?? 0

  return (
    <div className="space-y-6">
      {/* 타이틀 */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center space-y-2"
      >
        <h2 className="text-2xl font-bold text-white">게임 모드 선택</h2>
        <p className="text-sm text-foreground/60">
          {questionCount > 0 ? `${questionCount}문제 준비됨` : '문제를 선택하세요'}
        </p>
      </motion.div>

      {/* 모드 카드 그리드 */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 gap-3"
      >
        {MODE_CARDS.map((card) => {
          const requiresQuestions =
            card.mode === 'timeAttack' || card.mode === 'survival' || card.mode === 'bossBattle'
          const disabled = requiresQuestions && !isGameQuestionsReady

          return (
            <motion.button
              key={card.mode}
              type="button"
              variants={item}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectMode(card.mode)}
              disabled={disabled}
              className={`
                relative overflow-hidden rounded-2xl border-2 ${card.color}
                bg-gradient-to-br ${card.bgGradient}
                p-5 text-left transition-shadow duration-200
                hover:shadow-lg hover:shadow-black/20
                focus:outline-none focus:ring-2 focus:ring-white/20
                disabled:opacity-45 disabled:cursor-not-allowed disabled:hover:shadow-none
              `}
            >
              <div className="flex items-start gap-4">
                {/* 아이콘 */}
                <div className="text-white/80 shrink-0">{card.icon}</div>
                {/* 텍스트 */}
                <div className="space-y-1 min-w-0">
                  <h3 className="text-lg font-bold text-white">{card.name}</h3>
                  <p className="text-sm text-foreground/70">{card.description}</p>
                  {disabled && (
                    <p className="text-xs text-amber-300/90 mt-1">문제 세트 로딩 중...</p>
                  )}
                </div>
              </div>
            </motion.button>
          )
        })}
      </motion.div>
    </div>
  )
}
