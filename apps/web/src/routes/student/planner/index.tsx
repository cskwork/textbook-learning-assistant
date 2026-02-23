/**
 * 학습 플래너 페이지 (/student/planner)
 *
 * 구성:
 *   - 헤더 "학습 플래너" + 설명 텍스트
 *   - DailyGoalProgress — 오늘의 진행률 (실시간)
 *   - PlannerCalendar (lg: w-1/3) + TaskChecklist (lg: w-2/3) — lg: 가로 배치
 *   - WeeklySettingsCard + NotificationToggle — 2컬럼
 *
 * 데이터 패턴:
 *   - useLiveQuery: 이번 달 studyPlans(markedDates), 선택 날짜 플랜+태스크
 *   - useEffect: 플랜 없을 때 CTA 표시
 *
 * 요건: PLAN-01, PLAN-02, PLAN-03
 */

import { useState, useEffect, useCallback } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { CalendarDays } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useFunMode } from '@/hooks/useFunMode'
import { SwordIcon } from '@/components/game/icons'
import { db } from '@/lib/db'
import {
  createDailyPlan,
  toggleTask,
  getPlanTasks,
} from '@/services/planner.service'
import type { StudyPlan, StudyTask } from '@/lib/db'

import { PlannerCalendar } from '@/components/planner/PlannerCalendar'
import { TaskChecklist } from '@/components/planner/TaskChecklist'
import { WeeklySettingsCard } from '@/components/planner/WeeklySettingsCard'
import { NotificationToggle } from '@/components/planner/NotificationToggle'
import DailyGoalProgress from '@/components/analytics/DailyGoalProgress'
import { FadeIn } from '@/components/motion/FadeIn'
import { AnimatedCard } from '@/components/motion/AnimatedCard'
import { Button } from '@/components/ui/button'

/** 로컬 타임존 기준 오늘 날짜 YYYY-MM-DD */
function toLocalKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

