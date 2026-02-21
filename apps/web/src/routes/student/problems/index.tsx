// apps/web/src/routes/student/problems/index.tsx
// 학생 문제 목록 페이지 — 칩 필터(과목+난이도) + 반응형 카드 그리드
import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { QuestionList } from '@/components/questions/QuestionList'
import { FadeIn } from '@/components/motion/FadeIn'
import { db } from '@/lib/db'
import type { Question } from '@/lib/db'

// 과목 칩 필터 옵션
const SUBJECT_CHIPS: Array<{ value: Question['subject'] | undefined; label: string }> = [
  { value: undefined, label: '전체' },
  { value: '수학I', label: '수학I' },
  { value: '수학II', label: '수학II' },
  { value: '미적분', label: '미적분' },
  { value: '확률과통계', label: '확률과통계' },
  { value: '기하', label: '기하' },
]

// 난이도 칩 필터 옵션
const DIFFICULTY_CHIPS: Array<{ value: number | undefined; label: string }> = [
  { value: undefined, label: '전체' },
  { value: 1, label: '매우쉬움' },
  { value: 2, label: '쉬움' },
  { value: 3, label: '보통' },
  { value: 4, label: '어려움' },
  { value: 5, label: '매우어려움' },
]

export default function StudentProblemsPage() {
  const [filterSubject, setFilterSubject] = useState<Question['subject'] | undefined>(undefined)
  const [filterDifficulty, setFilterDifficulty] = useState<number | undefined>(undefined)

  // 총 문제 수 로드
  const totalCount = useLiveQuery(() => db.questions.count(), [])

  function handleSubjectChip(value: Question['subject'] | undefined) {
    // 이미 선택된 칩 재클릭 시 전체로 해제
    setFilterSubject(filterSubject === value ? undefined : value)
  }

  function handleDifficultyChip(value: number | undefined) {
    // 이미 선택된 칩 재클릭 시 전체로 해제
    setFilterDifficulty(filterDifficulty === value ? undefined : value)
  }

  return (
    <FadeIn>
      <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-5">
        {/* 페이지 헤더 */}
        <div className="flex items-baseline gap-3">
          <h1 className="text-2xl font-bold">문제 목록</h1>
          {totalCount !== undefined && (
            <span className="text-sm text-muted-foreground font-medium">
              전체 {totalCount}문제
            </span>
          )}
        </div>

        {/* 필터 영역 */}
        <div className="space-y-3">
          {/* 과목 칩 필터 */}
          <div className="space-y-1.5">
            <span className="text-xs text-muted-foreground font-semibold">과목</span>
            <div className="flex flex-wrap gap-2">
              {SUBJECT_CHIPS.map((chip) => {
                const isActive = filterSubject === chip.value
                return (
                  <button
                    key={chip.label}
                    type="button"
                    onClick={() => handleSubjectChip(chip.value)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    {chip.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* 난이도 칩 필터 */}
          <div className="space-y-1.5">
            <span className="text-xs text-muted-foreground font-semibold">난이도</span>
            <div className="flex flex-wrap gap-2">
              {DIFFICULTY_CHIPS.map((chip) => {
                const isActive = filterDifficulty === chip.value
                return (
                  <button
                    key={chip.label}
                    type="button"
                    onClick={() => handleDifficultyChip(chip.value)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    {chip.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* 문제 목록 — basePath로 /student/quiz/:id 이동 */}
        <QuestionList
          filterSubject={filterSubject}
          filterDifficulty={filterDifficulty}
          basePath="/student/quiz"
        />
      </div>
    </FadeIn>
  )
}
