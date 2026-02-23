/**
 * CharacterProfile -- RPG 캐릭터 프로필 화면
 *
 * 상단: 아바타 + 이름 + 레벨 + XP
 * 중단: StatHexagon 육각형 능력치 차트
 * 하단: 뱃지/업적 탭
 */

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useGamification } from '@/hooks/useGamification'
import { GlassCard, NeonBorder, NeonText, LaserButton } from '@/components/game/ui'
import { CrownIcon } from '@/components/game/icons'
import { StatHexagon } from './StatHexagon'
import { BadgeShowcase } from './BadgeShowcase'
import { AchievementTracker } from './AchievementTracker'
import { GameLoadingSpinner } from '@/components/game/GameLoadingSpinner'

type Tab = 'badges' | 'achievements'

export function CharacterProfile() {
  const { user } = useAuth()
  const { profile, allBadges, isLoading } = useGamification(user?.email)
  const [tab, setTab] = useState<Tab>('badges')

  if (isLoading || !profile) {
    return <GameLoadingSpinner />
  }

  const userName = user?.email?.split('@')[0] ?? '모험가'

  // 간단한 스탯 매핑 (0~100) -- 현재 프로필 데이터 기반 추정
  const stats = [
    Math.min(100, profile.totalXP > 0 ? 50 + Math.min(50, profile.totalXP / 50) : 0), // 정확도
    Math.min(100, 30 + Math.min(60, profile.level * 6)), // 속도
    Math.min(100, profile.streakDays * 10), // 스트릭
    Math.min(100, Math.min(100, profile.totalXP / 80)), // 문제수
    Math.min(100, profile.level * 10), // 난이도
    Math.min(100, profile.level * 8), // 콤보
  ]

  return (
    <div
      className="min-h-screen p-4 md:p-6 max-w-2xl mx-auto space-y-5"
      style={{ background: 'var(--fun-bg-primary)', color: 'var(--fun-text-primary)' }}
    >
      {/* Profile header */}
      <GlassCard className="p-5">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <NeonBorder color="cyan">
            <div
              className="w-16 h-16 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--fun-bg-secondary)' }}
            >
              <CrownIcon size={32} color="var(--fun-neon-gold)" glow />
            </div>
          </NeonBorder>

          <div className="flex-1">
            <NeonText as="h1" color="cyan" glow="medium" className="text-lg font-black">
              {userName}
            </NeonText>
            <div className="flex items-baseline gap-2 mt-1">
              <NeonText color="gold" glow="high" className="text-2xl font-black">
                Lv.{profile.level}
              </NeonText>
              <span className="text-xs" style={{ color: 'var(--fun-text-secondary)' }}>
                {profile.totalXP.toLocaleString()} XP
              </span>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Hexagon chart */}
      <GlassCard className="p-4 flex justify-center">
        <StatHexagon stats={stats} size={200} />
      </GlassCard>

      {/* Tab switcher */}
      <div className="flex gap-2">
        <LaserButton
          variant={tab === 'badges' ? 'primary' : 'primary'}
          size="sm"
          onClick={() => setTab('badges')}
          className={tab === 'badges' ? 'ring-1 ring-[var(--fun-neon-cyan)]' : 'opacity-60'}
        >
          뱃지 진열장
        </LaserButton>
        <LaserButton
          variant={tab === 'achievements' ? 'gold' : 'primary'}
          size="sm"
          onClick={() => setTab('achievements')}
          className={tab === 'achievements' ? 'ring-1 ring-[var(--fun-neon-gold)]' : 'opacity-60'}
        >
          업적 현황
        </LaserButton>
      </div>

      {/* Tab content */}
      {tab === 'badges' ? (
        <BadgeShowcase badges={allBadges} />
      ) : (
        <AchievementTracker badges={allBadges} profile={profile} />
      )}
    </div>
  )
}
