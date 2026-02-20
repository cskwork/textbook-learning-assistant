// apps/web/src/components/wrong-notes/WrongNoteList.tsx
// useLiveQuery 반응형 오답노트 목록 + 빈 상태 처리
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { markAsMastered } from '@/services/wrongNote.service'
import { WrongNoteCard } from './WrongNoteCard'
import { Card, CardContent } from '@/components/ui/card'

interface WrongNoteListProps {
  studentId: string
  filterUnit: string | undefined
  filterCategory: string | undefined
  onRetry: (questionId: number) => void
}

export function WrongNoteList({
  studentId,
  filterUnit,
  filterCategory,
  onRetry,
}: WrongNoteListProps) {
  // useLiveQuery — IndexedDB 변경 시 자동 리렌더
  const wrongNotes = useLiveQuery(
    async () => {
      let notes = await db.wrongNotes
        .where('studentId')
        .equals(studentId)
        .filter(n => !n.isMastered)
        .toArray()

      if (filterUnit) notes = notes.filter(n => n.unit === filterUnit)
      if (filterCategory) notes = notes.filter(n => n.questionCategory === filterCategory)
      return notes.sort((a, b) => b.lastWrongAt - a.lastWrongAt)
    },
    [studentId, filterUnit, filterCategory],
  )

  // 로딩 중 — 스켈레톤 카드 3개
  if (wrongNotes === undefined) {
    return (
      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <Card key={i}>
            <CardContent className="p-4 space-y-3">
              <div className="flex gap-2">
                <div className="h-5 w-16 bg-muted animate-pulse rounded-full" />
                <div className="h-5 w-20 bg-muted animate-pulse rounded-full" />
                <div className="h-5 w-24 bg-muted animate-pulse rounded-full" />
              </div>
              <div className="h-4 w-36 bg-muted animate-pulse rounded" />
              <div className="flex gap-2">
                <div className="h-8 w-24 bg-muted animate-pulse rounded" />
                <div className="h-8 w-24 bg-muted animate-pulse rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  // 빈 목록
  if (wrongNotes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-muted-foreground text-sm">
          오답노트가 비어있습니다. 계속 열심히 학습하세요!
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {wrongNotes.map((note) => (
        <WrongNoteCard
          key={note.id}
          wrongNote={note}
          onRetry={onRetry}
          onMastered={(id) => markAsMastered(id)}
        />
      ))}
    </div>
  )
}
