// apps/web/src/services/planner.service.ts
// 학습 플래너 CRUD + 진행률 + 주간 설정 서비스 — Phase 13 PLAN-01, PLAN-02, PLAN-03
import { db, type StudyPlan, type StudyTask } from '@/lib/db'

// ---------------------------------------------------------------------------
// 날짜 유틸 (로컬 타임존 기준)
// ---------------------------------------------------------------------------

/** 로컬 타임존 기준 오늘 날짜 YYYY-MM-DD */
function toLocalDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

/** 이번 주 월요일 YYYY-MM-DD 반환 (로컬 타임존 기준) */
export function getThisWeekMonday(): string {
  const today = new Date()
  const dayOfWeek = today.getDay() // 0(일)~6(토)
  // 월요일 기준: dayOfWeek=0(일)이면 -6, 1(월)이면 0, ..., 6(토)이면 -5
  const daysToMonday = dayOfWeek === 0 ? -6 : -(dayOfWeek - 1)
  const monday = new Date(today)
  monday.setDate(today.getDate() + daysToMonday)
  return toLocalDateKey(monday)
}

// ---------------------------------------------------------------------------
// 1. getTodayPlan — 오늘 일간 플랜 조회
// ---------------------------------------------------------------------------

/**
 * 오늘 일간 플랜 조회
 * - 로컬 타임존 기준 오늘 날짜, type='daily'인 레코드 반환
 * - 없으면 null
 */
export async function getTodayPlan(studentId: string): Promise<StudyPlan | null> {
  const today = toLocalDateKey(new Date())
  const plans = await db.studyPlans
    .where('[studentId+date]')
    .equals([studentId, today])
    .filter((p) => p.type === 'daily')
    .toArray()
  return plans[0] ?? null
}

// ---------------------------------------------------------------------------
// 2. getWeekPlan — 주간 플랜 조회
// ---------------------------------------------------------------------------

/**
 * 주간 플랜 조회
 * - weekStartDate(이번 주 월요일 YYYY-MM-DD) 기준으로 type='weekly' 레코드 반환
 * - 없으면 null
 */
export async function getWeekPlan(
  studentId: string,
  weekStartDate: string,
): Promise<StudyPlan | null> {
  const plans = await db.studyPlans
    .where('studentId')
    .equals(studentId)
    .filter((p) => p.type === 'weekly' && p.weekStartDate === weekStartDate)
    .toArray()
  return plans[0] ?? null
}

// ---------------------------------------------------------------------------
// 3. createDailyPlan — 오늘 일간 플랜 + 태스크 생성
// ---------------------------------------------------------------------------

/**
 * 오늘 일간 플랜 + 하위 태스크 생성
 * - date: 로컬 타임존 기준 오늘 YYYY-MM-DD
 * - tasks: 태스크 목록 (title, subject?, targetCount)
 * - 반환: 생성된 StudyPlan
 */
export async function createDailyPlan(
  studentId: string,
  targetCount: number,
  tasks: { title: string; subject?: string; targetCount: number }[],
): Promise<StudyPlan> {
  const now = Date.now()
  const today = toLocalDateKey(new Date())

  const planId = await db.studyPlans.add({
    studentId,
    date: today,
    type: 'daily',
    targetCount,
    createdAt: now,
    updatedAt: now,
  } as Omit<StudyPlan, 'id'>)

  // 하위 태스크 일괄 생성
  await db.studyTasks.bulkAdd(
    tasks.map((task, index) => ({
      planId: planId as number,
      studentId,
      title: task.title,
      subject: task.subject,
      targetCount: task.targetCount,
      completedCount: 0,
      isCompleted: false,
      order: index,
      createdAt: now,
    })),
  )

  return (await db.studyPlans.get(planId as number))!
}

// ---------------------------------------------------------------------------
// 4. createWeeklyPlan — 이번 주 주간 플랜 + 태스크 생성
// ---------------------------------------------------------------------------

/**
 * 이번 주 주간 플랜 + 하위 태스크 생성
 * - weekStartDate: 이번 주 월요일 YYYY-MM-DD (getThisWeekMonday() 사용)
 * - 반환: 생성된 StudyPlan
 */
export async function createWeeklyPlan(
  studentId: string,
  targetCount: number,
  tasks: { title: string; subject?: string; targetCount: number }[],
): Promise<StudyPlan> {
  const now = Date.now()
  const weekStartDate = getThisWeekMonday()
  const today = toLocalDateKey(new Date())

  const planId = await db.studyPlans.add({
    studentId,
    date: today,
    type: 'weekly',
    weekStartDate,
    targetCount,
    createdAt: now,
    updatedAt: now,
  } as Omit<StudyPlan, 'id'>)

  await db.studyTasks.bulkAdd(
    tasks.map((task, index) => ({
      planId: planId as number,
      studentId,
      title: task.title,
      subject: task.subject,
      targetCount: task.targetCount,
      completedCount: 0,
      isCompleted: false,
      order: index,
      createdAt: now,
    })),
  )

  return (await db.studyPlans.get(planId as number))!
}

