// GameQuizShell.tsx
// 모든 게임 모드가 공유하는 문제 표시 + 답안 입력 쉘
// Phase 19 게임화 퀴즈 엔진

import { type ReactNode, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LatexPreview } from '@/components/questions/LatexPreview'
import { MultipleChoiceInput } from '@/components/quiz/MultipleChoiceInput'
import { ShortAnswerInput } from '@/components/quiz/ShortAnswerInput'
import type { Question } from '@/lib/db'

interface GameQuizShellProps {
  /** 현재 문제 */
  question: Question
  /** 답안 제출 콜백 */
  onAnswer: (answer: string) => void
  /** 입력 비활성화 (답안 제출 후) */
  disabled?: boolean
  /** 모드별 HUD 삽입 슬롯 (타이머/하트/보스HP 등) */
  headerSlot?: ReactNode
  /** 추가 UI 슬롯 */
  footerSlot?: ReactNode
  /** 문제 번호 텍스트 (예: "Q3/10" 또는 "Q7") */
  questionLabel?: string
}

export function GameQuizShell({
  question,
  onAnswer,
  disabled = false,
  headerSlot,
  footerSlot,
  questionLabel,
}: GameQuizShellProps) {
  const [selected, setSelected] = useState('')

  // 문제 변경 시 선택 초기화
  const questionKey = question.id

  function handleSelect(answer: string) {
    if (disabled) return
    setSelected(answer)

    // 객관식: 선택 즉시 제출 (게임 모드 속도감)
    if (question.questionType === 'multiple') {
      onAnswer(answer)
      setSelected('')
    }
  }

  function handleShortAnswerSubmit() {
    if (disabled || !selected.trim()) return
    onAnswer(selected.trim())
    setSelected('')
  }

  return (
    <div className="space-y-4">
      {/* 모드별 HUD */}
      {headerSlot && (
        <div className="flex items-center justify-between">
          {headerSlot}
        </div>
      )}

      {/* 문제 번호 */}
      {questionLabel && (
        <p className="text-sm font-medium text-foreground/60">{questionLabel}</p>
      )}

      {/* 문제 본문 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={questionKey}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
          className="rounded-2xl border border-white/10 bg-white/5 p-5 md:p-6"
        >
          <LatexPreview content={question.content} />
          {question.imageDataUrl && (
            <img
              src={question.imageDataUrl}
              alt="문제 이미지"
              className="mt-3 max-w-full rounded-md"
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* 답안 입력 */}
      <div className="space-y-2">
        {question.questionType === 'multiple' ? (
          <MultipleChoiceInput
            selected={selected}
            onSelect={handleSelect}
            disabled={disabled}
            choices={question.choices}
          />
        ) : (
          <div className="space-y-3">
            <ShortAnswerInput
              value={selected}
              onChange={setSelected}
              disabled={disabled}
              placeholder="답을 입력하세요"
            />
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleShortAnswerSubmit}
              disabled={disabled || !selected.trim()}
              className="w-full rounded-xl h-12 bg-cyan-600 text-white font-bold text-base
                         disabled:opacity-40 disabled:cursor-not-allowed
                         hover:bg-cyan-500 transition-colors"
            >
              제출
            </motion.button>
          </div>
        )}
      </div>

      {/* 추가 슬롯 */}
      {footerSlot}
    </div>
  )
}
