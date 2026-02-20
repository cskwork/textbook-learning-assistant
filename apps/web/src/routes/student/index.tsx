/**
 * 학생 홈 페이지
 *
 * Phase 5 — 실데이터 연결 완료
 *   - 요약 통계 카드 4종: 오늘 풀이, 정답률, 연속 학습, 학습 시간
 *   - AI 추천 문제 (최대 3개) + "자세한 분석 보기" 링크
 *   - 로딩 중(undefined): animate-pulse placeholder 유지
 *
 * Quick-001 UX 개선:
 *   - 문제 수 실시간 표시 + 랜덤 문제 풀기 버튼
 *   - 첫 진입(풀이 0건) 시 AI 추천 영역에 안내 메시지
 */

import { BookOpenCheck, TrendingUp, Target, Clock, Users } from 'lucide-react'
import { Link, Navigate, useNavigate } from 'react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { useEffect, useState } from 'react'
import { getOverallStats, getRecommendedQuestions } from '@/services/analytics.service'
import { getStreak } from '@/services/streak.service'
import AIRecommendations from '@/components/analytics/AIRecommendations'
import type { Question } from '@/lib/db'

export default function StudentHomePage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  // useLiveQuery 반환값:
  //   undefined  → 쿼리 로딩 중
  //   null       → 쿼리 완료 + 레코드 없음 (신규 사용자)
  //   UserSetting → 쿼리 완료 + 레코드 있음
  const userSetting = useLiveQuery(
    () => user ? db.userSettings.where('userId').equals(user.email).first() : undefined,
    [user?.email],
  )

  /** quizAttempts 총 건수 — useEffect 재실행 트리거 */
  const attemptCount = useLiveQuery(
    () => user ? db.quizAttempts.where('studentId').equals(user.email).count() : 0,
    [user?.email],
  )

  /** 등록된 전체 문제 수 — 시드 데이터 포함 */
  const questionCount = useLiveQuery(
    () => db.questions.count(),
    [],
  ) ?? 0

  /** 오늘 풀이 수 (로컬 타임존 자정 기준) */
  const todayStart = (() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d.getTime()
  })()

  const todayCount =
    useLiveQuery(
      () =>
        user
          ? db.quizAttempts
              .where('studentId')
              .equals(user.email)
              .filter((a) => a.attemptedAt >= todayStart)
              .count()
          : 0,
      [user?.email, todayStart],
    ) ?? 0

  // ---------------------------------------------------------------------------
  // 비동기 통계 상태
  // ---------------------------------------------------------------------------

  const [accuracy, setAccuracy] = useState<number | undefined>(undefined)
  const [streakCurrent, setStreakCurrent] = useState<number | undefined>(undefined)
  const [totalMinutes, setTotalMinutes] = useState<number | undefined>(undefined)
  const [recommendedQuestions, setRecommendedQuestions] = useState<Question[] | undefined>(undefined)
  const [isHeuristic, setIsHeuristic] = useState(true)

  useEffect(() => {
    if (!user) return
    const studentId = user.email

    async function loadStats() {
      const [overall, streakData, recommendedIds] = await Promise.all([
        getOverallStats(studentId),
        getStreak(studentId),
        getRecommendedQuestions(studentId, 3),
      ])

      setAccuracy(overall.accuracy)
      setStreakCurrent(streakData.current)
      setTotalMinutes(Math.floor(overall.totalTimeSeconds / 60))

      if (recommendedIds.length > 0) {
        const questions = await db.questions.where('id').anyOf(recommendedIds).toArray()
        setRecommendedQuestions(questions)
      } else {
        setRecommendedQuestions([])
      }

      const count = await db.quizAttempts.where('studentId').equals(studentId).count()
      setIsHeuristic(count < 30)
    }

    loadStats()
  }, [user, attemptCount])

  /** 랜덤 문제 풀기 — 전체 문제 중 무작위 1개 선택 후 퀴즈 페이지로 이동 */
  async function handleRandomQuiz() {
    const all = await db.questions.toArray()
    if (all.length === 0) return
    const random = all[Math.floor(Math.random() * all.length)]
    navigate(`/student/quiz/${random.id}`)
  }

  // 로딩 중 — undefined인 경우 스피너 표시
  if (userSetting === undefined) {
    return (
      <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
        <div className="animate-pulse space-y-2">
          <div className="h-8 bg-muted rounded-xl w-48" />
          <div className="h-4 bg-muted/60 rounded-lg w-64" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="rounded-2xl border-none shadow-sm bg-white/60 dark:bg-card/40 h-32">
              <CardContent className="p-5 flex flex-col items-center justify-center h-full space-y-3">
                <div className="w-10 h-10 rounded-full bg-muted animate-pulse" />
                <div className="h-6 w-16 bg-muted animate-pulse rounded" />
                <div className="h-3 w-12 bg-muted/60 animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  // 신규 사용자(레코드 없음) 또는 진단 미완료 → 온보딩 퀴즈로 리디렉트
  if (userSetting === null || !userSetting.isDiagnosisCompleted) {
    return <Navigate to="/student/onboarding-quiz" replace />
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      {/* 환영 메시지 */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">안녕하세요!</h1>
        <p className="text-muted-foreground mt-1">
          {user?.email} 님의 학습 현황입니다.
        </p>
      </div>

      {/* 요약 통계 카드 그리드 — 실데이터 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
        <Card className="rounded-2xl border-none shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 bg-white/60 dark:bg-card/40 backdrop-blur-xl">
          <CardContent className="p-5 flex flex-col items-center justify-center text-center h-full">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-3">
              <BookOpenCheck className="w-5 h-5 text-primary" />
            </div>
            <div className="text-2xl font-bold tracking-tight mb-1">{todayCount}</div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">오늘 푼 문제</span>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-none shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 bg-white/60 dark:bg-card/40 backdrop-blur-xl">
          <CardContent className="p-5 flex flex-col items-center justify-center text-center h-full">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-3">
              <Target className="w-5 h-5 text-primary" />
            </div>
            {accuracy === undefined ? (
              <div className="h-8 w-16 bg-muted rounded animate-pulse mb-1" />
            ) : (
              <div className="text-2xl font-bold tracking-tight mb-1">{accuracy}%</div>
            )}
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">정답률</span>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-none shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 bg-white/60 dark:bg-card/40 backdrop-blur-xl">
          <CardContent className="p-5 flex flex-col items-center justify-center text-center h-full">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-3">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            {streakCurrent === undefined ? (
              <div className="h-8 w-16 bg-muted rounded animate-pulse mb-1" />
            ) : (
              <div className="text-2xl font-bold tracking-tight mb-1">{streakCurrent}일</div>
            )}
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">연속 학습</span>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-none shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 bg-white/60 dark:bg-card/40 backdrop-blur-xl">
          <CardContent className="p-5 flex flex-col items-center justify-center text-center h-full">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-3">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            {totalMinutes === undefined ? (
              <div className="h-8 w-16 bg-muted rounded animate-pulse mb-1" />
            ) : (
              <div className="text-2xl font-bold tracking-tight mb-1">{totalMinutes}분</div>
            )}
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">학습 시간</span>
          </CardContent>
        </Card>
      </div>

      {/* 문제 풀기 바로가기 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">문제 풀기</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {questionCount > 0
              ? `등록된 ${questionCount}개의 문제를 풀고 실력을 향상시켜 보세요.`
              : '아직 등록된 문제가 없습니다.'}
          </p>
          <Button asChild className="w-full">
            <Link to="/student/problems">문제 목록 보기</Link>
          </Button>
          {/* 랜덤 문제 풀기 버튼 */}
          <Button
            variant="outline"
            className="w-full"
            onClick={handleRandomQuiz}
            disabled={questionCount === 0}
          >
            랜덤 문제 풀기
          </Button>
          {/* 반 참여 버튼 */}
          <Button variant="outline" size="sm" className="w-full" asChild>
            <Link to="/student/join-group">
              <Users className="h-4 w-4 mr-1" />
              반 참여
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* AI 추천 문제 섹션 */}
      <Card className="rounded-2xl border-none shadow-sm bg-white/60 dark:bg-card/40 backdrop-blur-xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            AI 추천 문제
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {recommendedQuestions === undefined ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-muted/50 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : recommendedQuestions.length === 0 && attemptCount === 0 ? (
            /* 첫 진입 — 풀이 기록 없을 때 안내 메시지 (빈 상태 개선) */
            <div className="flex flex-col items-center justify-center py-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">아직 분석 데이터가 없어요!</p>
                <p className="text-xs text-muted-foreground mt-1">문제를 몇 번 풀면 AI가 취약점 맞춤 문제를 추천해 드려요.</p>
              </div>
            </div>
          ) : (
            <AIRecommendations
              questions={recommendedQuestions}
              isHeuristic={isHeuristic}
            />
          )}
          {/* 분석 페이지 링크 */}
          <Button asChild variant="secondary" className="w-full mt-2 rounded-xl text-primary font-medium hover:bg-primary/10 bg-primary/5">
            <Link to="/student/analytics">자세한 분석 보기</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
