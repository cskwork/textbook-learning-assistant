// apps/web/src/routes/instructor/problems/index.tsx
// 강사 문제 관리 페이지 — /instructor/problems
// 기출탭탭 스타일: 필터 사이드바(모바일: 칩 바), 일괄 선택/삭제, FadeIn 애니메이션
import { useState } from 'react'
import { useFunMode } from '@/contexts/FunModeContext'
import { Link } from 'react-router'
import { useLiveQuery } from 'dexie-react-hooks'
import { Button } from '@/components/ui/button'
import { QuestionList } from '@/components/questions/QuestionList'
import { FadeIn } from '@/components/motion/FadeIn'
import { db } from '@/lib/db'
import { PlusCircle, Check, X, Trash2 } from 'lucide-react'
import type { Question } from '@/lib/db'

// 과목 필터 목록
const SUBJECT_OPTIONS: Question['subject'][] = [
  '수학I',
  '수학II',
  '미적분',
  '확률과통계',
  '기하',
]

// 난이도 필터 목록
const DIFFICULTY_OPTIONS: { value: number; label: string }[] = [
  { value: 1, label: '매우쉬움' },
  { value: 2, label: '쉬움' },
  { value: 3, label: '보통' },
  { value: 4, label: '어려움' },
  { value: 5, label: '매우어려움' },
]

