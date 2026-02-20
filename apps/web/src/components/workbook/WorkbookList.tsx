// apps/web/src/components/workbook/WorkbookList.tsx
// useLiveQuery 반응형 문제집 목록 + 로딩/빈상태/목록 분기
import { useLiveQuery } from 'dexie-react-hooks'

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
      <div className="space-y-4">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-[140px] rounded-2xl bg-white/60 dark:bg-card/40 border border-border/40 shadow-sm p-5 space-y-4"
          >
            <div className="h-5 bg-muted rounded w-1/3 animate-pulse" />
            <div className="flex gap-2">
              <div className="h-6 bg-muted rounded-full w-16 animate-pulse" />
              <div className="h-6 bg-muted rounded-md w-12 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  // 빈 목록
  if (workbooks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center space-y-4 bg-white/50 dark:bg-card/20 rounded-2xl border border-border/30">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">아직 만들어진 문제집이 없어요!</p>
          <p className="text-sm text-muted-foreground mt-1 px-4">문제 목록에서 원하는 문제를 담아 나만의 문제집을 만들어보세요.</p>
        </div>
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
