// apps/web/src/components/questions/QuestionList.tsx
// useLiveQuery 기반 반응형 문제 목록 — 카드 그리드(1/2/3열) + FadeIn + Skeleton + 선택 모드
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { QuestionCard } from './QuestionCard'
import { FadeIn } from '@/components/motion/FadeIn'
import { Skeleton } from '@/components/ui/skeleton'
import { Check } from 'lucide-react'
import type { Question } from '@/lib/db'

interface QuestionListProps {
  filterSubject?: Question['subject']
  filterDifficulty?: number
  basePath?: string
  // 선택 모드 — optional props (기존 사용처 영향 없음)
  selectionMode?: boolean
  selectedIds?: Set<number>
  onToggleSelect?: (id: number) => void
}

export function QuestionList({
  filterSubject,
  filterDifficulty,
  basePath,
  selectionMode = false,
  selectedIds,
  onToggleSelect,
}: QuestionListProps) {
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

  // 로딩 중 (useLiveQuery 초기 undefined) — 동일 그리드 구조로 레이아웃 점프 방지
  if (questions === undefined) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-[180px] rounded-2xl" />
        ))}
      </div>
    )
  }

  // 난이도 필터 인메모리 적용
  const filtered = filterDifficulty !== undefined
    ? questions.filter((q) => q.difficulty === filterDifficulty)
    : questions

  // 빈 목록
  if (filtered.length === 0) {
    return (
      <FadeIn>
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
      </FadeIn>
    )
  }

  return (
    <FadeIn>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((q) => {
          const isSelected = selectedIds?.has(q.id) ?? false

          if (selectionMode) {
            return (
              <div key={q.id} className="relative">
                {/* 체크박스 오버레이 — 좌상단 */}
                <button
                  type="button"
                  className="absolute top-3 left-3 z-10 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors"
                  style={{
                    borderColor: isSelected ? 'var(--color-primary)' : 'var(--color-border)',
                    backgroundColor: isSelected ? 'var(--color-primary)' : 'transparent',
                    color: isSelected ? 'white' : 'transparent',
                  }}
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    onToggleSelect?.(q.id)
                  }}
                  aria-label={isSelected ? '선택 해제' : '선택'}
                >
                  {isSelected && <Check className="w-3 h-3" strokeWidth={3} />}
                </button>
                {/* 선택 시 ring 하이라이트 래퍼 */}
                <div className={isSelected ? 'ring-2 ring-primary/50 rounded-2xl' : ''}>
                  <QuestionCard question={q} basePath={basePath} />
                </div>
              </div>
            )
          }

          return <QuestionCard key={q.id} question={q} basePath={basePath} />
        })}
      </div>
    </FadeIn>
  )
}
