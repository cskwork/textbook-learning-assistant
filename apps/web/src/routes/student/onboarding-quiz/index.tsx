/**
 * 온보딩 진단 퀴즈 페이지
 *
 * 신규 사용자(isDiagnosisCompleted=false)가 학습 전 5~10문제를 풀어
 * BKT 초기 상태를 seed한다.
 *
 * 흐름:
 * 1. questions 테이블이 비어있으면 즉시 완료 처리 → /student 이동
 * 2. 문제 있으면 subject별 무작위 샘플링 (최대 10문제)
 * 3. QuizPlayer로 한 문제씩 풀기 (QuizPlayer가 내부적으로 submitQuizAttempt 처리)
 * 4. 모든 문제 완료 → isDiagnosisCompleted=true 저장 → /student 이동
 */

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { db, type Question } from '@/lib/db'
import { useAuth } from '@/contexts/AuthContext'
import { QuizPlayer } from '@/components/quiz/QuizPlayer'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PageContainer } from '@/components/layout/PageContainer'
import { getDiagnosticProgress } from './progress'

const SUBJECTS: Array<Question['subject']> = ['수학I', '수학II', '미적분', '확률과통계', '기하']
const MAX_QUESTIONS = 10

/** subject별로 무작위 1~2문제 샘플링, 최대 MAX_QUESTIONS개 반환 */
async function sampleDiagnosticQuestions(): Promise<Question[]> {
  const sampled: Question[] = []

  for (const subject of SUBJECTS) {
    const subjectQuestions = await db.questions
      .where('subject')
      .equals(subject)
      .toArray()

    if (subjectQuestions.length === 0) continue

    // 무작위 1~2개 선택
    const shuffled = [...subjectQuestions].sort(() => Math.random() - 0.5)
    const pickCount = subjectQuestions.length >= 2 ? 2 : 1
    sampled.push(...shuffled.slice(0, pickCount))
  }

  // 최대 10문제로 슬라이스 (추가 셔플 후)
  return sampled.sort(() => Math.random() - 0.5).slice(0, MAX_QUESTIONS)
}

export default function OnboardingQuizPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  // 진단 문제 목록
  const [questions, setQuestions] = useState<Question[] | null>(null)
  // 현재 문제 인덱스
  const [currentIndex, setCurrentIndex] = useState(0)
  // 완료 여부 (모든 문제 풀고 저장 완료)
  const [isDone, setIsDone] = useState(false)

  useEffect(() => {
    async function init() {
      const count = await db.questions.count()

      if (count === 0) {
        // 문제 없음 — 즉시 완료 처리
        if (user?.email) {
          await db.userSettings.put({
            userId: user.email,
            dailyGoal: 10,
            isDiagnosisCompleted: true,
          } as Parameters<typeof db.userSettings.put>[0])
        }
        navigate('/student', { replace: true })
        return
      }

      const sampled = await sampleDiagnosticQuestions()

      if (sampled.length === 0) {
        // 샘플링 결과 없음 — 즉시 완료 처리
        if (user?.email) {
          await db.userSettings.put({
            userId: user.email,
            dailyGoal: 10,
            isDiagnosisCompleted: true,
          } as Parameters<typeof db.userSettings.put>[0])
        }
        navigate('/student', { replace: true })
        return
      }

      setQuestions(sampled)
    }

    init()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.email])

  /** QuizPlayer의 onNext 콜백 — 다음 문제로 이동 또는 전체 완료 처리 */
  async function handleNext() {
    if (!questions) return

    const nextIndex = currentIndex + 1

    if (nextIndex >= questions.length) {
      // 모든 문제 완료 — isDiagnosisCompleted=true 저장
      if (user?.email) {
        await db.userSettings.put({
          userId: user.email,
          dailyGoal: 10,
          isDiagnosisCompleted: true,
        } as Parameters<typeof db.userSettings.put>[0])
      }
      setIsDone(true)
      navigate('/student', { replace: true })
    } else {
      setCurrentIndex(nextIndex)
    }
  }

  // 초기화 중 (문제 로딩 전)
  if (questions === null && !isDone) {
    return (
      <PageContainer
        variant="wide"
        className="py-4 md:py-6 lg:mx-0 lg:max-w-5xl lg:py-8 xl:max-w-6xl"
      >
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-4 bg-muted rounded w-2/3" />
          <div className="h-48 bg-muted rounded" />
        </div>
      </PageContainer>
    )
  }

  const currentQuestion = questions?.[currentIndex]
  const questionCount = questions?.length ?? 0
  const progress = getDiagnosticProgress(currentIndex, questionCount)

  return (
    <PageContainer
      variant="wide"
      className="space-y-5 py-4 md:space-y-6 md:py-6 lg:mx-0 lg:max-w-5xl lg:py-8 xl:max-w-6xl"
    >
      {/* 헤더 */}
      <section className="rounded-[28px] border border-border/60 bg-card/70 px-5 py-5 shadow-sm md:px-6 lg:px-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-2">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-primary/70">
              Level Check
            </p>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                진단 퀴즈
              </h1>
              <p className="mt-1 text-sm leading-6 text-muted-foreground md:text-[0.95rem]">
                내 학습 수준을 빠르게 파악해 문제 추천과 학습 흐름을 맞춥니다. 시작 전에
                현재 실력을 가볍게 확인하세요.
              </p>
            </div>
          </div>

          {questions && questionCount > 0 && (
            <div className="min-w-[220px] rounded-2xl border border-primary/15 bg-primary/[0.04] px-4 py-3 lg:w-[280px]">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-foreground">진행 상황</span>
                <span className="tabular-nums text-muted-foreground">
                  {currentIndex + 1} / {questionCount}
                </span>
              </div>
              <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-primary/10">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 현재 subject 배지 */}
      {currentQuestion && (
        <Card className="border-primary/15 bg-primary/[0.035] shadow-none">
          <CardContent className="flex items-center gap-3 px-5 py-3 md:px-6">
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary/80">
              과목
            </span>
            <span className="text-sm font-semibold text-primary md:text-base">
              {currentQuestion.subject}
            </span>
          </CardContent>
        </Card>
      )}

      {/* QuizPlayer — 문제 표시 + 채점 + submitQuizAttempt 내부 처리 */}
      {currentQuestion && user?.email && (
        <div className="lg:max-w-[min(100%,64rem)]">
          <QuizPlayer
            key={currentQuestion.id}
            question={currentQuestion}
            studentId={user.email}
            onNext={handleNext}
          />
        </div>
      )}

      {/* 퀴즈 스킵 버튼 */}
      <div className="flex justify-start pt-1">
        <Button
          variant="ghost"
          className="w-full text-sm text-muted-foreground sm:w-auto sm:min-w-56"
          onClick={async () => {
            if (user?.email) {
              await db.userSettings.put({
                userId: user.email,
                dailyGoal: 10,
                isDiagnosisCompleted: true,
              } as Parameters<typeof db.userSettings.put>[0])
            }
            navigate('/student', { replace: true })
          }}
        >
          진단 퀴즈 건너뛰기
        </Button>
      </div>
    </PageContainer>
  )
}
