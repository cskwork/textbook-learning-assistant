/**
 * FunModeWorkbooks -- 퀘스트 북 스타일 문제집 목록
 *
 * - 타이틀: "퀘스트 북" NeonText + ScrollIcon
 * - QuestCard 그리드 (태블릿 2열, 모바일 1열)
 * - 필터: 전체 / 진행 중 / 완료
 */

import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useLiveQuery } from 'dexie-react-hooks'
import { useAuth } from '@/contexts/AuthContext'
import { db } from '@/lib/db'
import { GlassCard, NeonText, LaserButton } from '@/components/game/ui'
import { ScrollIcon } from '@/components/game/icons'
import { QuestCard } from './QuestCard'
import { GameLoadingSpinner } from '@/components/game/GameLoadingSpinner'

type Filter = 'all' | 'inprogress' | 'completed'

export function FunModeWorkbooks() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [filter, setFilter] = useState<Filter>('all')

  const workbooks = useLiveQuery(
    () =>
      user
        ? db.workbooks
            .where('studentId')
            .equals(user.email)
            .toArray()
            .then(all => all.sort((a, b) => b.createdAt - a.createdAt))
        : [],
    [user?.email],
  )

  if (workbooks === undefined) return <GameLoadingSpinner />

  // 현재 filter 적용 (완료 판정 로직은 QuestCard와 동일하게 추후 연동)
  const filtered = workbooks

  const filters: { key: Filter; label: string }[] = [
    { key: 'all', label: '전체 퀘스트' },
    { key: 'inprogress', label: '진행 중' },
    { key: 'completed', label: '클리어' },
  ]

  return (
    <div
      className="min-h-screen p-4 md:p-6 max-w-4xl mx-auto space-y-5"
      style={{ background: 'var(--fun-bg-primary)', color: 'var(--fun-text-primary)' }}
    >
      {/* 타이틀 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ScrollIcon size={28} color="var(--fun-neon-gold)" glow />
          <NeonText as="h1" color="gold" glow="high" className="text-xl font-black">
            퀘스트 북
          </NeonText>
        </div>
        <LaserButton
          variant="primary"
          size="sm"
          onClick={() => navigate('/student/workbooks/create')}
        >
          새 퀘스트
        </LaserButton>
      </div>

      {/* 필터 탭 */}
      <div className="flex gap-2">
        {filters.map(f => (
          <LaserButton
            key={f.key}
            variant={filter === f.key ? 'gold' : 'primary'}
            size="sm"
            onClick={() => setFilter(f.key)}
            className={filter === f.key ? 'ring-1 ring-[var(--fun-neon-gold)]' : 'opacity-60'}
          >
            {f.label}
          </LaserButton>
        ))}
      </div>

      {/* 퀘스트 카드 그리드 */}
      {filtered.length === 0 ? (
        <GlassCard className="p-8 text-center">
          <ScrollIcon size={40} color="var(--fun-text-muted)" className="mx-auto mb-3" />
          <NeonText color="cyan" glow="low" className="text-sm font-bold">
            아직 퀘스트가 없습니다
          </NeonText>
          <p className="text-xs mt-1" style={{ color: 'var(--fun-text-muted)' }}>
            문제를 모아 나만의 퀘스트를 만들어보세요
          </p>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(wb => (
            <QuestCard
              key={wb.id}
              workbook={wb}
              onPlay={(id) => navigate(`/student/workbooks/${id}/play`)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
