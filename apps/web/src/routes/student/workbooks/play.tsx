// apps/web/src/routes/student/workbooks/play.tsx
// 문제집 순차 풀기 페이지 — QuizSwiperPage로 Swiper 기반 다중 문제 전환 (QUIZ-02)
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import QuizSwiperPage from '@/components/quiz/QuizSwiperPage'
import { FadeIn } from '@/components/motion/FadeIn'
import { AnimatedCard } from '@/components/motion/AnimatedCard'
import { useAuth } from '@/contexts/AuthContext'
import { db, type Question, type Workbook } from '@/lib/db'
import { getWorkbook } from '@/services/workbook.service'

export default function WorkbookPlayPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [workbook, setWorkbook] = useState<Workbook | null | undefined>(undefined)
  const [questions, setQuestions] = useState<Question[]>([])

  // 문제집 + 문제 로드
  useEffect(() => {
    const workbookId = Number(id)
    if (!id || isNaN(workbookId)) {
      setWorkbook(null)
      return
    }
    getWorkbook(workbookId).then(async (wb) => {
      if (!wb) {
        setWorkbook(null)
        return
      }
      setWorkbook(wb)
      // questionIds 순서로 문제 로드, 삭제된 문제는 filter(Boolean)으로 제거
      const qs = await Promise.all(
        wb.questionIds.map((qid) => db.questions.get(qid))
      )
      const validQuestions = qs.filter((q): q is Question => q !== undefined)
      setQuestions(validQuestions)
    })
  }, [id])

  // 로딩 상태 — Skeleton 카드
  if (workbook === undefined) {
    return (
      <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-9 w-9 rounded-xl" />
          <Skeleton className="h-6 w-40 rounded-full" />
          <div className="w-9" />
        </div>
        <Skeleton className="h-2 w-full rounded-full" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    )
  }

  // 문제집 없음
  if (workbook === null) {
    return (
      <FadeIn className="p-4 md:p-6 max-w-3xl mx-auto">
        <AnimatedCard className="p-8 text-center space-y-4">
          <div className="text-5xl">📚</div>
          <p className="text-lg font-semibold">문제집을 찾을 수 없습니다</p>
          <Button variant="outline" className="rounded-xl" onClick={() => navigate('/student/workbooks')}>
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            목록으로 돌아가기
          </Button>
        </AnimatedCard>
      </FadeIn>
    )
  }

  // 문제 없음 (모두 삭제된 경우)
  if (questions.length === 0) {
    return (
      <FadeIn className="p-4 md:p-6 max-w-3xl mx-auto">
        <AnimatedCard className="p-8 text-center space-y-4">
          <div className="text-5xl">🔍</div>
          <p className="text-lg font-semibold">문제집의 문제가 모두 삭제되었습니다</p>
          <Button variant="outline" className="rounded-xl" onClick={() => navigate('/student/workbooks')}>
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            목록으로 돌아가기
          </Button>
        </AnimatedCard>
      </FadeIn>
    )
  }

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-4">
      {/* 헤더: 뒤로가기 + 문제집 제목 */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => navigate('/student/workbooks')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="text-center">
          <p className="text-sm font-semibold">{workbook.title}</p>
          <p className="text-xs text-muted-foreground">{questions.length}문제</p>
        </div>
        <div className="w-9" /> {/* 오른쪽 여백 균형 */}
      </div>

      {/* 문제 풀기 — 단일/다중 모두 동일하게 Swiper 흐름 사용 */}
      <QuizSwiperPage
        questions={questions}
        studentId={user?.email ?? ''}
        title={workbook.title}
        onBack={() => navigate('/student/workbooks')}
      />
    </div>
  )
}
