// apps/web/src/components/questions/QuestionList.tsx
// useLiveQuery 기반 반응형 문제 목록 — IndexedDB 변경 시 자동 리렌더
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { QuestionCard } from './QuestionCard'
import type { Question } from '@/lib/db'

interface QuestionListProps {
  filterSubject?: Question['subject']
  basePath?: string
}

export function QuestionList({ filterSubject, basePath }: QuestionListProps) {
  const questions = useLiveQuery(
    async () => {
      if (filterSubject) {
        const result = await db.questions
          .where('subject')
          .equals(filterSubject)
          .toArray()
        return result.sort((a, b) => b.createdAt - a.createdAt)
      }
      return db.questions.orderBy('createdAt').reverse().toArray()
    },
    [filterSubject],
  )

  // 로딩 중 (useLiveQuery 초기 undefined)
  if (questions === undefined) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-white/60 dark:bg-card/40 border border-border/40 shadow-sm rounded-2xl p-5 space-y-4">
            <div className="flex gap-2">
              <div className="h-5 bg-muted rounded-full w-12 animate-pulse" />
              <div className="h-5 bg-muted rounded-md w-16 animate-pulse" />
              <div className="h-5 bg-muted rounded-full w-10 animate-pulse" />
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-muted/60 rounded w-full animate-pulse" />
              <div className="h-4 bg-muted/60 rounded w-3/4 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  // 빈 목록
  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center space-y-4 bg-white/50 dark:bg-card/20 rounded-2xl border border-border/30">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">등록된 문제가 없어요!</p>
          <p className="text-sm text-muted-foreground mt-1 px-4">상단의 '새 문제 등록' 버튼을 눌러 첫 기출문제를 추가해보세요.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {questions.map((q) => (
        <QuestionCard key={q.id} question={q} basePath={basePath} />
      ))}
    </div>
  )
}
