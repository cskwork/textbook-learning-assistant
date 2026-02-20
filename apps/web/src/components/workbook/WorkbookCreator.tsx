// apps/web/src/components/workbook/WorkbookCreator.tsx
// 문제집 생성 UI — setup(필터 설정) → preview(문제 미리보기 + 이름 저장) 2단계
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  getFilteredQuestions,
  createWorkbook,
  getFilterOptions,
} from '@/services/workbook.service'
import { LatexPreview } from '@/components/questions/LatexPreview'
import type { Question } from '@/lib/db'

// ──────────────────────────────────────────────
// 상수
// ──────────────────────────────────────────────
const SUBJECTS = ['수학I', '수학II', '미적분', '확률과통계', '기하'] as const

const DIFFICULTY_LABELS: Record<string, string> = {
  '1': '매우쉬움',
  '2': '쉬움',
  '3': '보통',
  '4': '어려움',
  '5': '매우어려움',
}

const COUNT_OPTIONS = [5, 10, 15, 20, 30] as const

// ──────────────────────────────────────────────
// 폼 스키마
// ──────────────────────────────────────────────
const schema = z.object({
  title: z
    .string()
    .min(1, '문제집 이름을 입력하세요')
    .max(50, '50자 이내로 입력하세요'),
})

type FormData = z.infer<typeof schema>

// ──────────────────────────────────────────────
// 단계 타입
// ──────────────────────────────────────────────
type CreatorPhase = 'setup' | 'preview'

// ──────────────────────────────────────────────
// Props
// ──────────────────────────────────────────────
interface WorkbookCreatorProps {
  studentId: string
  onCreated: () => void
}

