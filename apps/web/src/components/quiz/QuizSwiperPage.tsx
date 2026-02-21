// apps/web/src/components/quiz/QuizSwiperPage.tsx
// Swiper 기반 다중 문제 풀이 컴포넌트 — 좌우 스와이프로 문제 전환 (QUIZ-02)
import { useRef, useState } from 'react'
import type { Swiper as SwiperType } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import { motion } from 'framer-motion'
import { CheckCircle2, RotateCcw, List } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { QuizPlayer } from '@/components/quiz/QuizPlayer'
import { FadeIn } from '@/components/motion/FadeIn'
import { cn } from '@/lib/utils'
import type { Question } from '@/lib/db'

// ─── Props ──────────────────────────────────────────────────────────────────

interface QuizSwiperPageProps {
  questions: Question[]
  studentId: string
  onComplete?: () => void   // 모든 문제 완료 후 콜백
  onBack?: () => void        // 문제집 목록 복귀 콜백
  title?: string             // 문제집 타이틀 (헤더 표시용)
}

// ─── 내부 컨트롤러 — swiper 인스턴스에 접근하는 래퍼 ──────────────────────

// ─── 컴포넌트 ────────────────────────────────────────────────────────────────

export default function QuizSwiperPage({
  questions,
  studentId,
  onComplete,
  onBack,
  title,
}: QuizSwiperPageProps) {
  const swiperRef = useRef<SwiperType | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  // questionId → isCorrect 완료 상태 맵
  const [results, setResults] = useState<Map<number, boolean>>(new Map())
  const [showSummary, setShowSummary] = useState(false)

  // 문제 완료 처리
  function handleComplete(questionId: number, isCorrect: boolean) {
    setResults((prev) => {
      const next = new Map(prev)
      next.set(questionId, isCorrect)
      return next
    })
  }

  // 다음 문제로 이동 (onNext 콜백)
  function handleNext(questionIndex: number) {
    if (questionIndex < questions.length - 1) {
      swiperRef.current?.slideNext()
    } else {
      // 마지막 문제 — 전체 완료
      setShowSummary(true)
      onComplete?.()
    }
  }

  // 정답 수 계산
  const correctCount = Array.from(results.values()).filter(Boolean).length
  const completedCount = results.size

  // ── 전체 완료 요약 화면 ────────────────────────────────────────────────────
  if (showSummary) {
    const accuracy = questions.length > 0
      ? Math.round((correctCount / questions.length) * 100)
      : 0

    return (
      <FadeIn className="space-y-6 p-4">
        <div className="text-center space-y-4">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          >
            <CheckCircle2 className="h-16 w-16 text-success mx-auto" />
          </motion.div>
          <h2 className="text-2xl font-bold">풀이 완료!</h2>
          {title && <p className="text-muted-foreground">{title}</p>}
        </div>

        {/* 결과 통계 */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="rounded-2xl bg-muted p-4">
            <p className="text-2xl font-bold">{questions.length}</p>
            <p className="text-sm text-muted-foreground">전체 문제</p>
          </div>
          <div className="rounded-2xl bg-success/10 p-4">
            <p className="text-2xl font-bold text-success">{correctCount}</p>
            <p className="text-sm text-muted-foreground">정답</p>
          </div>
          <div className="rounded-2xl bg-primary/10 p-4">
            <p className="text-2xl font-bold text-primary">{accuracy}%</p>
            <p className="text-sm text-muted-foreground">정답률</p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {onBack && (
            <Button onClick={onBack}>
              <List className="h-4 w-4 mr-1.5" />
              목록으로 돌아가기
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => {
              setShowSummary(false)
              setResults(new Map())
              setCurrentIndex(0)
              swiperRef.current?.slideTo(0)
            }}
          >
            <RotateCcw className="h-4 w-4 mr-1.5" />
            다시 풀기
          </Button>
        </div>
      </FadeIn>
    )
  }

  // ── 문제 번호 인디케이터 바 ────────────────────────────────────────────────
  return (
    <div className="space-y-3">
      {/* 문제 번호 인디케이터 — 수평 스크롤 원형 버튼 */}
      <div className="overflow-x-auto pb-1">
        <div className="flex gap-1.5 min-w-max px-1">
          {questions.map((q, i) => {
            const isCompleted = results.has(q.id)
            const isCurrent = i === currentIndex
            const isCorrectQ = results.get(q.id)

            return (
              <button
                key={q.id}
                type="button"
                onClick={() => swiperRef.current?.slideTo(i)}
                className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all duration-200',
                  isCurrent
                    ? 'bg-primary text-white scale-110'
                    : isCompleted
                      ? isCorrectQ
                        ? 'bg-success/20 text-success'
                        : 'bg-destructive/20 text-destructive'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80',
                )}
              >
                {isCompleted ? (isCorrectQ ? '✓' : '✗') : i + 1}
              </button>
            )
          })}
        </div>
      </div>

      {/* 진행 바 */}
      <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-300"
          style={{ width: `${(completedCount / questions.length) * 100}%` }}
        />
      </div>

      {/* Swiper 문제 슬라이드 */}
      <Swiper
        spaceBetween={0}
        slidesPerView={1}
        allowTouchMove={true}
        modules={[Pagination]}
        onSwiper={(swiper) => { swiperRef.current = swiper }}
        onSlideChange={(swiper) => setCurrentIndex(swiper.activeIndex)}
        className="quiz-swiper"
      >
        {questions.map((question, index) => (
          <SwiperSlide key={question.id}>
            <div className="pb-4 px-0.5">
              <QuizPlayer
                question={question}
                studentId={studentId}
                questionIndex={index}
                totalQuestions={questions.length}
                onComplete={(isCorrect) => handleComplete(question.id, isCorrect)}
                onNext={() => handleNext(index)}
                onBack={onBack}
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )
}
