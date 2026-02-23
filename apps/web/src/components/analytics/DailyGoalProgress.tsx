/**
 * 일일 학습 목표 진행률 컴포넌트 (PLAN-02)
 *
 * Props:
 *   userId: string  — user email
 *   todayCount: number  — 오늘 풀이 수
 *
 * 내부 상태:
 *   dailyGoal — db.userSettings에서 useLiveQuery로 읽기
 *   isEditing — 편집 모드 토글
 *
 * UI:
 *   - "오늘의 목표: N문제" 헤더 + 편집 버튼 (Pencil 아이콘)
 *   - 진행률 바: (todayCount / dailyGoal) * 100, 최대 100%
 *   - "N / N문제" 텍스트
 *   - 편집 모드: 목표 숫자 Input (5~50, step 5) + 저장 버튼
 */

import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Pencil, Check } from 'lucide-react'
import { db } from '@/lib/db'
import { useFunMode } from '@/hooks/useFunMode'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'

interface DailyGoalProgressProps {
  userId: string
  todayCount: number
}

export default function DailyGoalProgress({ userId, todayCount }: DailyGoalProgressProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState<number>(10)
  const { isFunMode } = useFunMode()

  // db.userSettings에서 dailyGoal 읽기 (실시간 구독)
  const userSetting = useLiveQuery(
    () => db.userSettings.where('userId').equals(userId).first().then(r => r ?? null),
    [userId],
  )

  const dailyGoal = userSetting?.dailyGoal ?? 10
  const progress = Math.min(Math.round((todayCount / dailyGoal) * 100), 100)
  const progressColor = isFunMode
    ? (progress >= 100 ? 'var(--fun-neon-gold)' : 'var(--fun-neon-cyan)')
    : (progress >= 100 ? 'hsl(var(--primary))' : 'hsl(var(--primary) / 0.7)')

  function handleEditStart() {
    setEditValue(dailyGoal)
    setIsEditing(true)
  }

  async function handleSave() {
    const newGoal = Math.max(5, Math.min(50, editValue))
    if (userSetting) {
      // 레코드 있음 — modify
      await db.userSettings.where('userId').equals(userId).modify({ dailyGoal: newGoal })
    } else {
      // 레코드 없음 — add
      await db.userSettings.add({
        userId,
        dailyGoal: newGoal,
        isDiagnosisCompleted: true,
      })
    }
    setIsEditing(false)
  }

  return (
    <Card
      className={isFunMode ? 'border border-cyan-400/30 !bg-black/45 backdrop-blur-xl' : undefined}
      style={isFunMode ? { color: 'var(--fun-text-primary)' } : undefined}
    >
      <CardContent className="p-4">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-3">
          <span
            className="text-sm font-medium"
            style={isFunMode ? { color: 'var(--fun-neon-cyan)' } : undefined}
          >
            오늘의 목표: {dailyGoal}문제
          </span>
          {!isEditing ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handleEditStart}
              aria-label="목표 편집"
              style={isFunMode ? { color: 'var(--fun-text-secondary)' } : undefined}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-primary"
              onClick={handleSave}
              aria-label="목표 저장"
              style={isFunMode ? { color: 'var(--fun-neon-cyan)' } : undefined}
            >
              <Check className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>

        {/* 편집 모드 */}
        {isEditing && (
          <div className="mb-3 flex items-center gap-2">
            <Input
              type="number"
              min={5}
              max={50}
              step={5}
              value={editValue}
              onChange={(e) => setEditValue(Number(e.target.value))}
              className="h-8 w-24 text-sm"
              style={isFunMode ? {
                borderColor: 'rgba(0, 212, 255, 0.3)',
                color: 'var(--fun-text-primary)',
                background: 'rgba(255, 255, 255, 0.04)',
              } : undefined}
            />
            <span
              className="text-sm text-muted-foreground"
              style={isFunMode ? { color: 'var(--fun-text-secondary)' } : undefined}
            >
              문제 (5~50)
            </span>
          </div>
        )}

        {/* 진행률 바 */}
        <div
          className="w-full rounded-full h-3 mb-2 overflow-hidden"
          style={isFunMode ? { background: 'rgba(255, 255, 255, 0.12)' } : undefined}
        >
          <div
            className="h-3 rounded-full transition-all duration-300"
            style={{
              width: `${progress}%`,
              backgroundColor: progressColor,
              boxShadow: isFunMode ? '0 0 10px rgba(0, 212, 255, 0.4)' : undefined,
            }}
          />
        </div>

        {/* 텍스트 */}
        <div className="flex items-center justify-between">
          <span
            className="text-sm text-muted-foreground"
            style={isFunMode ? { color: 'var(--fun-text-secondary)' } : undefined}
          >
            {todayCount} / {dailyGoal}문제
          </span>
          <span
            className="text-xs font-medium"
            style={{
              color: isFunMode
                ? (progress >= 100 ? 'var(--fun-neon-gold)' : 'var(--fun-neon-cyan)')
                : (progress >= 100 ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))'),
            }}
          >
            {progress >= 100 ? '목표 달성!' : `${progress}%`}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
