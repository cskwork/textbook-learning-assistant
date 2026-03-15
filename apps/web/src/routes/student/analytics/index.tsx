/**
 * 분석 대시보드 페이지 (/student/analytics)
 *
 * 4종 차트 + 일일 목표 + 스트릭 + AI 추천 문제 + 마스터리 맵 + 학습 경로 + 히스토리 타임라인 오케스트레이터 페이지
 *
 * 데이터 로드 패턴:
 *   - useLiveQuery: quizAttempts 변경 감지 + 오늘 풀이 수 실시간
 *   - useEffect: 비동기 서비스 함수 호출 (attemptCount + days 의존)
 *
 * 요건: AIAN-03, AIAN-04, REPT-01, REPT-02, REPT-03, REPT-04, PLAN-02, PLAN-03, ANLZ-01, ANLZ-02, ANLZ-03
 */

import { lazy, Suspense, useEffect, useState } from 'react'
import { useFunMode } from '@/contexts/FunModeContext'
import { GameLoadingSpinner } from '@/components/game/GameLoadingSpinner'

const FunModeAnalytics = lazy(() =>
  import('@/components/analytics/FunModeAnalytics').then(m => ({ default: m.FunModeAnalytics }))
)
import { useLiveQuery } from 'dexie-react-hooks'
import { useNavigate } from 'react-router'
import { useAuth } from '@/contexts/AuthContext'
import { db } from '@/lib/db'
import {
  getCategoryAccuracy,
  getDailyStats,
  getOverallStats,
  getWeakCategories,
  getRecommendedQuestions,
  getAllCategoryMastery,
  getWeeklyComparison,
} from '@/services/analytics.service'
import { getStreak } from '@/services/streak.service'

import { AccuracyBarChart } from '@/components/analytics/AccuracyBarChart'
import { DailyTrendLineChart } from '@/components/analytics/DailyTrendLineChart'
import { WeakTypeRadarChart } from '@/components/analytics/WeakTypeRadarChart'
import { SummaryStatsCards, type OverallStats, type StreakData } from '@/components/analytics/SummaryStatsCards'
import DailyGoalProgress from '@/components/analytics/DailyGoalProgress'
import StreakBadge from '@/components/analytics/StreakBadge'
import AIRecommendations from '@/components/analytics/AIRecommendations'
import DateRangeSelector from '@/components/analytics/DateRangeSelector'
import { MasteryMap } from '@/components/analytics/MasteryMap'
import { LearningPathCard } from '@/components/analytics/LearningPathCard'
import { HistoryTimeline, type WeeklyComparisonData } from '@/components/analytics/HistoryTimeline'
import type { Question } from '@/lib/db'
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FadeIn } from '@/components/motion/FadeIn'
import { AnimatedCard } from '@/components/motion/AnimatedCard'
import { PageContainer } from '@/components/layout/PageContainer'

/** WeakTypeRadarChart용 { category, pL }[] 타입 */
type WeakCategoryData = { category: string; pL: number }

/** MasteryMap용 데이터 타입 */
type MasteryData = {
  category: string
  pL: number
  total: number
  correct: number
  level: 'mastery' | 'proficient' | 'learning' | 'weak'
}

