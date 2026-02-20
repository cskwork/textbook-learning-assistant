// apps/web/src/routes/student/workbooks/play.tsx
// 문제집 순차 풀기 페이지 — QuizPlayer onNext prop으로 다음 문제 제어
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { QuizPlayer } from '@/components/quiz/QuizPlayer'
import { useAuth } from '@/contexts/AuthContext'
import { db, type Question, type Workbook } from '@/lib/db'
import { getWorkbook } from '@/services/workbook.service'

export default function WorkbookPlayPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [workbook, setWorkbook] = useState<Workbook | null | undefined>(undefined)
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [isFinished, setIsFinished] = useState(false)

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

  // QuizPlayer onComplete 콜백 — 정오답 집계 (WKST-04: submitQuizAttempt는 QuizPlayer 내부에서 자동 호출됨)
  function handleComplete(isCorrect: boolean) {
    if (isCorrect) setCorrectCount((prev) => prev + 1)
  }

  // 다음 문제 이동
  function handleNext() {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1)
    } else {
      setIsFinished(true)
    }
  }

  // 로딩 상태
  if (workbook === undefined) {
    return (
      <div className="p-4 md:p-6 max-w-2xl mx-auto flex justify-center items-center py-20">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // 문제집 없음
  if (workbook === null) {
    return (
      <div className="p-4 md:p-6 max-w-2xl mx-auto text-center py-20 space-y-4">
        <p className="text-lg text-muted-foreground">문제집을 찾을 수 없습니다</p>
        <Button variant="outline" onClick={() => navigate('/student/workbooks')}>
          목록으로 돌아가기
        </Button>
      </div>
    )
  }

  // 문제 없음 (모두 삭제된 경우)
  if (questions.length === 0) {
    return (
      <div className="p-4 md:p-6 max-w-2xl mx-auto text-center py-20 space-y-4">
        <p className="text-lg text-muted-foreground">문제집의 문제가 모두 삭제되었습니다</p>
        <Button variant="outline" onClick={() => navigate('/student/workbooks')}>
          목록으로 돌아가기
        </Button>
      </div>
    )
  }

  // 완료 화면
  if (isFinished) {
    const accuracy = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0
    return (
      <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-4">
          <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
          <h1 className="text-2xl font-bold">문제집 완료!</h1>
          <p className="text-muted-foreground">{workbook.title}</p>
        </div>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="rounded-lg bg-muted p-4">
            <p className="text-2xl font-bold">{questions.length}</p>
            <p className="text-sm text-muted-foreground">전체 문제</p>
          </div>
          <div className="rounded-lg bg-green-50 p-4">
            <p className="text-2xl font-bold text-green-600">{correctCount}</p>
            <p className="text-sm text-muted-foreground">정답</p>
          </div>
          <div className="rounded-lg bg-blue-50 p-4">
            <p className="text-2xl font-bold text-blue-600">{accuracy}%</p>
            <p className="text-sm text-muted-foreground">정답률</p>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Button onClick={() => navigate('/student/workbooks')}>문제집 목록으로</Button>
          <Button variant="outline" onClick={() => navigate('/student/wrong-notes')}>오답노트 확인</Button>
        </div>
      </div>
    )
  }

  // 문제 풀기 화면
  const currentQuestion = questions[currentIndex]
  if (!currentQuestion) return null

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-4">
      {/* 헤더: 뒤로가기 + 진행 상황 */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={() => navigate('/student/workbooks')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="text-center">
          <p className="text-sm font-medium">{workbook.title}</p>
          <p className="text-xs text-muted-foreground">{currentIndex + 1} / {questions.length}</p>
        </div>
        <div className="w-9" /> {/* 오른쪽 여백 균형 */}
      </div>

      {/* 진행 바 */}
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${(currentIndex / questions.length) * 100}%` }}
        />
      </div>

      {/* QuizPlayer — onNext로 다음 문제 제어, onComplete로 정오답 집계 */}
      <QuizPlayer
        key={currentQuestion.id}
        question={currentQuestion}
        studentId={user?.email ?? ''}
        onComplete={handleComplete}
        onNext={handleNext}
        onBack={() => navigate('/student/workbooks')}
      />
    </div>
  )
}
