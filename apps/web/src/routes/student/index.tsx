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

import { BookOpenCheck, TrendingUp, Target, Clock } from 'lucide-react'
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
      <div className="p-4 md:p-6 max-w-4xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-4 bg-muted rounded w-1/2" />
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <BookOpenCheck className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">오늘 푼 문제</span>
            </div>
            <div className="text-xl font-bold">{todayCount}문제</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">정답률</span>
            </div>
            {accuracy === undefined ? (
              <div className="h-6 bg-muted rounded animate-pulse" />
            ) : (
              <div className="text-xl font-bold">{accuracy}%</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">연속 학습</span>
            </div>
            {streakCurrent === undefined ? (
              <div className="h-6 bg-muted rounded animate-pulse" />
            ) : (
              <div className="text-xl font-bold">{streakCurrent}일</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">학습 시간</span>
            </div>
            {totalMinutes === undefined ? (
              <div className="h-6 bg-muted rounded animate-pulse" />
            ) : (
              <div className="text-xl font-bold">{totalMinutes}분</div>
            )}
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
        </CardContent>
      </Card>

      {/* AI 추천 문제 섹션 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">AI 추천 문제</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {recommendedQuestions === undefined ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-muted rounded-lg animate-pulse" />
              ))}
            </div>
          ) : recommendedQuestions.length === 0 && attemptCount === 0 ? (
            /* 첫 진입 — 풀이 기록 없을 때 안내 메시지 */
            <p className="text-sm text-muted-foreground py-2">
              아직 풀이 기록이 없습니다. 문제를 풀면 AI가 맞춤 문제를 추천해 드려요!
            </p>
          ) : (
            <AIRecommendations
              questions={recommendedQuestions}
              isHeuristic={isHeuristic}
            />
          )}
          {/* 분석 페이지 링크 */}
          <Button asChild variant="outline" className="w-full mt-2">
            <Link to="/student/analytics">자세한 분석 보기</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
