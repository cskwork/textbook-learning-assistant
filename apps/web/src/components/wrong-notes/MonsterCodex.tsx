/**
 * MonsterCodex -- 오답노트 몬스터 도감 그리드 레이아웃
 */

import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '@/contexts/AuthContext'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { GlassCard, NeonText, LaserButton } from '@/components/game/ui'
import { MonsterIcon, TrophyIcon } from '@/components/game/icons'
import { MonsterCard } from './MonsterCard'
import { MonsterDetail } from './MonsterDetail'

type FilterMode = 'all' | 'undefeated' | 'defeated'

export function MonsterCodex() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [filter, setFilter] = useState<FilterMode>('all')
  const [selectedNoteId, setSelectedNoteId] = useState<number | null>(null)

  const wrongNotes = useLiveQuery(
    () => {
      if (!user) return []
      return db.wrongNotes.where('studentId').equals(user.email).toArray()
    },
    [user?.email],
    [],
  )

  // 간단한 defeated 판별: correctCount > 0
  const notesWithStatus = wrongNotes.map(note => ({
    ...note,
    defeated: 'correctCount' in note ? Number((note as unknown as { correctCount?: number }).correctCount) > 0 : false,
    difficulty: (note.wrongCount ?? 1) >= 3 ? 'hard' as const : (note.wrongCount ?? 1) >= 2 ? 'medium' as const : 'easy' as const,
  }))

  const filtered = notesWithStatus.filter(n => {
    if (filter === 'undefeated') return !n.defeated
    if (filter === 'defeated') return n.defeated
    return true
  })

  const selectedNote = selectedNoteId != null
    ? notesWithStatus.find(n => n.questionId === selectedNoteId)
    : null

  return (
    <div
      className="min-h-screen p-4 md:p-6 max-w-4xl mx-auto space-y-4"
      style={{ background: 'var(--fun-bg-primary)', color: 'var(--fun-text-primary)' }}
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <MonsterIcon size={28} color="var(--fun-neon-magenta)" glow />
        <NeonText as="h1" color="magenta" glow="medium" className="text-xl font-black">
          몬스터 도감
        </NeonText>
        <span className="text-xs ml-auto" style={{ color: 'var(--fun-text-muted)' }}>
          {notesWithStatus.filter(n => n.defeated).length}/{notesWithStatus.length} 처치
        </span>
      </div>

      {/* Filter bar */}
      <GlassCard className="flex gap-2 p-2">
        {(['all', 'undefeated', 'defeated'] as FilterMode[]).map(mode => (
          <LaserButton
            key={mode}
            variant={filter === mode ? 'primary' : 'primary'}
            size="sm"
            onClick={() => setFilter(mode)}
            className={filter === mode ? 'ring-1 ring-[var(--fun-neon-cyan)]' : 'opacity-60'}
          >
            {mode === 'all' ? '전체' : mode === 'undefeated' ? '미처치' : '처치완료'}
          </LaserButton>
        ))}
      </GlassCard>

      {/* Grid */}
      {filtered.length === 0 ? (
        <GlassCard className="p-8 text-center">
          <TrophyIcon size={48} color="var(--fun-neon-gold)" glow />
          <NeonText as="p" color="gold" glow="medium" className="text-lg font-bold mt-4">
            {filter === 'all'
              ? '아직 몬스터가 없습니다'
              : filter === 'undefeated'
                ? '모든 몬스터를 처치했습니다!'
                : '아직 처치한 몬스터가 없습니다'}
          </NeonText>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {filtered.map(note => (
            <MonsterCard
              key={note.questionId}
              questionId={note.questionId}
              questionType={(note as Record<string, unknown>).category as string | undefined}
              unitName={(note as Record<string, unknown>).unitName as string | undefined}
              difficulty={note.difficulty}
              wrongCount={note.wrongCount}
              defeated={note.defeated}
              onClick={() => setSelectedNoteId(note.questionId)}
            />
          ))}
        </div>
      )}

      {/* Detail modal */}
      {selectedNote && (
        <MonsterDetail
          questionId={selectedNote.questionId}
          questionType={(selectedNote as Record<string, unknown>).category as string | undefined}
          unitName={(selectedNote as Record<string, unknown>).unitName as string | undefined}
          difficulty={selectedNote.difficulty}
          wrongCount={selectedNote.wrongCount}
          defeated={selectedNote.defeated}
          onRetry={() => navigate(`/student/quiz/${selectedNote.questionId}`)}
          onClose={() => setSelectedNoteId(null)}
        />
      )}
    </div>
  )
}
