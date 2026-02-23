// Leaderboard.tsx
// 반 내 XP 리더보드 컴포넌트 — TOP3 하이라이트 + 내 주변 ±2명
// Phase 16 보상 시스템

import { useEffect, useState } from 'react'
import { FadeIn } from '@/components/motion/FadeIn'
import {
  getClassLeaderboard,
  type LeaderboardEntry,
  type ClassLeaderboardResult,
} from '@/lib/gamification/gamification.service'

interface LeaderboardProps {
  /** 반 ID (없으면 본인만 표시) */
  groupId?: number | null
  /** 현재 사용자 studentId (email) */
  currentStudentId: string
}

/** 순위별 메달 이모지 */
const MEDAL: Record<number, string> = {
  1: '🥇',
  2: '🥈',
  3: '🥉',
}

/** 순위별 배경 스타일 */
const RANK_BG: Record<number, string> = {
  1: 'bg-yellow-500/10 border border-yellow-500/30',
  2: 'bg-gray-400/10 border border-gray-400/30',
  3: 'bg-amber-700/10 border border-amber-700/30',
}

/** 순위별 텍스트 색상 */
const RANK_TEXT: Record<number, string> = {
  1: 'text-yellow-400',
  2: 'text-gray-300',
  3: 'text-amber-600',
}

/**
 * 리더보드 항목 행 컴포넌트
 */