// ---------------------------------------------------------------------------
// 5. toggleTask — 태스크 완료 토글
// ---------------------------------------------------------------------------

/**
 * 태스크 완료 여부 토글
 * - isCompleted 반전
 * - 완료 시: completedCount를 targetCount로, completedAt을 현재 시간으로 설정
 * - 미완료 시: completedAt 제거
 */
export async function toggleTask(taskId: number): Promise<void> {
  const task = await db.studyTasks.get(taskId)
  if (!task) return

  const newCompleted = !task.isCompleted
  const now = Date.now()

  await db.studyTasks.update(taskId, {
    isCompleted: newCompleted,
    completedCount: newCompleted ? task.targetCount : 0,
    completedAt: newCompleted ? now : undefined,
  })

  // 부모 플랜 updatedAt 갱신
  await db.studyPlans.update(task.planId, { updatedAt: now })
}

// ---------------------------------------------------------------------------
// 6. updateTaskProgress — 태스크 진행 수동 업데이트
// ---------------------------------------------------------------------------

/**
 * 태스크 완료 문제 수 수동 업데이트
 * - completedCount >= targetCount 이면 isCompleted = true, completedAt 설정
 */
export async function updateTaskProgress(
  taskId: number,
  completedCount: number,
): Promise<void> {
  const task = await db.studyTasks.get(taskId)
  if (!task) return

  const now = Date.now()
  const isCompleted = completedCount >= task.targetCount

  await db.studyTasks.update(taskId, {
    completedCount,
    isCompleted,
    completedAt: isCompleted ? now : undefined,
  })

  await db.studyPlans.update(task.planId, { updatedAt: now })
}

// ---------------------------------------------------------------------------
// 7. getPlanProgress — 플랜 전체 진행률 계산
// ---------------------------------------------------------------------------

/**
 * 플랜 전체 진행률 계산
 * - 반환: { total: 태스크 수, completed: 완료된 태스크 수, percent: 진행률(0~100) }
 */
export async function getPlanProgress(planId: number): Promise<{
  total: number
  completed: number
  percent: number
}> {
  const tasks = await db.studyTasks.where('planId').equals(planId).toArray()
  const total = tasks.length
  const completed = tasks.filter((t) => t.isCompleted).length
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0
  return { total, completed, percent }
}

// ---------------------------------------------------------------------------
// 8. getWeeklyScheduleSettings — 주간 설정 읽기
// ---------------------------------------------------------------------------

/**
 * UserSetting에서 주간 스케줄 설정 읽기
 * - 반환: { weeklyGoal, subjectTimeAllocation, notificationEnabled, notificationTime }
 * - 설정 없으면 기본값 반환 (weeklyGoal: 50)
 */
export async function getWeeklyScheduleSettings(userId: string): Promise<{
  weeklyGoal: number
  subjectTimeAllocation: Record<string, number>
  notificationEnabled: boolean
  notificationTime: string
}> {
  const setting = await db.userSettings.where('userId').equals(userId).first()
  return {
    weeklyGoal: setting?.weeklyGoal ?? 50,
    subjectTimeAllocation: setting?.subjectTimeAllocation ?? {},
    notificationEnabled: setting?.notificationEnabled ?? false,
    notificationTime: setting?.notificationTime ?? '20:00',
  }
}

// ---------------------------------------------------------------------------
// 9. saveWeeklyScheduleSettings — 주간 설정 저장 (upsert 패턴)
// ---------------------------------------------------------------------------

/**
 * UserSetting에 주간 스케줄 설정 저장 (upsert)
 * - 기존 설정이 있으면 update, 없으면 add
 */
export async function saveWeeklyScheduleSettings(
  userId: string,
  settings: {
    weeklyGoal?: number
    subjectTimeAllocation?: Record<string, number>
    notificationEnabled?: boolean
    notificationTime?: string
  },
): Promise<void> {
  const existing = await db.userSettings.where('userId').equals(userId).first()

  if (existing) {
    await db.userSettings.update(existing.id, settings)
  } else {
    // 기본 UserSetting 생성 후 플래너 설정 적용
    await db.userSettings.add({
      userId,
      dailyGoal: 10,
      isDiagnosisCompleted: false,
      ...settings,
    } as Omit<import('@/lib/db').UserSetting, 'id'>)
  }
}

// ---------------------------------------------------------------------------
// 10. getPlanTasks — 플랜에 속한 태스크 목록 조회 (order 정렬)
// ---------------------------------------------------------------------------

/**
 * 플랜에 속한 태스크 목록 조회 (order 오름차순)
 */
export async function getPlanTasks(planId: number): Promise<StudyTask[]> {
  return db.studyTasks
    .where('planId')
    .equals(planId)
    .sortBy('order')
}
