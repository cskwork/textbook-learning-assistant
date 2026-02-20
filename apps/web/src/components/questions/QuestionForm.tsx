// apps/web/src/components/questions/QuestionForm.tsx
// 문제 등록/수정 공유 폼 컴포넌트
// react-hook-form + zod + shadcn Form + LatexEditor + ImageUpload + AIGeneratePanel
// UX 개선: 필수 입력(항상 노출) + 선택 입력(이미지/출처 접기/펼치기)
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { LatexEditor } from './LatexEditor'
import { ImageUpload } from './ImageUpload'
import { AIGeneratePanel } from './AIGeneratePanel'
import { useAuth } from '@/contexts/AuthContext'
import { getGeminiApiKey } from '@/services/settings.service'
import type { GeneratedQuestion } from '@/services/gemini.service'
import type { Question } from '@/lib/db'

// zod 스키마 — QBNK-01, 02, 04, 05 필드 포함
export const questionSchema = z.object({
  content: z.string().min(5, '문제 내용은 5자 이상이어야 합니다'),
  answer: z.string().min(1, '정답을 입력하세요'),
  questionType: z.enum(['multiple', 'short']),
  subject: z.enum(['수학I', '수학II', '미적분', '확률과통계', '기하']),
  unit: z.string().min(1, '단원을 입력하세요'),
  questionCategory: z.string().min(1, '유형을 입력하세요'),
  difficulty: z.coerce.number().int().min(1).max(5),
  explanation: z.string().min(1, '해설을 입력하세요'),
  sourceType: z.enum(['수능', '모의고사', '교육청', '기타']),
  sourceYear: z.coerce.number().int().min(2000).max(2035).optional().or(z.literal('')),
  sourceNumber: z.coerce.number().int().min(1).max(50).optional().or(z.literal('')),
  imageDataUrl: z.string().optional(),
  explanationImageDataUrl: z.string().optional(),
})

export type QuestionFormData = z.infer<typeof questionSchema>

interface QuestionFormProps {
  defaultValues?: Partial<QuestionFormData>
  onSubmit: (data: QuestionFormData) => Promise<void>
  submitLabel?: string
  isLoading?: boolean
}

const SUBJECTS: Question['subject'][] = ['수학I', '수학II', '미적분', '확률과통계', '기하']
const DIFFICULTIES = [
  { value: '1', label: '⭐ 매우 쉬움' },
  { value: '2', label: '⭐⭐ 쉬움' },
  { value: '3', label: '⭐⭐⭐ 보통' },
  { value: '4', label: '⭐⭐⭐⭐ 어려움' },
  { value: '5', label: '⭐⭐⭐⭐⭐ 매우 어려움' },
]

