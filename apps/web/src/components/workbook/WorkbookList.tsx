// apps/web/src/components/workbook/WorkbookList.tsx
// useLiveQuery 반응형 문제집 목록 + 카드 그리드 레이아웃 + 정렬 + 로딩/빈상태/목록 분기
import { useLiveQuery } from 'dexie-react-hooks'

import { db } from '@/lib/db'
import { deleteWorkbook } from '@/services/workbook.service'
import { Skeleton } from '@/components/ui/skeleton'
import { WorkbookCard } from './WorkbookCard'

interface WorkbookListProps {
  studentId: string
  onPlay: (workbookId: number) => void
  /** 정렬 기준 — 'recent'(기본): 최신순, 'name': 이름순 */
  sortBy?: 'recent' | 'name'
}

export function WorkbookList({ studentId, onPlay, sortBy = 'recent' }: WorkbookListProps) {
  // useLiveQuery — IndexedDB 변경 시 자동 리렌더, sortBy 변경 시 재정렬
  const workbooks = useLiveQuery(
    () =>
      db.workbooks
        .where('studentId')
        .equals(studentId)
        .toArray()
        .then((all) => {
          if (sortBy === 'name') {
            return all.sort((a, b) => a.title.localeCompare(b.title, 'ko'))
          }
          // 'recent': 최신순 (기본)
          return all.sort((a, b) => b.createdAt - a.createdAt)
        }),
    [studentId, sortBy],
  )

  // 로딩 중 — 그리드 스켈레톤 카드 3개
  if (workbooks === undefined) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-border/40 bg-white/60 dark:bg-card/40 p-5 space-y-4"
          >
            <Skeleton className="h-5 w-1/2 rounded-xl" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-12 rounded-md" />
            </div>
            <div className="flex gap-3">
              <Skeleton className="h-9 flex-1 rounded-xl" />
              <Skeleton className="h-9 w-9 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  // 빈 목록
  if (workbooks.length === 0) {
    return (
      <div className="col-span-full flex flex-col items-center justify-center py-16 text-center space-y-4 bg-white/50 dark:bg-card/20 rounded-2xl border border-border/30">
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
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
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
