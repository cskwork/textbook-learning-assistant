// apps/web/src/components/questions/AIGeneratePanel.tsx
// AI 문제 생성 패널 컴포넌트 — QuestionForm 내부에서 사용
// 강사가 프롬프트를 입력하면 Gemini API를 호출하여 문제를 자동 생성한다
import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { generateMathQuestion, type GeneratedQuestion } from '@/services/gemini.service'

interface AIGeneratePanelProps {
  /** Gemini API 키 — undefined이면 미설정 상태 (버튼 비활성화 + 안내 메시지 표시) */
  apiKey: string | undefined
  /** AI 생성 완료 시 호출 — 생성된 문제 데이터를 폼 필드에 채우는 콜백 */
  onGenerated: (result: GeneratedQuestion) => void
}

/**
 * AI 문제 생성 패널
 *
 * 강사가 프롬프트를 입력하고 "AI로 문제 생성" 버튼을 클릭하면
 * Gemini API를 호출하여 수학 문제를 생성하고 onGenerated 콜백을 호출한다.
 *
 * API 키 미설정 시: 버튼 비활성화 + 마이페이지 안내 메시지 표시
 * 생성 중: 로딩 스피너(텍스트) 표시
 * 에러 시: 인라인 에러 메시지 표시
 */
export function AIGeneratePanel({ apiKey, onGenerated }: AIGeneratePanelProps) {
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleGenerate() {
    if (!apiKey || !prompt.trim()) return
    setIsGenerating(true)
    setError(null)
    try {
      const result = await generateMathQuestion(apiKey, prompt)
      onGenerated(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'AI 생성 중 오류가 발생했습니다')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="border rounded-xl p-4 space-y-3 bg-muted/20 dark:bg-muted/10">
      {/* 헤더 */}
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-primary" />
        <span className="text-sm font-semibold">AI 문제 생성 도우미</span>
      </div>

      {/* 프롬프트 입력 */}
      <Textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="예: 미적분 치환적분 문제, 난이도 어려움, 객관식"
        className="min-h-[80px] text-sm resize-none"
        disabled={isGenerating}
      />

      {/* 에러 메시지 */}
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}

      {/* 생성 버튼 */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleGenerate}
        disabled={isGenerating || !prompt.trim() || !apiKey}
      >
        <Sparkles className="w-3.5 h-3.5 mr-1.5" />
        {isGenerating ? 'AI 생성 중...' : 'AI로 문제 생성'}
      </Button>

      {/* API 키 미설정 안내 */}
      {!apiKey && (
        <p className="text-xs text-muted-foreground">
          AI 기능을 사용하려면 마이페이지에서 Gemini API 키를 설정하세요.
        </p>
      )}
    </div>
  )
}