export function QuestionForm({
  defaultValues,
  onSubmit,
  submitLabel = '문제 저장',
  isLoading = false,
}: QuestionFormProps) {
  // 선택 입력(이미지/출처) 접기/펼치기 상태 — 기본값: 닫힘
  const [isOptionalOpen, setIsOptionalOpen] = useState(false)
  // AI 문제 생성 — Gemini API 키 로드
  const { user } = useAuth()
  const [geminiApiKey, setGeminiApiKey] = useState<string | undefined>(undefined)

  useEffect(() => {
    if (!user) return
    getGeminiApiKey(user.email).then(setGeminiApiKey)
  }, [user?.email])

  // AI 생성 결과를 폼 필드에 자동으로 채운다
  function handleAIGenerated(result: GeneratedQuestion) {
    form.setValue('content', result.content)
    form.setValue('answer', result.answer)
    form.setValue('explanation', result.explanation)
    form.setValue('questionType', result.questionType)
    form.setValue('difficulty', result.difficulty)
    form.trigger(['content', 'answer', 'explanation'])
  }

  const form = useForm<QuestionFormData>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      questionType: 'multiple',
      subject: '수학I',
      difficulty: 3,
      sourceType: '수능',
      content: '',
      answer: '',
      unit: '',
      questionCategory: '',
      explanation: '',
      ...defaultValues,
    },
  })

  const questionType = form.watch('questionType')
  const sourceType = form.watch('sourceType')

  async function handleSubmit(data: QuestionFormData) {
    await onSubmit(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">

        {/* AI 문제 생성 도우미 패널 — 폼 최상단 배치 */}
        <AIGeneratePanel apiKey={geminiApiKey} onGenerated={handleAIGenerated} />

        <hr className="border-border/40" />

        {/* ================================================================
            필수 입력 영역 — 항상 노출
            ================================================================ */}
        <p className="text-sm font-medium text-muted-foreground">필수 입력</p>

        {/* 문제 유형 */}
        <FormField
          control={form.control}
          name="questionType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>문제 유형</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="multiple">객관식 (5지선다)</SelectItem>
                  <SelectItem value="short">단답형</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 문제 본문 (LaTeX 에디터) */}
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>문제 내용 *</FormLabel>
              <FormControl>
                <LatexEditor
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="수식 예시: $a^2 + b^2 = c^2$ 또는 $$\int_0^1 x\,dx = \frac{1}{2}$$"
                  minHeight="min-h-40"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 정답 */}
        <FormField
          control={form.control}
          name="answer"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                정답 * {questionType === 'multiple' ? '(1~5 중 하나)' : '(숫자 입력)'}
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder={questionType === 'multiple' ? '예: 3' : '예: 42'}
                  className="max-w-32"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 해설 (LaTeX 에디터) */}
        <FormField
          control={form.control}
          name="explanation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>해설 *</FormLabel>
              <FormControl>
                <LatexEditor
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="단계별 풀이 과정을 입력하세요"
                  minHeight="min-h-32"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 메타데이터 그리드 — 과목/난이도/단원/유형 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* 과목 */}
          <FormField
            control={form.control}
            name="subject"
            render={({ field }) => (
              <FormItem>
                <FormLabel>과목 *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {SUBJECTS.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 난이도 */}
          <FormField
            control={form.control}
            name="difficulty"
            render={({ field }) => (
              <FormItem>
                <FormLabel>난이도 *</FormLabel>
                <Select
                  onValueChange={(v) => field.onChange(Number(v))}
                  defaultValue={String(field.value)}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {DIFFICULTIES.map((d) => (
                      <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 단원 */}
          <FormField
            control={form.control}
            name="unit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>단원 *</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="예: 수열의 극한, 미분법" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 유형 */}
          <FormField
            control={form.control}
            name="questionCategory"
            render={({ field }) => (
              <FormItem>
                <FormLabel>유형 *</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="예: 등비수열, 정적분 계산" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* ================================================================
            선택 입력 영역 — 접기/펼치기 (이미지 + 출처)
            접힌 상태에서도 form state는 유지됨 (hidden, unmount 아님)
            ================================================================ */}
        <div className="border-t border-dashed pt-4 mt-4">
          <button
            type="button"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full"
            onClick={() => setIsOptionalOpen(!isOptionalOpen)}
          >
            {isOptionalOpen ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
            선택 입력 (이미지, 출처)
          </button>

          <div className={isOptionalOpen ? 'mt-4 space-y-6' : 'hidden'}>
            {/* 문제 이미지 (선택) */}
            <FormField
              control={form.control}
              name="imageDataUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>문제 이미지 (선택)</FormLabel>
                  <FormControl>
                    <ImageUpload
                      value={field.value}
                      onChange={field.onChange}
                      label="그래프/도형 이미지 업로드"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 해설 이미지 (선택) */}
            <FormField
              control={form.control}
              name="explanationImageDataUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>해설 이미지 (선택)</FormLabel>
                  <FormControl>
                    <ImageUpload
                      value={field.value}
                      onChange={field.onChange}
                      label="해설 이미지 업로드"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 출처 — QBNK-05 */}
            <div className="space-y-3 border rounded-lg p-4">
              <p className="text-sm font-medium">출처 정보</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <FormField
                  control={form.control}
                  name="sourceType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>시험 종류</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {(['수능', '모의고사', '교육청', '기타'] as const).map((t) => (
                            <SelectItem key={t} value={t}>{t}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {sourceType !== '기타' && (
                  <FormField
                    control={form.control}
                    name="sourceYear"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>연도</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            placeholder="예: 2024"
                            min={2000}
                            max={2035}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {sourceType !== '기타' && (
                  <FormField
                    control={form.control}
                    name="sourceNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>번호</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            placeholder="예: 30"
                            min={1}
                            max={50}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 제출 버튼 */}
        <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
          {isLoading ? '저장 중...' : submitLabel}
        </Button>
      </form>
    </Form>
  )
}
