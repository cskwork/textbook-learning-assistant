/**
 * FunModeHome — 반전 모드 홈 화면 래퍼
 *
 * 다크 배경 + 네온 스타일 풀스크린 레이아웃:
 * - GameDashboard (XP/레벨/스트릭/데일리)
 * - GameModeLauncher (4종 모드 카드)
 * - MiniLeaderboard (TOP 3)
 */

import { useAuth } from '@/contexts/AuthContext'
import { useGamification } from '@/hooks/useGamification'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { GameDashboard } from './GameDashboard'
import { GameModeLauncher } from './GameModeLauncher'
import { MiniLeaderboard } from './MiniLeaderboard'
import { NeonText } from '@/components/game/ui'
import { SwordIcon } from '@/components/game/icons'
import { GameLoadingSpinner } from '@/components/game/GameLoadingSpinner'

export function FunModeHome() {
  const { user } = useAuth()
  const { profile, xpProgress, xpForNextLevel, isLoading } = useGamification(user?.email)

  const todayStart = (() => {
    const d = new Date(); d.setHours(0, 0, 0, 0); return d.getTime()
  })()

  const todayCount = useLiveQuery(
    () => user
      ? db.quizAttempts.where('studentId').equals(user.email)
          .filter((a) => a.attemptedAt >= todayStart).count()
      : 0,
    [user?.email, todayStart],
  ) ?? 0

  const studentGroupId = useLiveQuery(
    async () => {
      if (!user) return null
      const membership = await db.groupMembers.where('studentId').equals(user.email).first()
      return membership?.groupId ?? null
    },
    [user?.email],
  )

  if (isLoading || !profile) {
    return <GameLoadingSpinner />
  }

  const userName = user?.email?.split('@')[0] ?? '모험가'

  return (
    <div
      className="min-h-screen p-4 md:p-6 lg:p-8 max-w-4xl mx-auto space-y-5"
      style={{ background: 'var(--fun-bg-primary)', color: 'var(--fun-text-primary)' }}
    >
      {/* 인사 영역 */}
      <div className="flex items-center gap-3">
        <SwordIcon size={28} color="var(--fun-neon-cyan)" glow />
        <div>
          <NeonText as="h1" color="cyan" glow="medium" className="text-xl font-black">
            {userName}님의 모험
          </NeonText>
          <p className="text-xs mt-0.5" style={{ color: 'var(--fun-text-secondary)' }}>
            오늘도 도전을 시작하세요
          </p>
        </div>
      </div>

      {/* 게임 대시보드 (XP/스트릭/데일리) */}
      <GameDashboard
        profile={profile}
        xpProgress={xpProgress}
        xpForNextLevel={xpForNextLevel}
        todayCount={todayCount}
      />

      {/* 게임 모드 런처 */}
      <GameModeLauncher />

      {/* 미니 리더보드 */}
      <MiniLeaderboard
        groupId={studentGroupId ?? null}
        currentStudentId={user!.email}
      />
    </div>
  )
}
