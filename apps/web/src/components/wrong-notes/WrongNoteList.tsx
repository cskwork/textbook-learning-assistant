// apps/web/src/components/wrong-notes/WrongNoteList.tsx
// useLiveQuery 반응형 오답노트 목록 + 카드 그리드 레이아웃 + 빈 상태 처리
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { markAsMastered } from '@/services/wrongNote.service'
import { Skeleton } from '@/components/ui/skeleton'
import { WrongNoteCard } from './WrongNoteCard'

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

  // 로딩 중 — 그리드 스켈레톤 카드 3개
  if (wrongNotes === undefined) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-border/40 bg-white/60 dark:bg-card/40 p-5 space-y-3"
          >
            <div className="flex gap-2">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-5 w-24 rounded-full" />
            </div>
            <Skeleton className="h-4 w-36" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-24" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  // 빈 목록
  if (wrongNotes.length === 0) {
    return (
      <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
        <p className="text-muted-foreground text-sm">
          오답노트가 비어있습니다. 계속 열심히 학습하세요!
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
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
