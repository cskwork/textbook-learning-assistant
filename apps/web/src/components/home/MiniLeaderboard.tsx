/**
 * MiniLeaderboard — TOP 3 미니 리더보드
 *
 * GlassCard 래핑, 1위 CrownIcon gold, 2위 silver, 3위 bronze.
 * 전체 보기 링크 포함.
 */

import { Link } from 'react-router'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { GlassCard, NeonText } from '@/components/game/ui'
import { CrownIcon, TrophyIcon } from '@/components/game/icons'

interface MiniLeaderboardProps {
  groupId: string | null
  currentStudentId: string
}

const rankColors = [
  'var(--fun-neon-gold)',
  '#c0c0c0',
  '#cd7f32',
]

export function MiniLeaderboard({ groupId, currentStudentId }: MiniLeaderboardProps) {
  const topProfiles = useLiveQuery(
    async () => {
      // 전체 프로필에서 XP 기준 TOP 3
      const all = await db.gamificationProfiles.orderBy('totalXP').reverse().limit(3).toArray()
      return all
    },
    [groupId],
    [],
  )

  if (!topProfiles || topProfiles.length === 0) {
    return (
      <GlassCard className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <TrophyIcon size={20} color="var(--fun-neon-gold)" glow />
          <NeonText color="gold" glow="low" className="text-sm font-bold">
            리더보드
          </NeonText>
        </div>
        <p className="text-xs text-center py-4" style={{ color: 'var(--fun-text-muted)' }}>
          아직 랭킹 데이터가 없습니다
        </p>
      </GlassCard>
    )
  }

  return (
    <GlassCard className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <TrophyIcon size={20} color="var(--fun-neon-gold)" glow />
          <NeonText color="gold" glow="low" className="text-sm font-bold">
            리더보드 TOP 3
          </NeonText>
        </div>
        <Link
          to="/student/profile"
          className="text-xs font-semibold"
          style={{ color: 'var(--fun-neon-cyan)' }}
        >
          전체 보기
        </Link>
      </div>

      <div className="space-y-2">
        {topProfiles.map((p, i) => {
          const isMe = p.studentId === currentStudentId
          return (
            <div
              key={p.studentId}
              className="flex items-center gap-3 rounded-lg p-2 transition-colors"
              style={{
                background: isMe ? 'var(--fun-bg-card-hover)' : 'transparent',
              }}
            >
              {/* Rank icon */}
              <div className="w-8 h-8 flex items-center justify-center shrink-0">
                {i === 0 ? (
                  <CrownIcon size={24} color={rankColors[0]} glow />
                ) : (
                  <span
                    className="text-lg font-black"
                    style={{ color: rankColors[i] ?? 'var(--fun-text-muted)' }}
                  >
                    {i + 1}
                  </span>
                )}
              </div>

              {/* Name */}
              <span
                className="flex-1 text-sm font-semibold truncate"
                style={{ color: isMe ? 'var(--fun-neon-cyan)' : 'var(--fun-text-primary)' }}
              >
                {p.studentId.split('@')[0]}
                {isMe && (
                  <span className="text-xs ml-1" style={{ color: 'var(--fun-text-muted)' }}>
                    (나)
                  </span>
                )}
              </span>

              {/* XP */}
              <NeonText
                color={i === 0 ? 'gold' : 'cyan'}
                glow="low"
                className="text-sm font-bold"
              >
                {p.totalXP.toLocaleString()} XP
              </NeonText>
            </div>
          )
        })}
      </div>
    </GlassCard>
  )
}