export default function InstructorProblemsPage() {
  const { isFunMode } = useFunMode()
  // 필터 상태
  const [filterSubject, setFilterSubject] = useState<Question['subject'] | undefined>(undefined)
  const [filterDifficulty, setFilterDifficulty] = useState<number | undefined>(undefined)

  // 일괄 선택 상태
  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())

  // 전체 문제 수 (헤더 부제 + 전체 선택용)
  const allQuestions = useLiveQuery(async () => {
    if (filterSubject) {
      const result = await db.questions
        .where('subject')
        .equals(filterSubject)
        .toArray()
      const sorted = result.sort((a, b) => b.createdAt - a.createdAt)
      return filterDifficulty !== undefined
        ? sorted.filter((q) => q.difficulty === filterDifficulty)
        : sorted
    }
    const all = await db.questions.orderBy('createdAt').reverse().toArray()
    return filterDifficulty !== undefined
      ? all.filter((q) => q.difficulty === filterDifficulty)
      : all
  }, [filterSubject, filterDifficulty])

  const totalCount = allQuestions?.length ?? 0

  // 체크박스 토글
  const handleToggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  // 전체 선택
  const handleSelectAll = () => {
    const ids = allQuestions?.map((q) => q.id) ?? []
    setSelectedIds(new Set(ids))
  }

  // 선택 해제
  const handleDeselectAll = () => {
    setSelectedIds(new Set())
  }

  // 선택 모드 종료
  const handleExitSelectionMode = () => {
    setSelectionMode(false)
    setSelectedIds(new Set())
  }

  // 일괄 삭제
  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return
    const confirmed = window.confirm(`${selectedIds.size}개의 문제를 삭제하시겠습니까?`)
    if (!confirmed) return
    await db.questions.bulkDelete([...selectedIds])
    setSelectedIds(new Set())
    setSelectionMode(false)
  }

  // 필터 칩/사이드바 공통 렌더
  const renderSubjectChips = (variant: 'chip' | 'sidebar') => (
    <div className={variant === 'sidebar' ? 'flex flex-col gap-1' : 'flex gap-2'}>
      {SUBJECT_OPTIONS.map((subj) => {
        const active = filterSubject === subj
        return (
          <button
            key={subj}
            type="button"
            onClick={() => setFilterSubject(active ? undefined : subj)}
            className={
              variant === 'sidebar'
                ? `w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                    active
                      ? 'bg-primary text-white'
                      : 'hover:bg-muted/80 text-muted-foreground'
                  }`
                : `shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                    active
                      ? 'bg-primary text-white'
                      : 'bg-muted/60 text-muted-foreground'
                  }`
            }
          >
            {subj}
          </button>
        )
      })}
    </div>
  )

  const renderDifficultyChips = (variant: 'chip' | 'sidebar') => (
    <div className={variant === 'sidebar' ? 'flex flex-col gap-1' : 'flex gap-2'}>
      {DIFFICULTY_OPTIONS.map(({ value, label }) => {
        const active = filterDifficulty === value
        return (
          <button
            key={value}
            type="button"
            onClick={() => setFilterDifficulty(active ? undefined : value)}
            className={
              variant === 'sidebar'
                ? `w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                    active
                      ? 'bg-primary text-white'
                      : 'hover:bg-muted/80 text-muted-foreground'
                  }`
                : `shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                    active
                      ? 'bg-primary text-white'
                      : 'bg-muted/60 text-muted-foreground'
                  }`
            }
          >
            {label}
          </button>
        )
      })}
    </div>
  )

  const hasActiveFilter = filterSubject !== undefined || filterDifficulty !== undefined

  const funStyle = isFunMode
    ? { background: 'var(--fun-bg-tertiary)', color: 'var(--fun-text-primary)', minHeight: '100vh' } as const
    : undefined

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto space-y-4" style={funStyle}>
      {/* 헤더 영역 */}
      <FadeIn delay={0}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1
              className="text-[1.65rem] font-extrabold tracking-tight"
              style={isFunMode ? { color: 'var(--fun-neon-cyan)' } : undefined}
            >
              {isFunMode ? '무기고 관리' : '문제 관리'}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              총 {totalCount}개 문제
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {/* 일괄 선택 모드 토글 */}
            {selectionMode ? (
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl shadow-sm font-semibold h-9 px-4"
                onClick={handleExitSelectionMode}
              >
                <X className="w-4 h-4 mr-1.5" />
                취소
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl shadow-sm font-semibold h-9 px-4"
                onClick={() => setSelectionMode(true)}
              >
                <Check className="w-4 h-4 mr-1.5" />
                선택
              </Button>
            )}
            <Button
              asChild
              size="sm"
              className="rounded-xl shadow-sm font-semibold h-9 px-4"
            >
              <Link to="/instructor/problems/new">
                <PlusCircle className="w-4 h-4 mr-1.5" />
                새 문제 등록
              </Link>
            </Button>
          </div>
        </div>
      </FadeIn>

      {/* 모바일/태블릿 칩 바 필터 (lg 미만) */}
      <FadeIn delay={0.05}>
        <div className="lg:hidden space-y-2">
          {/* 과목 칩 */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="shrink-0 text-xs font-semibold text-muted-foreground">과목</span>
            {renderSubjectChips('chip')}
          </div>
          {/* 난이도 칩 */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="shrink-0 text-xs font-semibold text-muted-foreground">난이도</span>
            {renderDifficultyChips('chip')}
            {hasActiveFilter && (
              <button
                type="button"
                onClick={() => {
                  setFilterSubject(undefined)
                  setFilterDifficulty(undefined)
                }}
                className="shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold bg-destructive/10 text-destructive transition-colors"
              >
                초기화
              </button>
            )}
          </div>
        </div>
      </FadeIn>

      {/* 메인 콘텐츠 (데스크톱: 사이드바 + 그리드) */}
      <FadeIn delay={0.1}>
        <div className="lg:flex lg:gap-6">
          {/* 데스크톱 사이드바 (lg 이상) */}
          <aside className="hidden lg:block w-52 shrink-0">
            <div className="bg-white/80 dark:bg-card/60 border border-border/50 rounded-2xl shadow-sm p-4 space-y-5 sticky top-4">
              {/* 과목 필터 */}
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 px-1">
                  과목
                </p>
                {renderSubjectChips('sidebar')}
              </div>

              {/* 난이도 필터 */}
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 px-1">
                  난이도
                </p>
                {renderDifficultyChips('sidebar')}
              </div>

              {/* 초기화 버튼 */}
              {hasActiveFilter && (
                <button
                  type="button"
                  onClick={() => {
                    setFilterSubject(undefined)
                    setFilterDifficulty(undefined)
                  }}
                  className="w-full px-3 py-2 rounded-xl text-sm font-semibold bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                >
                  필터 초기화
                </button>
              )}
            </div>
          </aside>

          {/* 문제 그리드 */}
          <div className="flex-1 min-w-0">
            <QuestionList
              filterSubject={filterSubject}
              filterDifficulty={filterDifficulty}
              basePath="/instructor/problems"
              selectionMode={selectionMode}
              selectedIds={selectedIds}
              onToggleSelect={handleToggleSelect}
            />
          </div>
        </div>
      </FadeIn>

      {/* 일괄 선택 액션 바 — 하단 고정 (탭바 위) */}
      {selectionMode && (
        <div className="fixed bottom-20 left-0 right-0 z-50 px-4 pb-1">
          <div className="bg-white/90 dark:bg-card/90 backdrop-blur-xl rounded-2xl shadow-lg border border-border/40 px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              {/* 선택 현황 */}
              <span className="text-sm font-semibold text-foreground">
                {selectedIds.size}개 선택됨
              </span>
              {/* 액션 버튼들 */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                >
                  전체 선택
                </button>
                <span className="text-border">|</span>
                <button
                  type="button"
                  onClick={handleDeselectAll}
                  className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
                >
                  선택 해제
                </button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="rounded-xl h-8 px-3 font-semibold ml-2"
                  disabled={selectedIds.size === 0}
                  onClick={handleBulkDelete}
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" />
                  일괄 삭제
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
