// DailyChallenge.tsx
// 데일리 챌린지 카드 컴포넌트 — 오늘의 챌린지 문제 수 + 완료 상태
// Phase 16 보상 시스템

import { useEffect, useState } from 'react'
import { FadeIn } from '@/components/motion/FadeIn'
import {
  getDailyChallengeConfig,
  isDailyChallengeCompleted,
  type DailyChallengeConfig,
} from '@/lib/gamification/challenge.service'

interface DailyChallengeProps {
  /** 학생 ID (email) */
  studentId: string
  /** 챌린지 시작 콜백 */
  onStartChallenge: () => void
}

/** 요일 한국어 이름 */
const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토']

/** 오늘 날짜를 "M월 D일 (요일)" 형식으로 반환 */
function formatDateKorean(date: Date): string {
  const month = date.getMonth() + 1
  const day = date.getDate()
  const dayName = DAY_NAMES[date.getDay()]
  return `${month}월 ${day}일 (${dayName})`
}

/** 난이도별 이모지 */
function getDifficultyEmoji(difficulty: number): string {
  if (difficulty >= 4) return '🔥'
  if (difficulty >= 3) return '⚡'
  return '✨'
}

/**
 * DailyChallenge — 오늘의 챌린지 카드 위젯
 *
 * - 요일에 따라 3~5문제 + 난이도 변동
 * - 주말: "🎉 주말 특별 챌린지!" 배지 표시
 * - 완료 상태: 체크마크 + "완료!" + 버튼 비활성화
 * - 미완료: "도전하기" 버튼 → onStartChallenge 콜백
 * - 보상 미리보기: "+500 XP 보너스!" 표시
 * - FadeIn 래퍼 진입 애니메이션
 */
export function DailyChallenge({ studentId, onStartChallenge }: DailyChallengeProps) {
  const [config, setConfig] = useState<DailyChallengeConfig | null>(null)
  const [isCompleted, setIsCompleted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!studentId) return

    const today = new Date()
    const dailyConfig = getDailyChallengeConfig(today)
    setConfig(dailyConfig)

    isDailyChallengeCompleted(studentId, today)
      .then((completed) => setIsCompleted(completed))
      .catch((err) => console.error('[DailyChallenge] 완료 여부 확인 실패:', err))
      .finally(() => setIsLoading(false))
  }, [studentId])

  if (isLoading || !config) {
    return (
      <div className="rounded-2xl bg-gray-800/60 p-4 border border-gray-700/50">
        <div className="animate-pulse space-y-3">
          <div className="h-4 w-24 rounded bg-gray-700" />
          <div className="h-12 rounded-xl bg-gray-700/60" />
          <div className="h-10 rounded-xl bg-gray-700/60" />
        </div>
      </div>
    )
  }

  const today = new Date()
  const dateLabel = formatDateKorean(today)
  const difficultyEmoji = getDifficultyEmoji(config.difficulty)

  return (
    <FadeIn>
      <div
        className={`rounded-2xl border p-4 transition-colors ${
          isCompleted
            ? 'bg-green-900/20 border-green-700/40'
            : 'bg-gray-800/60 border-gray-700/50'
        }`}
      >
        {/* 헤더 */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-gray-100 flex items-center gap-1.5">
              <span>📋</span>
              <span>오늘의 챌린지</span>
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">{dateLabel}</p>
          </div>

          {/* 주말 특별 배지 */}
          {config.isWeekend && (
            <span className="rounded-full bg-pink-600/20 border border-pink-500/30 px-2 py-0.5 text-[10px] font-bold text-pink-300">
              🎉 주말 특별
            </span>
          )}
        </div>

        {/* 챌린지 정보 */}
        <div className="flex items-center gap-3 mb-4 py-3 rounded-xl bg-gray-700/40 px-3">
          <span className="text-3xl">{difficultyEmoji}</span>
          <div>
            <div className="text-lg font-black text-gray-100">
              {config.questionCount}문제 도전
            </div>
            <div className="text-xs text-gray-400">
              난이도{' '}
              <span className="font-bold">
                {'★'.repeat(config.difficulty)}{'☆'.repeat(5 - config.difficulty)}
              </span>
            </div>
          </div>

          {/* 완료 체크마크 */}
          {isCompleted && (
            <div className="ml-auto flex flex-col items-center">
              <span className="text-2xl">✅</span>
              <span className="text-xs font-bold text-green-400 mt-0.5">완료!</span>
            </div>
          )}
        </div>

        {/* 보상 미리보기 */}
        <div className="mb-3 flex items-center gap-1.5 text-xs text-yellow-400/80">
          <span>🎁</span>
          <span>완료 시 <span className="font-bold text-yellow-400">+500 XP</span> 보너스!</span>
        </div>

        {/* 도전하기 / 완료 버튼 */}
        <button
          onClick={isCompleted ? undefined : onStartChallenge}
          disabled={isCompleted}
          className={`w-full rounded-xl py-2.5 text-sm font-bold transition-all ${
            isCompleted
              ? 'bg-green-800/30 text-green-400 cursor-default'
              : 'bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white shadow-md shadow-blue-900/40'
          }`}
        >
          {isCompleted ? '✓ 오늘의 챌린지 완료' : '도전하기'}
        </button>
      </div>
    </FadeIn>
  )
}
