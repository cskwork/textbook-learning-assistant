// GameResult.tsx
// 모든 게임 모드 공통 결과 화면 — 점수 카운트업 + 신기록 배너
// Phase 19 게임화 퀴즈 엔진

import { useEffect, useRef, useState, lazy, Suspense } from 'react'
import { motion } from 'framer-motion'
import { saveGameRecord } from '@/lib/gamification/game-records.service'
import { useSfx } from '@/hooks/useSfx'
import type { GameMode } from '@/lib/db'

// Phase 18: 컨페티 (lazy load → game-confetti 청크)
const ConfettiEffect = lazy(() => import('@/components/game/effects/ConfettiEffect'))

// ─── 모드 라벨 매핑 ──────────────────────────────────────────────────────────

const MODE_LABELS: Record<GameMode, { name: string; color: string }> = {
  timeAttack: { name: '타임어택', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  survival: { name: '서바이벌', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  bossBattle: { name: '보스 배틀', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  miniGame: { name: '미니게임', color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
}

// ─── Props ──────────────────────────────────────────────────────────────────

interface GameResultProps {
  mode: GameMode
  correctCount: number
  totalQuestions: number
  score: number
  xpEarned: number
  timeElapsed: number  // 초
  isPersonalBest: boolean
  metadata?: Record<string, unknown>
  onRetry: () => void
  onModeSelect: () => void
  onHome: () => void
}

// ─── 카운트업 애니메이션 훅 ──────────────────────────────────────────────────

function useCountUp(target: number, duration: number = 1000, delay: number = 0) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      const startTime = Date.now()
      const frame = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(1, elapsed / duration)
        // easeOutCubic
        const eased = 1 - Math.pow(1 - progress, 3)
        setValue(Math.round(target * eased))
        if (progress < 1) requestAnimationFrame(frame)
      }
      requestAnimationFrame(frame)
    }, delay)

    return () => clearTimeout(timer)
  }, [target, duration, delay])

  return value
}

// ─── 컴포넌트 ────────────────────────────────────────────────────────────────

export default function GameResult({
  mode,
  correctCount,
  totalQuestions,
  score,
  xpEarned,
  timeElapsed,
  isPersonalBest,
  metadata,
  onRetry,
  onModeSelect,
  onHome,
}: GameResultProps) {
  const { playSfx } = useSfx()
  const saveGuardRef = useRef(false)

  // 카운트업 애니메이션
  const animatedScore = useCountUp(score, 1000, 200)
  const animatedXP = useCountUp(xpEarned, 800, 500)

  // 시간 포맷
  const minutes = Math.floor(timeElapsed / 60)
  const seconds = timeElapsed % 60
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`

  // 정답 비율
  const accuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0

  // 모드 라벨
  const modeInfo = MODE_LABELS[mode]

  // 게임 기록 저장 (1회만)
  useEffect(() => {
    if (saveGuardRef.current) return
    saveGuardRef.current = true

    saveGameRecord({
      studentId: '', // 상위에서 주입 — 현재 컴포넌트는 studentId를 직접 받지 않음
      mode,
      score,
      correctCount,
      totalQuestions,
      xpEarned,
      timeElapsed,
      metadata,
    }).catch(() => {
      // 저장 실패 시 무시 (UX 차단 방지)
    })
  }, [mode, score, correctCount, totalQuestions, xpEarned, timeElapsed, metadata])

  // 신기록 시 SFX
  useEffect(() => {
    if (isPersonalBest) {
      playSfx('levelUp')
    }
  }, [isPersonalBest, playSfx])

  return (
    <div className="space-y-6">
      {/* 신기록 컨페티 */}
      {isPersonalBest && (
        <Suspense fallback={null}>
          <ConfettiEffect fire={isPersonalBest} />
        </Suspense>
      )}

      {/* 결과 카드 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="rounded-2xl border-2 border-white/10 bg-gradient-to-b from-gray-900 to-gray-950 p-6 space-y-5"
      >
        {/* 모드 배지 */}
        <div className="flex items-center justify-center">
          <span className={`px-4 py-1.5 rounded-full border text-sm font-bold ${modeInfo.color}`}>
            {modeInfo.name}
          </span>
        </div>

        {/* 신기록 배너 */}
        {isPersonalBest && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.3, 1], opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-center"
          >
            <motion.span
              animate={{ opacity: [1, 0.6, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-2xl font-black text-amber-400"
            >
              NEW RECORD!
            </motion.span>
          </motion.div>
        )}

        {/* 결과 항목 — stagger 순차 등장 */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.15, delayChildren: 0.2 } },
          }}
          className="space-y-4"
        >
          {/* 점수 */}
          <ResultItem label="점수" delay={0}>
            <span className="text-3xl font-black text-white tabular-nums">
              {animatedScore}
            </span>
          </ResultItem>

          {/* XP 획득 */}
          <ResultItem label="획득 XP" delay={1}>
            <span className="text-2xl font-bold text-cyan-400 tabular-nums">
              +{animatedXP} XP
            </span>
          </ResultItem>

          {/* 정답 비율 */}
          <ResultItem label="정답 비율" delay={2}>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-white">
                {correctCount}/{totalQuestions}
              </span>
              <span className="text-sm text-foreground/60">({accuracy}%)</span>
            </div>
          </ResultItem>

          {/* 소요 시간 */}
          <ResultItem label="소요 시간" delay={3}>
            <span className="text-xl font-bold text-white tabular-nums">{timeFormatted}</span>
          </ResultItem>

          {/* 보스 배틀 추가 정보 */}
          {metadata?.bossDefeated !== undefined && (
            <ResultItem label="보스" delay={4}>
              <span className={`text-lg font-bold ${metadata.bossDefeated ? 'text-green-400' : 'text-red-400'}`}>
                {metadata.bossDefeated ? '처치 완료!' : '보스 승리...'}
              </span>
            </ResultItem>
          )}
        </motion.div>
      </motion.div>

      {/* 액션 버튼 3종 */}
      <div className="flex flex-col gap-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onRetry}
          className="w-full rounded-xl h-12 bg-cyan-600 text-white font-bold text-base
                     hover:bg-cyan-500 transition-colors"
        >
          다시 하기
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onModeSelect}
          className="w-full rounded-xl h-12 border-2 border-white/20 text-white font-bold text-base
                     hover:bg-white/5 transition-colors"
        >
          모드 선택으로
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onHome}
          className="w-full rounded-xl h-10 text-foreground/50 font-medium text-sm
                     hover:text-foreground/80 transition-colors"
        >
          홈으로
        </motion.button>
      </div>
    </div>
  )
}

// ─── 결과 항목 래퍼 ──────────────────────────────────────────────────────────

function ResultItem({ label, children }: { label: string; children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
      }}
      className="flex items-center justify-between px-2"
    >
      <span className="text-sm text-foreground/50 font-medium">{label}</span>
      {children}
    </motion.div>
  )
}
