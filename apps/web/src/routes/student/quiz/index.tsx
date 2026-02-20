// apps/web/src/routes/student/quiz/index.tsx
// 퀴즈 플레이어 페이지 — useParams(:id) + QuizPlayer + 북마크
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router'
import { Bookmark } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { QuizPlayer } from '@/components/quiz/QuizPlayer'
import { useAuth } from '@/contexts/AuthContext'
import { db, type Question } from '@/lib/db'
import { getWrongNote, toggleBookmark } from '@/services/wrongNote.service'

export default function QuizPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [question, setQuestion] = useState<Question | null | undefined>(undefined) // undefined=로딩중, null=없음
  const [isBookmarked, setIsBookmarked] = useState(false)

  // 문제 로드
  useEffect(() => {
    const questionId = Number(id)
    if (!id || isNaN(questionId)) {
      setQuestion(null)
      return
    }

    db.questions.get(questionId).then((q) => {
      setQuestion(q ?? null)
    })
  }, [id])

  // 북마크 초기 상태 로드
  useEffect(() => {
    if (!question || !user?.email) return

    getWrongNote(question.id, user.email).then((note) => {
      setIsBookmarked(note?.isBookmarked ?? false)
    })
  }, [question, user?.email])

  // 북마크 토글 핸들러
  async function handleBookmarkToggle() {
    if (!question || !user?.email) return
    const newBookmarked = await toggleBookmark(question.id, user.email, question)
    setIsBookmarked(newBookmarked)
  }

  // 로딩 중
  if (question === undefined) {
    return (
      <div className="p-4 md:p-6 max-w-2xl mx-auto">
        <div className="flex justify-center items-center py-20">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  // 문제 없음
  if (question === null) {
    return (
      <div className="p-4 md:p-6 max-w-2xl mx-auto">
        <div className="text-center py-20 space-y-4">
          <p className="text-lg text-muted-foreground">문제를 찾을 수 없습니다</p>
          <Button variant="outline" onClick={() => navigate('/student/problems')}>
            목록으로 돌아가기
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-4">
      {/* 페이지 헤더: 과목/단원 정보 + 북마크 버튼 */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <p className="text-xs text-muted-foreground">{question.subject} · {question.unit}</p>
          <h1 className="text-lg font-semibold">문제 풀기</h1>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBookmarkToggle}
          aria-label={isBookmarked ? '북마크 해제' : '북마크 추가'}
        >
          <Bookmark
            className={isBookmarked ? 'fill-primary text-primary' : 'text-muted-foreground'}
          />
        </Button>
      </div>

      {/* 퀴즈 플레이어 */}
      <QuizPlayer
        question={question}
        studentId={user?.email ?? ''}
        onBack={() => navigate('/student/problems')}
      />
    </div>
  )
}
