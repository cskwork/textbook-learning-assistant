// apps/web/src/routes/instructor/problems/edit.tsx
// 문제 수정 페이지 — /instructor/problems/:id/edit
import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router'
import { getQuestion, updateQuestion } from '@/services/question.service'
import { QuestionForm, type QuestionFormData } from '@/components/questions/QuestionForm'
import type { Question } from '@/lib/db'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function EditQuestionPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [question, setQuestion] = useState<Question | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 기존 문제 데이터 로드
  useEffect(() => {
    if (!id) return
    getQuestion(Number(id))
      .then((q) => {
        if (!q) {
          setError('문제를 찾을 수 없습니다')
        } else {
          setQuestion(q)
        }
      })
      .catch(() => setError('문제를 불러오는 중 오류가 발생했습니다'))
      .finally(() => setIsFetching(false))
  }, [id])

  async function handleSubmit(data: QuestionFormData) {
    if (!id) return
    setIsLoading(true)
    setError(null)
    try {
      await updateQuestion(Number(id), {
        content: data.content,
        imageDataUrl: data.imageDataUrl,
        answer: data.answer,
        questionType: data.questionType,
        explanation: data.explanation,
        explanationImageDataUrl: data.explanationImageDataUrl,
        subject: data.subject,
        unit: data.unit,
        questionCategory: data.questionCategory,
        difficulty: data.difficulty as 1 | 2 | 3 | 4 | 5,
        source: {
          type: data.sourceType,
          year: data.sourceYear ? Number(data.sourceYear) : undefined,
          number: data.sourceNumber ? Number(data.sourceNumber) : undefined,
        },
      })
      navigate(`/instructor/problems/${id}`)
    } catch (err) {
      setError('문제 수정 중 오류가 발생했습니다')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  if (isFetching) {
    return (
      <div className="p-6 flex justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error && !question) {
    return (
      <div className="p-6 text-center">
        <p className="text-destructive">{error}</p>
        <Button className="mt-4" onClick={() => navigate('/instructor/problems')}>
          목록으로
        </Button>
      </div>
    )
  }

  // Question → QuestionFormData 변환
  const defaultValues: Partial<QuestionFormData> = question
    ? {
        content: question.content,
        imageDataUrl: question.imageDataUrl,
        answer: question.answer,
        questionType: question.questionType,
        explanation: question.explanation,
        explanationImageDataUrl: question.explanationImageDataUrl,
        subject: question.subject,
        unit: question.unit,
        questionCategory: question.questionCategory,
        difficulty: question.difficulty,
        sourceType: question.source.type,
        sourceYear: question.source.year ?? '',
        sourceNumber: question.source.number ?? '',
      }
    : {}

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(`/instructor/problems/${id}`)}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-xl font-bold">문제 수정</h1>
          <p className="text-sm text-muted-foreground">문제 내용과 메타데이터를 수정합니다</p>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive text-sm rounded-md p-3">
          {error}
        </div>
      )}

      <QuestionForm
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        submitLabel="수정 완료"
        isLoading={isLoading}
      />
    </div>
  )
}
