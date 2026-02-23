/**
 * BadgeShowcase -- 카테고리별 뱃지 진열장
 */

import { GlassCard, NeonText } from '@/components/game/ui'
import { StarIcon, FlameIcon, TrophyIcon } from '@/components/game/icons'
import { BADGE_DEFINITIONS } from '@/lib/gamification/badge-definitions'
import type { BadgeRecord } from '@/lib/db'

interface BadgeShowcaseProps {
  badges: BadgeRecord[]
  className?: string
}

const CATEGORIES = [
  { key: 'study', label: '학습', Icon: StarIcon, color: 'cyan' as const },
  { key: 'streak', label: '연속', Icon: FlameIcon, color: 'gold' as const },
  { key: 'achievement', label: '성취', Icon: TrophyIcon, color: 'magenta' as const },
]

export function BadgeShowcase({ badges, className = '' }: BadgeShowcaseProps) {
  const earnedIds = new Set(badges.map(b => b.badgeId))

  return (
    <div className={`space-y-4 ${className}`}>
      {CATEGORIES.map(cat => {
        const catBadges = BADGE_DEFINITIONS.filter(
          def => def.category === cat.key
        )

        return (
          <GlassCard key={cat.key} className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <cat.Icon size={18} color={`var(--fun-neon-${cat.color})`} glow />
              <NeonText color={cat.color} glow="low" className="text-sm font-bold">
                {cat.label}
              </NeonText>
              <span className="text-xs ml-auto" style={{ color: 'var(--fun-text-muted)' }}>
                {catBadges.filter(d => earnedIds.has(d.id)).length}/{catBadges.length}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {catBadges.map(def => {
                const earned = earnedIds.has(def.id)
                return (
                  <div
                    key={def.id}
                    className="flex flex-col items-center text-center p-2 rounded-lg"
                    style={{
                      background: earned ? 'var(--fun-bg-card-hover)' : 'var(--fun-bg-card)',
                      opacity: earned ? 1 : 0.4,
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center mb-1"
                      style={{
                        border: `2px solid ${earned ? `var(--fun-neon-${cat.color})` : 'var(--fun-glass-border)'}`,
                        boxShadow: earned ? `0 0 8px var(--fun-neon-${cat.color})40` : undefined,
                      }}
                    >
                      <span className="text-lg" style={{ color: earned ? `var(--fun-neon-${cat.color})` : 'var(--fun-text-muted)' }}>
                        {def.icon ?? '?'}
                      </span>
                    </div>
                    <span className="text-[10px] font-semibold" style={{ color: earned ? 'var(--fun-text-primary)' : 'var(--fun-text-muted)' }}>
                      {earned ? def.name : '???'}
                    </span>
                  </div>
                )
              })}
            </div>
          </GlassCard>
        )
      })}
    </div>
  )
}
