// apps/web/src/routes/student/problems/index.tsx
// 학생 문제 목록 페이지 — 칩 필터(과목+난이도) + 반응형 카드 그리드
import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { QuestionList } from '@/components/questions/QuestionList'
import { FadeIn } from '@/components/motion/FadeIn'
import { SwordIcon } from '@/components/game/icons'
import { useFunMode } from '@/hooks/useFunMode'
import { db } from '@/lib/db'
import type { Question } from '@/lib/db'
import { PageContainer } from '@/components/layout/PageContainer'

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
  const { isFunMode } = useFunMode()
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

  const funStyle = isFunMode
    ? {
        background: 'var(--fun-bg-primary)',
        color: 'var(--fun-text-primary)',
        minHeight: '100%',
      } as const
    : undefined

  function getChipStyle(isActive: boolean) {
    if (!isFunMode) return undefined
    if (isActive) {
      return {
        background: 'var(--fun-neon-cyan)',
        color: '#04151f',
        boxShadow: '0 0 14px rgba(0, 212, 255, 0.35)',
      } as const
    }
    return {
      background: 'rgba(255, 255, 255, 0.04)',
      color: 'var(--fun-text-secondary)',
      border: '1px solid rgba(0, 212, 255, 0.2)',
    } as const
  }

  return (
    <FadeIn>
      <PageContainer
        variant="wide"
        align="left"
        className="space-y-5 py-4 md:space-y-6 md:py-6 lg:py-8"
        style={funStyle}
      >
        {/* 페이지 헤더 */}
        <div className="flex items-center gap-3">
          {isFunMode && <SwordIcon size={24} color="var(--fun-neon-cyan)" glow />}
          <h1
            className="text-2xl font-bold"
            style={isFunMode ? { color: 'var(--fun-neon-cyan)' } : undefined}
          >
            {isFunMode ? '문제 던전' : '문제 목록'}
          </h1>
          {totalCount !== undefined && (
            <span
              className="text-sm font-medium"
              style={isFunMode ? { color: 'var(--fun-text-secondary)' } : undefined}
            >
              전체 {totalCount}문제
            </span>
          )}
        </div>

        {/* 필터 영역 */}
        <div
          className="space-y-3 rounded-2xl p-4"
          style={isFunMode ? {
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(0, 212, 255, 0.2)',
          } : undefined}
        >
          {/* 과목 칩 필터 */}
          <div className="space-y-1.5">
            <span
              className="text-xs font-semibold"
              style={isFunMode ? { color: 'var(--fun-text-secondary)' } : undefined}
            >
              과목
            </span>
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
                        : isFunMode
                          ? 'hover:bg-cyan-500/10'
                          : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                    }`}
                    style={getChipStyle(isActive)}
                  >
                    {chip.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* 난이도 칩 필터 */}
          <div className="space-y-1.5">
            <span
              className="text-xs font-semibold"
              style={isFunMode ? { color: 'var(--fun-text-secondary)' } : undefined}
            >
              난이도
            </span>
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
                        : isFunMode
                          ? 'hover:bg-cyan-500/10'
                          : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                    }`}
                    style={getChipStyle(isActive)}
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
          isFunMode={isFunMode}
        />
      </PageContainer>
    </FadeIn>
  )
}
