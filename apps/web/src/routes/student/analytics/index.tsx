/**
 * 분석 대시보드 페이지 (/student/analytics)
 *
 * 4종 차트 + 일일 목표 + 스트릭 + AI 추천 문제를 조합한 오케스트레이터 페이지
 *
 * 데이터 로드 패턴:
 *   - useLiveQuery: quizAttempts 변경 감지 + 오늘 풀이 수 실시간
 *   - useEffect: 비동기 서비스 함수 호출 (attemptCount 의존)
 *
 * 요건: AIAN-03, AIAN-04, REPT-01, REPT-02, REPT-03, REPT-04, PLAN-02, PLAN-03
 */

import { useEffect, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { useAuth } from '@/contexts/AuthContext'
import { db } from '@/lib/db'
import {
  getCategoryAccuracy,
  getDailyStats,
  getOverallStats,
  getWeakCategories,
  getRecommendedQuestions,
} from '@/services/analytics.service'
import { getStreak } from '@/services/streak.service'

import { AccuracyBarChart } from '@/components/analytics/AccuracyBarChart'
import { DailyTrendLineChart } from '@/components/analytics/DailyTrendLineChart'
import { WeakTypeRadarChart } from '@/components/analytics/WeakTypeRadarChart'
import { SummaryStatsCards, type OverallStats, type StreakData } from '@/components/analytics/SummaryStatsCards'
import DailyGoalProgress from '@/components/analytics/DailyGoalProgress'
import StreakBadge from '@/components/analytics/StreakBadge'
import AIRecommendations from '@/components/analytics/AIRecommendations'
import type { Question } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

/** WeakTypeRadarChart용 { category, pL }[] 타입 */
type WeakCategoryData = { category: string; pL: number }

export default function AnalyticsPage() {
  const { user } = useAuth()

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

  useEffect(() => {
    if (!user) return

    const studentId = user.email

    async function loadAllData() {
      const [catAcc, daily, overall, weakCats, recommendedIds, streakData] =
        await Promise.all([
          getCategoryAccuracy(studentId),
          getDailyStats(studentId, 14),
          getOverallStats(studentId),
          getWeakCategories(studentId),
          getRecommendedQuestions(studentId, 5),
          getStreak(studentId),
        ])

      setCategoryAccuracy(catAcc)
      setDailyStats(daily)
      setOverallStats(overall)
      setWeakCategories(weakCats)
      setStreak(streakData)

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
  }, [user, attemptCount])

  if (!user) return null

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      {/* 헤더: 제목 + 스트릭 뱃지 */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">학습 분석</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            나의 학습 현황을 한눈에 확인하세요
          </p>
        </div>
        <StreakBadge streak={streak} />
      </div>

      {/* 일일 목표 진행률 */}
      <DailyGoalProgress userId={user.email} todayCount={todayCount} />

      {/* 요약 통계 카드 4종 */}
      <SummaryStatsCards
        stats={overallStats}
        todayCount={todayCount}
        streak={streak}
      />

      {/* AI 추천 문제 섹션 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">AI 추천 문제</CardTitle>
        </CardHeader>
        <CardContent>
          <AIRecommendations
            questions={recommendedQuestions}
            isHeuristic={isHeuristic}
          />
        </CardContent>
      </Card>

      {/* 유형별 정답률 차트 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">유형별 정답률</CardTitle>
        </CardHeader>
        <CardContent>
          <AccuracyBarChart data={categoryAccuracy} />
        </CardContent>
      </Card>

      {/* 학습 추이 (14일) */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">학습 추이 (14일)</CardTitle>
        </CardHeader>
        <CardContent>
          <DailyTrendLineChart data={dailyStats} />
        </CardContent>
      </Card>

      {/* 취약 유형 분포 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">취약 유형 분포</CardTitle>
        </CardHeader>
        <CardContent>
          <WeakTypeRadarChart data={weakCategories} />
        </CardContent>
      </Card>
    </div>
  )
}
