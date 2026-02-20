// apps/web/src/routes/instructor/problems/new.tsx
// 문제 등록 페이지 — /instructor/problems/new
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '@/contexts/AuthContext'
import { createQuestion } from '@/services/question.service'
import { QuestionForm, type QuestionFormData } from '@/components/questions/QuestionForm'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NewQuestionPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(data: QuestionFormData) {
    setIsLoading(true)
    setError(null)
    try {
      await createQuestion({
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
        createdBy: user?.email ?? 'unknown',
      })
      navigate('/instructor/problems')
    } catch (err) {
      setError('문제 저장 중 오류가 발생했습니다')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/instructor/problems')}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-xl font-bold">새 문제 등록</h1>
          <p className="text-sm text-muted-foreground">LaTeX 수식을 포함한 수학 문제를 등록합니다</p>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive text-sm rounded-md p-3">
          {error}
        </div>
      )}

      <QuestionForm
        onSubmit={handleSubmit}
        submitLabel="문제 등록"
        isLoading={isLoading}
      />
    </div>
  )
}