export default function AnalyticsPage() {
  const { isFunMode } = useFunMode()
  const { user } = useAuth()
  const navigate = useNavigate()

  /** 날짜 범위 선택 state (기본값 14일) */
  const [days, setDays] = useState(14)

  // ---------------------------------------------------------------------------
  // 실시간 쿼리 (useLiveQuery)
  // ---------------------------------------------------------------------------

  /** quizAttempts 총 건수 — useEffect 재실행 트리거로 사용 */
  const attemptCount = useLiveQuery(
    () =>
      user
        ? db.quizAttempts.where('studentId').equals(user.email).count()
        : 0,
    [user?.email],
  )

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
  // 비동기 상태 (useEffect)
  // ---------------------------------------------------------------------------

  const [categoryAccuracy, setCategoryAccuracy] = useState<
    { category: string; accuracy: number; total: number }[]
  >([])
  const [dailyStats, setDailyStats] = useState<
    { date: string; count: number; correct: number }[]
  >([])
  const [overallStats, setOverallStats] = useState<OverallStats>({
    total: 0,
    correct: 0,
    accuracy: 0,
    totalTimeSeconds: 0,
  })
  const [weakCategories, setWeakCategories] = useState<WeakCategoryData[]>([])
  const [recommendedQuestions, setRecommendedQuestions] = useState<Question[]>([])
  const [streak, setStreak] = useState<StreakData>({ current: 0, max: 0 })
  const [isHeuristic, setIsHeuristic] = useState(true)

  // 신규 상태
  const [masteryData, setMasteryData] = useState<MasteryData[]>([])
  const [weeklyComparison, setWeeklyComparison] = useState<WeeklyComparisonData>({
    thisWeek: { count: 0, correct: 0, accuracy: 0 },
    lastWeek: { count: 0, correct: 0, accuracy: 0 },
    changePercent: 0,
  })

  useEffect(() => {
    if (!user) return

    const studentId = user.email

    async function loadAllData() {
      const [catAcc, daily, overall, weakCats, recommendedIds, streakData, masteryAll, weekly] =
        await Promise.all([
          getCategoryAccuracy(studentId),
          getDailyStats(studentId, days),
          getOverallStats(studentId),
          getWeakCategories(studentId),
          getRecommendedQuestions(studentId, 5),
          getStreak(studentId),
          getAllCategoryMastery(studentId),
          getWeeklyComparison(studentId),
        ])

      setCategoryAccuracy(catAcc)
      setDailyStats(daily)
      setOverallStats(overall)
      setWeakCategories(weakCats)
      setStreak(streakData)
      setMasteryData(masteryAll)
      setWeeklyComparison(weekly)

      // getRecommendedQuestions → questionId[] → Question[] 로드
      if (recommendedIds.length > 0) {
        const questions = await db.questions
          .where('id')
          .anyOf(recommendedIds)
          .toArray()
        setRecommendedQuestions(questions)
      } else {
        setRecommendedQuestions([])
      }

      // 콜드스타트 여부: 시도 30회 미만이면 휴리스틱
      const count = await db.quizAttempts.where('studentId').equals(studentId).count()
      setIsHeuristic(count < 30)
    }

    loadAllData()
  }, [user, attemptCount, days])

  if (!user) return null

  if (isFunMode) {
    return (
      <Suspense fallback={<GameLoadingSpinner />}>
        <FunModeAnalytics />
      </Suspense>
    )
  }

  return (
    <FadeIn>
      <PageContainer variant="wide" align="left" className="space-y-5 py-4 md:space-y-6 md:py-6 lg:py-8">
        {/* 헤더: 제목 + 스트릭 뱃지 + DateRangeSelector */}
        <FadeIn delay={0}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-[1.65rem] font-extrabold text-foreground tracking-tight">학습 분석</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                나의 학습 현황을 한눈에 확인하세요
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <StreakBadge streak={streak} />
              <DateRangeSelector value={days} onChange={setDays} />
            </div>
          </div>
        </FadeIn>

        {/* 일일 목표 진행률 */}
        <FadeIn delay={0.05}>
          <DailyGoalProgress userId={user.email} todayCount={todayCount} />
        </FadeIn>

        {/* 요약 통계 카드 4종 */}
        <FadeIn delay={0.1}>
          <SummaryStatsCards
            stats={overallStats}
            todayCount={todayCount}
            streak={streak}
          />
        </FadeIn>

        {/* 주간 히스토리 타임라인 — 전체 폭 */}
        <FadeIn delay={0.15}>
          <AnimatedCard className="rounded-2xl border-none shadow-sm bg-white dark:bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold">학습 히스토리</CardTitle>
            </CardHeader>
            <CardContent>
              <HistoryTimeline
                dailyStats={dailyStats}
                weeklyComparison={weeklyComparison}
              />
            </CardContent>
          </AnimatedCard>
        </FadeIn>

        {/* 유형별 마스터리 맵 + 추천 학습 경로 — 2컬럼 */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-5">
          {/* 마스터리 맵 (3/5) */}
          <FadeIn delay={0.2} className="lg:col-span-3">
            <AnimatedCard className="rounded-2xl border-none shadow-sm bg-white dark:bg-card h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold">유형별 마스터리 맵</CardTitle>
              </CardHeader>
              <CardContent>
                <MasteryMap data={masteryData} />
              </CardContent>
            </AnimatedCard>
          </FadeIn>

          {/* 추천 학습 경로 (2/5) */}
          <FadeIn delay={0.25} className="lg:col-span-2">
            <AnimatedCard className="rounded-2xl border-none shadow-sm bg-white dark:bg-card h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold">추천 학습 경로</CardTitle>
              </CardHeader>
              <CardContent>
                <LearningPathCard
                  weakCategories={weakCategories}
                  onNavigate={(category) =>
                    navigate(`/student/problems?category=${encodeURIComponent(category)}`)
                  }
                />
              </CardContent>
            </AnimatedCard>
          </FadeIn>
        </div>

        {/* AI 추천 문제 섹션 */}
        <FadeIn delay={0.3}>
          <AnimatedCard className="rounded-2xl border-none shadow-sm bg-white dark:bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold">AI 추천 문제</CardTitle>
            </CardHeader>
            <CardContent>
              <AIRecommendations
                questions={recommendedQuestions}
                isHeuristic={isHeuristic}
              />
            </CardContent>
          </AnimatedCard>
        </FadeIn>

        {/* 차트 2컬럼 그리드: 데스크톱에서 나란히 배치 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5">
          {/* 유형별 정답률 차트 */}
          <FadeIn delay={0.35}>
            <AnimatedCard className="rounded-2xl border-none shadow-sm bg-white dark:bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold">유형별 정답률</CardTitle>
              </CardHeader>
              <CardContent>
                <AccuracyBarChart data={categoryAccuracy} />
              </CardContent>
            </AnimatedCard>
          </FadeIn>

          {/* 취약 유형 분포 */}
          <FadeIn delay={0.4}>
            <AnimatedCard className="rounded-2xl border-none shadow-sm bg-white dark:bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold">취약 유형 분포</CardTitle>
              </CardHeader>
              <CardContent>
                <WeakTypeRadarChart data={weakCategories} />
              </CardContent>
            </AnimatedCard>
          </FadeIn>
        </div>

        {/* 학습 추이 — 선택된 날짜 범위 기준, 전체 폭 */}
        <FadeIn delay={0.45}>
          <AnimatedCard className="rounded-2xl border-none shadow-sm bg-white dark:bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold">학습 추이 ({days}일)</CardTitle>
            </CardHeader>
            <CardContent>
              <DailyTrendLineChart data={dailyStats} />
            </CardContent>
          </AnimatedCard>
        </FadeIn>
      </PageContainer>
    </FadeIn>
  )
}
