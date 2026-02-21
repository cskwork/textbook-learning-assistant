/**
 * 주간 설정 카드 컴포넌트 — Phase 13 PLAN-03
 *
 * Props:
 *   userId: string  — user email
 *
 * 특징:
 *   - useLiveQuery로 UserSetting에서 weeklyGoal + subjectTimeAllocation 읽기
 *   - 주간 목표 문제 수: Input type=number (10~200, step=10)
 *   - 과목별 시간 배분: 5과목 Input type=number (0~100%)
 *     - 5개 합계가 100%가 되도록 마지막 과목 자동 계산
 *   - 저장 버튼: saveWeeklyScheduleSettings 호출
 */

import { useState, useEffect } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Save } from 'lucide-react'
import { db } from '@/lib/db'
import { saveWeeklyScheduleSettings } from '@/services/planner.service'
import { AnimatedCard } from '@/components/motion/AnimatedCard'
import { FadeIn } from '@/components/motion/FadeIn'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CardHeader, CardTitle, CardContent } from '@/components/ui/card'

/** 지원하는 과목 목록 */
const SUBJECTS = ['수학I', '수학II', '미적분', '확률과통계', '기하'] as const
type Subject = (typeof SUBJECTS)[number]

interface WeeklySettingsCardProps {
  userId: string
}

export function WeeklySettingsCard({ userId }: WeeklySettingsCardProps) {
  const userSetting = useLiveQuery(
    () => db.userSettings.where('userId').equals(userId).first().then((r) => r ?? null),
    [userId],
  )

  const [weeklyGoal, setWeeklyGoal] = useState(50)
  const [allocation, setAllocation] = useState<Record<Subject, number>>({
    수학I: 20,
    수학II: 20,
    미적분: 20,
    확률과통계: 20,
    기하: 20,
  })
  const [isSaving, setIsSaving] = useState(false)
  const [savedMsg, setSavedMsg] = useState(false)

  // DB 설정 로드 시 로컬 state 동기화
  useEffect(() => {
    if (!userSetting) return
    if (userSetting.weeklyGoal !== undefined) {
      setWeeklyGoal(userSetting.weeklyGoal)
    }
    if (userSetting.subjectTimeAllocation) {
      setAllocation((prev) => ({
        ...prev,
        ...(userSetting.subjectTimeAllocation as Record<Subject, number>),
      }))
    }
  }, [userSetting])

  /** 과목별 배분 변경 — 마지막 과목 자동 계산 */
  function handleAllocationChange(subject: Subject, value: number) {
    const clamped = Math.max(0, Math.min(100, value))
    const newAlloc = { ...allocation, [subject]: clamped }

    // 마지막 과목('기하') 자동 계산: 나머지 4과목 합의 보수
    const lastSubject: Subject = '기하'
    if (subject !== lastSubject) {
      const othersSum = SUBJECTS.filter((s) => s !== lastSubject && s !== subject).reduce(
        (sum, s) => sum + (newAlloc[s] ?? 0),
        0,
      )
      const autoLast = Math.max(0, 100 - othersSum - clamped)
      newAlloc[lastSubject] = autoLast
    }

    setAllocation(newAlloc)
  }

  // 합계 계산 (유효성 표시용)
  const totalAlloc = SUBJECTS.reduce((sum, s) => sum + (allocation[s] ?? 0), 0)

  async function handleSave() {
    setIsSaving(true)
    try {
      await saveWeeklyScheduleSettings(userId, {
        weeklyGoal: Math.max(10, Math.min(200, weeklyGoal)),
        subjectTimeAllocation: allocation,
      })
      setSavedMsg(true)
      setTimeout(() => setSavedMsg(false), 2000)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <FadeIn delay={0.15}>
      <AnimatedCard className="h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">주간 목표 설정</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 주간 목표 문제 수 */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-muted-foreground whitespace-nowrap w-24 shrink-0">
              주간 목표 문제
            </label>
            <Input
              type="number"
              min={10}
              max={200}
              step={10}
              value={weeklyGoal}
              onChange={(e) => setWeeklyGoal(Number(e.target.value))}
              className="h-8 w-20 text-sm"
            />
            <span className="text-xs text-muted-foreground">문제 (10~200)</span>
          </div>

          {/* 과목별 시간 배분 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-muted-foreground">과목별 시간 배분</p>
              <span
                className={[
                  'text-xs font-medium',
                  totalAlloc === 100 ? 'text-primary' : 'text-destructive',
                ].join(' ')}
              >
                합계: {totalAlloc}%
              </span>
            </div>
            <div className="space-y-2">
              {SUBJECTS.map((subject, idx) => {
                const isLast = idx === SUBJECTS.length - 1
                return (
                  <div key={subject} className="flex items-center gap-2">
                    <span className="text-xs text-foreground w-20 shrink-0">{subject}</span>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={allocation[subject] ?? 0}
                      onChange={(e) => handleAllocationChange(subject, Number(e.target.value))}
                      className="h-7 w-16 text-xs"
                      readOnly={isLast}
                      aria-label={`${subject} 시간 배분`}
                    />
                    <span className="text-xs text-muted-foreground">%{isLast ? ' (자동)' : ''}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* 저장 버튼 */}
          <Button
            size="sm"
            className="w-full h-8 text-xs gap-1.5"
            onClick={handleSave}
            disabled={isSaving || totalAlloc !== 100}
          >
            <Save className="h-3.5 w-3.5" />
            {isSaving ? '저장 중...' : savedMsg ? '저장됨!' : '설정 저장'}
          </Button>
        </CardContent>
      </AnimatedCard>
    </FadeIn>
  )
}
