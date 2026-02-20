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
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-muted rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  // 빈 목록
  if (questions.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-lg">등록된 문제가 없습니다</p>
        <p className="text-sm mt-1">상단의 '새 문제 등록' 버튼으로 첫 문제를 추가하세요</p>
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