// ──────────────────────────────────────────────
// 컴포넌트
// ──────────────────────────────────────────────
export function WorkbookCreator({ studentId, onCreated }: WorkbookCreatorProps) {
  // 단계
  const [phase, setPhase] = useState<CreatorPhase>('setup')

  // 필터 상태
  const [subject, setSubject] = useState<string>('')
  const [unit, setUnit] = useState<string>('')
  const [questionCategory, setQuestionCategory] = useState<string>('')
  const [difficulty, setDifficulty] = useState<string>('')
  const [count, setCount] = useState<number>(10)

  // 미리보기 상태
  const [previewQuestions, setPreviewQuestions] = useState<Question[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [filterWarning, setFilterWarning] = useState<string>('')
  const [filterError, setFilterError] = useState<string>('')

  // 동적 필터 옵션 (마운트 시 로드)
  const [units, setUnits] = useState<string[]>([])
  const [categories, setCategories] = useState<string[]>([])

  // react-hook-form (미리보기 단계 문제집 이름 폼)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  // 마운트 시 필터 옵션 로드
  useEffect(() => {
    getFilterOptions().then(({ units: u, categories: c }) => {
      setUnits(u)
      setCategories(c)
    })
  }, [])

  // ──────────────────────────────────────────────
  // 핸들러
  // ──────────────────────────────────────────────

  async function handlePreview() {
    setIsLoading(true)
    setFilterWarning('')
    setFilterError('')

    const questions = await getFilteredQuestions({
      subject: subject || undefined,
      unit: unit || undefined,
      questionCategory: questionCategory || undefined,
      difficulty: difficulty ? Number(difficulty) : undefined,
      count,
    })

    if (questions.length === 0) {
      setFilterError('조건에 맞는 문제가 없습니다. 조건을 변경해보세요.')
      setIsLoading(false)
      return
    }

    if (questions.length < count) {
      setFilterWarning(
        `요청한 ${count}개 중 ${questions.length}개만 찾았습니다.`,
      )
    }

    setPreviewQuestions(questions)
    setPhase('preview')
    setIsLoading(false)
  }

  async function handleSave(data: FormData) {
    setIsLoading(true)
    await createWorkbook({
      studentId,
      title: data.title,
      filters: {
        subject: subject || undefined,
        unit: unit || undefined,
        questionCategory: questionCategory || undefined,
        difficulty: difficulty ? Number(difficulty) : undefined,
        count,
      },
      questionIds: previewQuestions.map((q) => q.id),
    })
    onCreated()
  }

  // ──────────────────────────────────────────────
  // setup 단계 UI
  // ──────────────────────────────────────────────
  if (phase === 'setup') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>문제집 조건 설정</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 과목 */}
          <div className="space-y-1.5">
            <Label>과목</Label>
            <Select value={subject || '__all__'} onValueChange={(v) => setSubject(v === '__all__' ? '' : v)}>
              <SelectTrigger>
                <SelectValue placeholder="전체 과목" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">전체</SelectItem>
                {SUBJECTS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 단원 */}
          <div className="space-y-1.5">
            <Label>단원</Label>
            <Select value={unit || '__all__'} onValueChange={(v) => setUnit(v === '__all__' ? '' : v)}>
              <SelectTrigger>
                <SelectValue placeholder="전체 단원" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">전체</SelectItem>
                {units.map((u) => (
                  <SelectItem key={u} value={u}>
                    {u}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 유형 */}
          <div className="space-y-1.5">
            <Label>유형</Label>
            <Select
              value={questionCategory || '__all__'}
              onValueChange={(v) => setQuestionCategory(v === '__all__' ? '' : v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="전체 유형" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">전체</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 난이도 */}
          <div className="space-y-1.5">
            <Label>난이도</Label>
            <Select value={difficulty || '__all__'} onValueChange={(v) => setDifficulty(v === '__all__' ? '' : v)}>
              <SelectTrigger>
                <SelectValue placeholder="전체 난이도" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">전체</SelectItem>
                {Object.entries(DIFFICULTY_LABELS).map(([val, label]) => (
                  <SelectItem key={val} value={val}>
                    {val}: {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 문제 수 */}
          <div className="space-y-1.5">
            <Label>문제 수</Label>
            <Select
              value={String(count)}
              onValueChange={(v) => setCount(Number(v))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COUNT_OPTIONS.map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n}문제
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 에러 메시지 */}
          {filterError && (
            <p className="text-sm text-destructive">{filterError}</p>
          )}

          {/* 미리보기 버튼 */}
          <Button
            className="w-full"
            onClick={handlePreview}
            disabled={isLoading}
          >
            {isLoading ? '문제 검색 중...' : '문제 미리보기'}
          </Button>
        </CardContent>
      </Card>
    )
  }

  // ──────────────────────────────────────────────
  // preview 단계 UI
  // ──────────────────────────────────────────────
  return (
    <Card>
      <CardHeader>
        <CardTitle>문제 미리보기</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 경고 메시지 */}
        {filterWarning && (
          <div className="rounded-md bg-yellow-50 border border-yellow-200 p-3 text-sm text-yellow-800">
            {filterWarning}
          </div>
        )}

        {/* 문제 목록 */}
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {previewQuestions.map((q, index) => (
            <div
              key={q.id}
              className="rounded-md border bg-muted/30 p-3 text-sm space-y-0.5"
            >
              <p className="text-muted-foreground text-xs">
                {q.subject} · {q.unit} · 난이도 {q.difficulty}
              </p>
              <div className="line-clamp-1 flex items-baseline gap-1">
                <span className="shrink-0">{index + 1}.</span>
                <LatexPreview
                  content={q.content.length > 50 ? q.content.slice(0, 50) + '...' : q.content}
                  className="inline text-sm"
                />
              </div>
            </div>
          ))}
        </div>

        <hr className="border-border" />

        {/* 문제집 이름 입력 폼 */}
        <form onSubmit={handleSubmit(handleSave)} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="title">문제집 이름</Label>
            <Input
              id="title"
              placeholder="예: 수학I 삼각함수 연습"
              {...register('title')}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          {/* 버튼 행 */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setPhase('setup')}
              disabled={isLoading}
            >
              ← 조건 변경
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? '저장 중...' : '저장하기'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
