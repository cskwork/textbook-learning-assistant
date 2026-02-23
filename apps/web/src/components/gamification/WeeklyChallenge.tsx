// WeeklyChallenge.tsx
// 주간 챌린지 진행 바 컴포넌트 — 이번 주 목표 대비 현재 진행률
// Phase 16 보상 시스템

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FadeIn } from '@/components/motion/FadeIn'
import { StarIcon, TrophyIcon, GemIcon } from '@/components/game/icons'
import {
  getWeeklyChallengeProgress,
  type WeeklyChallengeProgress,
} from '@/lib/gamification/challenge.service'

interface WeeklyChallengeProps {
  /** 학생 ID (email) */
  studentId: string
}

/** 이번 주 기간을 "M/D ~ M/D" 형식으로 반환 */
function formatWeekRange(weekStartDate: string): string {
  const start = new Date(weekStartDate + 'T00:00:00')
  const end = new Date(start)
  end.setDate(start.getDate() + 6)

  const fmt = (d: Date) => `${d.getMonth() + 1}/${d.getDate()}`
  return `${fmt(start)} ~ ${fmt(end)}`
}

/** 진행률에 따른 격려 메시지 */
function getEncourageMessage(progress: number, remaining: number): string {
  if (progress >= 1) return '이번 주 목표 달성! 대단해요!'
  if (progress >= 0.8) return `거의 다 왔어요! ${remaining}문제만 더!`
  if (progress >= 0.5) return `절반 넘었어요! ${remaining}문제 남았어요`
  if (progress >= 0.2) return `좋은 시작! ${remaining}문제 남았어요`
  return `이번 주 목표: ${remaining}문제 더 풀어요!`
}

/**
 * WeeklyChallenge — 주간 챌린지 진행 바 위젯
 *
 * - 이번 주 월~일 기간 표시
 * - Framer Motion 애니메이션 진행 바
 * - 목표 달성 시: 축하 텍스트 + 보너스 XP 표시
 * - 미달성 시: 남은 문제 수 + 격려 메시지
 * - FadeIn 래퍼 진입 애니메이션
 */
export function WeeklyChallenge({ studentId }: WeeklyChallengeProps) {
  const [progress, setProgress] = useState<WeeklyChallengeProgress | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!studentId) return

    setIsLoading(true)
    setError(null)

    getWeeklyChallengeProgress(studentId)
      .then((data) => setProgress(data))
      .catch((err) => {
        console.error('[WeeklyChallenge] 로딩 실패:', err)
        setError('주간 챌린지 정보를 불러오지 못했습니다.')
      })
      .finally(() => setIsLoading(false))
  }, [studentId])

  if (isLoading) {
    return (
      <div className="rounded-2xl bg-gray-800/60 p-4 border border-gray-700/50">
        <div className="animate-pulse space-y-3">
          <div className="h-4 w-28 rounded bg-gray-700" />
          <div className="h-3 rounded-full bg-gray-700/60" />
          <div className="h-4 w-20 rounded bg-gray-700/60" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl bg-gray-800/60 p-4 border border-red-700/30 text-center">
        <p className="text-sm text-red-400">{error}</p>
      </div>
    )
  }

  if (!progress) return null

  const { weekStartDate, correctCount, targetCount, isCompleted } = progress
  const progressRatio = Math.min(1, correctCount / targetCount)
  const remaining = Math.max(0, targetCount - correctCount)
  const weekRange = formatWeekRange(weekStartDate)
  const bonusXP = 1000 // 주간 챌린지 완료 보너스

  return (
    <FadeIn>
      <div
        className={`rounded-2xl border p-4 transition-colors ${
          isCompleted
            ? 'bg-purple-900/20 border-purple-700/40'
            : 'bg-gray-800/60 border-gray-700/50'
        }`}
      >
        {/* 헤더 */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-gray-100 flex items-center gap-1.5">
              <StarIcon size={16} color="#a78bfa" />
              <span>주간 챌린지</span>
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">이번 주 {weekRange}</p>
          </div>

          {isCompleted && (
            <span className="rounded-full bg-purple-600/20 border border-purple-500/30 px-2 py-0.5 text-[10px] font-bold text-purple-300 flex items-center gap-1">
              <TrophyIcon size={12} color="#c084fc" />
              완료!
            </span>
          )}
        </div>

        {/* 진행 현황 */}
        <div className="mb-2">
          <div className="flex items-baseline justify-between mb-1.5">
            <span className="text-sm font-bold text-gray-200">
              <span className={isCompleted ? 'text-purple-300' : 'text-blue-300'}>
                {correctCount}
              </span>
              <span className="text-gray-500">/{targetCount}문제</span>
            </span>
            <span className="text-xs font-bold text-gray-400">
              {Math.round(progressRatio * 100)}%
            </span>
          </div>

          {/* 진행 바 */}
          <div className="relative h-3 rounded-full bg-gray-700/80 overflow-hidden">
            {/* 배경 글로우 */}
            <div className="absolute inset-0 rounded-full opacity-20"
              style={{
                background: isCompleted
                  ? 'linear-gradient(90deg, rgba(168,85,247,0.3) 0%, rgba(236,72,153,0.3) 100%)'
                  : 'linear-gradient(90deg, rgba(59,130,246,0.3) 0%, rgba(168,85,247,0.3) 100%)',
              }}
            />

            {/* 채워지는 진행 바 — Framer Motion */}
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full"
              style={{
                background: isCompleted
                  ? 'linear-gradient(90deg, #7c3aed 0%, #a855f7 50%, #ec4899 100%)'
                  : 'linear-gradient(90deg, #3b82f6 0%, #8b5cf6 60%, #a855f7 100%)',
                boxShadow: isCompleted
                  ? '0 0 8px rgba(168, 85, 247, 0.7)'
                  : '0 0 8px rgba(139, 92, 246, 0.6)',
              }}
              initial={{ width: 0 }}
              animate={{ width: `${progressRatio * 100}%` }}
              transition={{ duration: 1.0, ease: 'easeOut' }}
            />

            {/* 하이라이트 */}
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full opacity-30"
              style={{
                background: 'linear-gradient(180deg, rgba(255,255,255,0.5) 0%, transparent 100%)',
              }}
              animate={{ width: `${progressRatio * 100}%` }}
              transition={{ duration: 1.0, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* 격려/완료 메시지 */}
        <p className={`text-xs mb-3 ${isCompleted ? 'text-purple-300 font-semibold' : 'text-gray-400'}`}>
          {getEncourageMessage(progressRatio, remaining)}
        </p>

        {/* 완료 보너스 또는 보상 미리보기 */}
        {isCompleted ? (
          <div className="flex items-center gap-1.5 rounded-xl bg-purple-700/20 border border-purple-600/30 px-3 py-2">
            <TrophyIcon size={20} color="#c084fc" glow />
            <span className="text-sm font-bold text-purple-200">
              +{bonusXP.toLocaleString()} XP 보너스 획득!
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-xs text-yellow-400/80">
            <GemIcon size={14} color="#fbbf24" />
            <span>
              완료 시 <span className="font-bold text-yellow-400">+{bonusXP.toLocaleString()} XP</span> 보너스!
            </span>
          </div>
        )}
      </div>
    </FadeIn>
  )
}
