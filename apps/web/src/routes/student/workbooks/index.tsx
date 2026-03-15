// 학생 학습자료 페이지 — 문제집 + 오답노트 서브탭 통합
import { lazy, Suspense, useState } from 'react'
import { useFunMode } from '@/contexts/FunModeContext'
import { GameLoadingSpinner } from '@/components/game/GameLoadingSpinner'

const FunModeWorkbooks = lazy(() =>
  import('@/components/workbook/FunModeWorkbooks').then(m => ({ default: m.FunModeWorkbooks }))
)
import { useNavigate } from 'react-router'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { FadeIn } from '@/components/motion/FadeIn'
import { WorkbookList } from '@/components/workbook/WorkbookList'
import { useAuth } from '@/contexts/AuthContext'
import { WrongNoteFilter } from '@/components/wrong-notes/WrongNoteFilter'
import { WrongNoteList } from '@/components/wrong-notes/WrongNoteList'

type ActiveTab = 'workbooks' | 'wrong-notes'

export default function WorkbooksPage() {
  const { isFunMode } = useFunMode()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [sortBy, setSortBy] = useState<'recent' | 'name'>('recent')
  const [activeTab, setActiveTab] = useState<ActiveTab>('workbooks')

  // 오답노트 필터 상태
  const [filterUnit, setFilterUnit] = useState<string | undefined>(undefined)
  const [filterCategory, setFilterCategory] = useState<string | undefined>(undefined)

  const studentId = user?.email ?? ''

  if (isFunMode) {
    return (
      <Suspense fallback={<GameLoadingSpinner />}>
        <FunModeWorkbooks />
      </Suspense>
    )
  }

  // 칩 스타일 공통 클래스
  const chipBase =
    'px-3 py-1.5 rounded-full text-sm font-medium border border-border/60 bg-white dark:bg-card text-muted-foreground hover:bg-muted/50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/30'
  const chipActive =
    'bg-primary/10 text-primary border-primary/30 font-semibold hover:bg-primary/15'

  function handleRetry(questionId: number) {
    navigate(`/student/quiz/${questionId}`)
  }

  return (
    <FadeIn className="p-4 md:p-6 max-w-6xl mx-auto space-y-4">
      {/* 서브탭 네비게이션 */}
      <div className="flex gap-1 bg-secondary/50 p-1 rounded-xl">
        <button
          onClick={() => setActiveTab('workbooks')}
          className={cn(
            'flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all',
            activeTab === 'workbooks'
              ? 'bg-white dark:bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          문제집
        </button>
        <button
          onClick={() => setActiveTab('wrong-notes')}
          className={cn(
            'flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all',
            activeTab === 'wrong-notes'
              ? 'bg-white dark:bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          오답노트
        </button>
      </div>

      {/* 문제집 탭 콘텐츠 */}
      {activeTab === 'workbooks' && (
        <>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl font-bold mr-auto">내 문제집</h1>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSortBy('recent')}
                className={cn(chipBase, sortBy === 'recent' && chipActive)}
              >
                최신순
              </button>
              <button
                type="button"
                onClick={() => setSortBy('name')}
                className={cn(chipBase, sortBy === 'name' && chipActive)}
              >
                이름순
              </button>
            </div>
            <Button onClick={() => navigate('/student/workbooks/create')} size="sm">
              <Plus className="h-4 w-4 mr-1" />
              새 문제집
            </Button>
          </div>

          <WorkbookList
            studentId={studentId}
            sortBy={sortBy}
            onPlay={(workbookId) => navigate(`/student/workbooks/${workbookId}/play`)}
          />
        </>
      )}

      {/* 오답노트 탭 콘텐츠 */}
      {activeTab === 'wrong-notes' && (
        <>
          <h1 className="text-2xl font-bold">오답노트</h1>
          <WrongNoteFilter
            studentId={studentId}
            filterUnit={filterUnit}
            filterCategory={filterCategory}
            onFilterUnit={setFilterUnit}
            onFilterCategory={setFilterCategory}
          />
          <WrongNoteList
            studentId={studentId}
            filterUnit={filterUnit}
            filterCategory={filterCategory}
            onRetry={handleRetry}
          />
        </>
      )}
    </FadeIn>
  )
}
