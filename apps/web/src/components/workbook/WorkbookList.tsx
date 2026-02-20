// apps/web/src/components/workbook/WorkbookList.tsx
// useLiveQuery 반응형 문제집 목록 + 로딩/빈상태/목록 분기
import { useLiveQuery } from 'dexie-react-hooks'
import { BookMarked } from 'lucide-react'
import { db } from '@/lib/db'
import { deleteWorkbook } from '@/services/workbook.service'
import { WorkbookCard } from './WorkbookCard'

interface WorkbookListProps {
  studentId: string
  onPlay: (workbookId: number) => void
}

export function WorkbookList({ studentId, onPlay }: WorkbookListProps) {
  // useLiveQuery — IndexedDB 변경 시 자동 리렌더
  const workbooks = useLiveQuery(
    () =>
      db.workbooks
        .where('studentId')
        .equals(studentId)
        .toArray()
        .then((all) => all.sort((a, b) => b.createdAt - a.createdAt)),
    [studentId],
  )

  // 로딩 중 — 스켈레톤 카드 3개
  if (workbooks === undefined) {
    return (
      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-24 rounded-lg bg-muted animate-pulse"
          />
        ))}
      </div>
    )
  }

  // 빈 목록
  if (workbooks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
        <BookMarked className="size-10 text-muted-foreground/50" />
        <p className="text-muted-foreground text-sm">
          아직 만든 문제집이 없습니다. 새 문제집을 만들어보세요!
        </p>
      </div>
    )
  }

  async function handleDelete(workbookId: number) {
    await deleteWorkbook(workbookId)
    // useLiveQuery가 자동으로 목록 갱신
  }

  return (
    <div className="space-y-3">
      {workbooks.map((workbook) => (
        <WorkbookCard
          key={workbook.id}
          workbook={workbook}
          onPlay={onPlay}
          onDelete={handleDelete}
        />
      ))}
    </div>
  )
}