/** 로컬 타임존 기준 오늘 자정 timestamp */
function todayStartTs(): number {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

export default function PlannerPage() {
  const { user } = useAuth()
  const { isFunMode } = useFunMode()

  // 선택 날짜 state (기본: 오늘)
  const [selectedDate, setSelectedDate] = useState(() => toLocalKey(new Date()))

  // 선택 날짜의 플랜 + 태스크 (비동기 로드)
  const [selectedPlan, setSelectedPlan] = useState<StudyPlan | null>(null)
  const [tasks, setTasks] = useState<StudyTask[]>([])
  const [isLoadingPlan, setIsLoadingPlan] = useState(false)

  // 오늘 풀이 수 (실시간)
  const todayStart = todayStartTs()
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

  // 이번 달 markedDates (학습한 날짜 Set) — useLiveQuery
  const currentYear = new Date(selectedDate + 'T00:00:00').getFullYear()
  const currentMonth = new Date(selectedDate + 'T00:00:00').getMonth()

  const markedDates = useLiveQuery(
    async () => {
      if (!user) return new Set<string>()
      const monthStart = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`
      const monthEnd = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-31`
      const plans = await db.studyPlans
        .where('studentId')
        .equals(user.email)
        .filter((p) => p.date >= monthStart && p.date <= monthEnd)
        .toArray()
      return new Set(plans.map((p) => p.date))
    },
    [user?.email, currentYear, currentMonth],
    new Set<string>(),
  )

  // studyTasks 변경 감지 (useLiveQuery trigger)
  const taskChangeCounter = useLiveQuery(
    () => (user ? db.studyTasks.where('studentId').equals(user.email).count() : 0),
    [user?.email],
  )

  // 선택 날짜 변경 시 플랜 + 태스크 로드
  const loadPlan = useCallback(async () => {
    if (!user) return
    setIsLoadingPlan(true)
    try {
      // 선택 날짜의 daily 플랜 조회
      const plans = await db.studyPlans
        .where('[studentId+date]')
        .equals([user.email, selectedDate])
        .filter((p) => p.type === 'daily')
        .toArray()
      const plan = plans[0] ?? null
      setSelectedPlan(plan)

      if (plan) {
        const planTasks = await getPlanTasks(plan.id)
        setTasks(planTasks)
      } else {
        setTasks([])
      }
    } finally {
      setIsLoadingPlan(false)
    }
  }, [user, selectedDate])

  useEffect(() => {
    loadPlan()
  }, [loadPlan, taskChangeCounter])

  // 태스크 토글
  async function handleToggle(taskId: number) {
    await toggleTask(taskId)
    // taskChangeCounter가 변경되어 loadPlan 재실행됨
  }

  // 태스크 추가 (플랜 없으면 자동 생성)
  async function handleAddTask(title: string, subject?: string, targetCount?: number) {
    if (!user) return
    const count = targetCount ?? 0
    if (selectedPlan) {
      // 기존 플랜에 태스크 추가
      const existingTasks = await getPlanTasks(selectedPlan.id)
      await db.studyTasks.add({
        planId: selectedPlan.id,
        studentId: user.email,
        title,
        subject,
        targetCount: count,
        completedCount: 0,
        isCompleted: false,
        order: existingTasks.length,
        createdAt: Date.now(),
      })
    } else {
      // 플랜 없음 — 선택 날짜 기준 daily 플랜 자동 생성
      const now = Date.now()
      const planId = await db.studyPlans.add({
        studentId: user.email,
        date: selectedDate,
        type: 'daily',
        targetCount: count,
        createdAt: now,
        updatedAt: now,
      } as Omit<StudyPlan, 'id'>)
      await db.studyTasks.add({
        planId: planId as number,
        studentId: user.email,
        title,
        subject,
        targetCount: count,
        completedCount: 0,
        isCompleted: false,
        order: 0,
        createdAt: now,
      })
    }
    // taskChangeCounter 변경으로 자동 리로드
  }

  // 오늘 학습 계획 시작하기 (빈 daily 플랜 생성)
  async function handleStartTodayPlan() {
    if (!user) return
    await createDailyPlan(user.email, 10, [])
  }

  if (!user) return null

  const funStyle = isFunMode
    ? {
        background: 'var(--fun-bg-primary)',
        color: 'var(--fun-text-primary)',
        minHeight: '100%',
      } as const
    : undefined

  const plannerCardClass = isFunMode
    ? 'border border-cyan-400/30 !bg-black/45 backdrop-blur-xl'
    : ''

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 space-y-4" style={funStyle}>
      {/* 헤더 */}
      <FadeIn delay={0}>
        <div className="flex items-center gap-2">
          {isFunMode ? (
            <SwordIcon size={24} color="var(--fun-neon-cyan)" glow />
          ) : (
            <CalendarDays className="h-6 w-6 text-primary" />
          )}
          <div>
            <h1
              className="text-xl font-bold"
              style={isFunMode ? { color: 'var(--fun-neon-cyan)' } : undefined}
            >
              {isFunMode ? '전략 플래너' : '학습 플래너'}
            </h1>
            <p
              className="text-xs"
              style={isFunMode ? { color: 'var(--fun-text-secondary)' } : undefined}
            >
              날짜를 선택하여 학습 계획을 확인하세요
            </p>
          </div>
        </div>
      </FadeIn>

      {/* 오늘의 진행률 */}
      <FadeIn delay={0.05}>
        <DailyGoalProgress userId={user.email} todayCount={todayCount} />
      </FadeIn>

      {/* 캘린더 + 체크리스트 */}
      <FadeIn delay={0.1}>
        <div className="flex flex-col lg:flex-row gap-4">
          {/* 캘린더 (lg: 1/3) */}
          <AnimatedCard className={`lg:w-1/3 p-4 ${plannerCardClass}`}>
            <PlannerCalendar
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              markedDates={markedDates}
              isFunMode={isFunMode}
            />
          </AnimatedCard>

          {/* 체크리스트 (lg: 2/3) */}
          <AnimatedCard className={`lg:flex-1 p-4 ${plannerCardClass}`}>
            <div className="flex items-center justify-between mb-3">
              <h2
                className="text-sm font-semibold"
                style={isFunMode ? { color: 'var(--fun-text-primary)' } : undefined}
              >
                {selectedDate === toLocalKey(new Date()) ? '오늘의 할 일' : `${selectedDate} 할 일`}
              </h2>
              {/* 플랜 없고 오늘 날짜일 때 CTA */}
              {!selectedPlan && !isLoadingPlan && selectedDate === toLocalKey(new Date()) && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  style={isFunMode ? {
                    borderColor: 'rgba(0, 212, 255, 0.35)',
                    color: 'var(--fun-neon-cyan)',
                    background: 'rgba(0, 212, 255, 0.08)',
                  } : undefined}
                  onClick={handleStartTodayPlan}
                >
                  오늘 계획 시작하기
                </Button>
              )}
            </div>
            <TaskChecklist
              tasks={tasks}
              onToggle={handleToggle}
              onAddTask={handleAddTask}
              isFunMode={isFunMode}
            />
          </AnimatedCard>
        </div>
      </FadeIn>

      {/* 주간 설정 + 알림 */}
      <FadeIn delay={0.15}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <WeeklySettingsCard userId={user.email} isFunMode={isFunMode} />
          <NotificationToggle userId={user.email} isFunMode={isFunMode} />
        </div>
      </FadeIn>
    </div>
  )
}
