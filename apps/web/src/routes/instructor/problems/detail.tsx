// apps/web/src/routes/instructor/problems/detail.tsx
// 문제 상세 페이지 — /instructor/problems/:id
import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router'
import { getQuestion, deleteQuestion } from '@/services/question.service'
import { LatexPreview } from '@/components/questions/LatexPreview'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Question } from '@/lib/db'
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react'

export default function QuestionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [question, setQuestion] = useState<Question | null>(null)
  const [isFetching, setIsFetching] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    getQuestion(Number(id))
      .then((q) => {
        if (!q) setError('문제를 찾을 수 없습니다')
        else setQuestion(q)
      })
      .catch(() => setError('문제를 불러오는 중 오류가 발생했습니다'))
      .finally(() => setIsFetching(false))
  }, [id])

  async function handleDelete() {
    if (!id) return
    if (!window.confirm('이 문제를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) return
    await deleteQuestion(Number(id))
    navigate('/instructor/problems')
  }

  const DIFFICULTY_LABELS: Record<number, string> = {
    1: '매우쉬움', 2: '쉬움', 3: '보통', 4: '어려움', 5: '매우어려움',
  }

  if (isFetching) {
    return (
      <div className="p-6 flex justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !question) {
    return (
      <div className="p-6 text-center">
        <p className="text-destructive">{error ?? '문제를 찾을 수 없습니다'}</p>
        <Button className="mt-4" onClick={() => navigate('/instructor/problems')}>
          목록으로
        </Button>
      </div>
    )
  }

  const sourceLabel = question.source.year
    ? `${question.source.type} ${question.source.year}년${question.source.number ? ` ${question.source.number}번` : ''}`
    : question.source.type

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate('/instructor/problems')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-xl font-bold">문제 상세</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to={`/instructor/problems/${id}/edit`}>
              <Pencil className="w-4 h-4 mr-1" />
              수정
            </Link>
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDelete}>
            <Trash2 className="w-4 h-4 mr-1" />
            삭제
          </Button>
        </div>
      </div>

      {/* 메타데이터 */}
      <div className="flex flex-wrap gap-2">
        <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium">
          {question.subject}
        </span>
        <span className="px-2 py-1 bg-muted rounded text-xs">{question.unit}</span>
        <span className="px-2 py-1 bg-muted rounded text-xs">{question.questionCategory}</span>
        <span className="px-2 py-1 bg-muted rounded text-xs">
          난이도: {DIFFICULTY_LABELS[question.difficulty]}
        </span>
        <span className="px-2 py-1 bg-muted rounded text-xs">
          {question.questionType === 'multiple' ? '객관식' : '단답형'}
        </span>
        <span className="px-2 py-1 bg-muted rounded text-xs">{sourceLabel}</span>
      </div>

      {/* 문제 본문 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">문제</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <LatexPreview content={question.content} />
          {question.imageDataUrl && (
            <img
              src={question.imageDataUrl}
              alt="문제 이미지"
              className="max-h-64 w-auto rounded-md object-contain border"
            />
          )}
        </CardContent>
      </Card>

      {/* 정답 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">정답</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg font-semibold text-primary">{question.answer}번</p>
        </CardContent>
      </Card>

      {/* 해설 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">해설</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <LatexPreview content={question.explanation} />
          {question.explanationImageDataUrl && (
            <img
              src={question.explanationImageDataUrl}
              alt="해설 이미지"
              className="max-h-64 w-auto rounded-md object-contain border"
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