function LeaderboardRow({
  entry,
  isCurrentUser,
  compact = false,
}: {
  entry: LeaderboardEntry
  isCurrentUser: boolean
  compact?: boolean
}) {
  const rankStyle = RANK_BG[entry.rank] ?? ''
  const rankTextStyle = RANK_TEXT[entry.rank] ?? 'text-gray-400'
  const medal = MEDAL[entry.rank]

  return (
    <div
      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors ${
        isCurrentUser
          ? 'bg-primary/10 border border-primary/30'
          : rankStyle || 'border border-transparent'
      } ${compact ? '' : 'mb-1.5'}`}
    >
      {/* 순위 */}
      <div className={`w-8 text-center font-bold text-sm ${rankTextStyle}`}>
        {medal ?? `#${entry.rank}`}
      </div>

      {/* 아바타 + 이름 */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <span className="text-xl">{entry.avatarEmoji}</span>
        <span
          className={`text-sm font-semibold truncate ${
            isCurrentUser ? 'text-primary' : 'text-gray-200'
          }`}
        >
          {entry.displayName}
          {isCurrentUser && (
            <span className="ml-1 text-xs font-normal text-primary/70">(나)</span>
          )}
        </span>
      </div>

      {/* 레벨 뱃지 */}
      <div className="shrink-0 rounded-full bg-blue-600/20 px-2 py-0.5 text-xs font-bold text-blue-300">
        Lv.{entry.level}
      </div>

      {/* 스트릭 */}
      {entry.streakDays > 0 && (
        <div className="shrink-0 flex items-center gap-0.5 text-xs text-orange-400 font-semibold">
          <span>🔥</span>
          <span>{entry.streakDays}</span>
        </div>
      )}

      {/* XP */}
      <div className="shrink-0 text-right">
        <div className="text-xs font-bold text-yellow-400">
          {entry.totalXP.toLocaleString()}
        </div>
        <div className="text-[10px] text-gray-500">XP</div>
      </div>
    </div>
  )
}

/**
 * Leaderboard — 반 내 XP 리더보드
 *
 * - TOP 3 하이라이트 섹션 (금/은/동)
 * - 구분선
 * - 내 주변 ±2명 섹션 (현재 사용자 행 강조)
 * - 하단 요약: "전체 N명 중 M등"
 * - 빈 상태: 학생 1명일 때 메시지 표시
 * - POC 환경: 반원 데이터 없으면 본인만 표시
 */
export function Leaderboard({ groupId, currentStudentId }: LeaderboardProps) {
  const [data, setData] = useState<ClassLeaderboardResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!currentStudentId) return

    setIsLoading(true)
    setError(null)

    getClassLeaderboard(groupId, currentStudentId)
      .then((result) => {
        setData(result)
      })
      .catch((err) => {
        console.error('[Leaderboard] 로딩 실패:', err)
        setError('리더보드를 불러오는 중 오류가 발생했습니다.')
      })
      .finally(() => setIsLoading(false))
  }, [groupId, currentStudentId])

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="rounded-2xl bg-gray-800/60 p-4 border border-gray-700/50">
        <div className="animate-pulse space-y-3">
          <div className="h-5 w-32 rounded bg-gray-700" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 rounded-xl bg-gray-700/60" />
          ))}
        </div>
      </div>
    )
  }

  // 오류 상태
  if (error) {
    return (
      <div className="rounded-2xl bg-gray-800/60 p-4 border border-red-700/30 text-center">
        <p className="text-sm text-red-400">{error}</p>
      </div>
    )
  }

  if (!data) return null

  const { top3, surrounding, myRank, total } = data

  // 빈 상태: 학생 1명 (본인만 있음)
  if (total <= 1) {
    return (
      <FadeIn>
        <div className="rounded-2xl bg-gray-800/60 p-6 border border-gray-700/50 text-center">
          <div className="text-4xl mb-3">🏆</div>
          <p className="text-sm font-semibold text-gray-200 mb-1">
            첫 번째 참가자입니다!
          </p>
          <p className="text-xs text-gray-400">
            반 친구들과 함께 경쟁해보세요
          </p>
          {data.top3.length > 0 && (
            <div className="mt-4">
              <LeaderboardRow
                entry={data.top3[0]}
                isCurrentUser={data.top3[0].studentId === currentStudentId}
              />
            </div>
          )}
        </div>
      </FadeIn>
    )
  }

  // surrounding에서 top3와 겹치지 않는 항목만 표시
  const top3Ids = new Set(top3.map((e) => e.studentId))
  const surroundingFiltered = surrounding.filter((e) => !top3Ids.has(e.studentId))

  return (
    <FadeIn>
      <div className="rounded-2xl bg-gray-800/60 border border-gray-700/50 overflow-hidden">
        {/* 헤더 */}
        <div className="px-4 pt-4 pb-2 border-b border-gray-700/50">
          <h3 className="text-sm font-bold text-gray-100 flex items-center gap-1.5">
            <span>🏆</span>
            <span>반 리더보드</span>
          </h3>
        </div>

        <div className="p-3">
          {/* TOP 3 섹션 */}
          <div className="mb-1">
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2 px-1">
              Top 3
            </p>
            {top3.map((entry) => (
              <LeaderboardRow
                key={entry.studentId}
                entry={entry}
                isCurrentUser={entry.studentId === currentStudentId}
              />
            ))}
          </div>

          {/* 구분선 (내 주변 항목이 있을 때만) */}
          {surroundingFiltered.length > 0 && (
            <>
              <div className="my-2 flex items-center gap-2">
                <div className="flex-1 h-px bg-gray-700/70" />
                <span className="text-[10px] text-gray-500">내 주변</span>
                <div className="flex-1 h-px bg-gray-700/70" />
              </div>

              {/* 내 주변 ±2명 섹션 */}
              <div>
                {surroundingFiltered.map((entry) => (
                  <LeaderboardRow
                    key={entry.studentId}
                    entry={entry}
                    isCurrentUser={entry.studentId === currentStudentId}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* 하단 요약 */}
        <div className="px-4 py-2.5 border-t border-gray-700/50 bg-gray-900/30">
          <p className="text-xs text-center text-gray-400">
            전체{' '}
            <span className="font-bold text-gray-300">{total}명</span> 중{' '}
            <span className="font-bold text-primary">{myRank}등</span>
          </p>
        </div>
      </div>
    </FadeIn>
  )
}
