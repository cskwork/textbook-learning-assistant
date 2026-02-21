/**
 * 할 일 체크리스트 컴포넌트 — Phase 13 PLAN-01
 *
 * Props:
 *   tasks: StudyTask[]  — 태스크 목록
 *   onToggle: (taskId: number) => void  — 체크/언체크 콜백
 *   onAddTask: (title: string, subject?: string, targetCount?: number) => void  — 태스크 추가 콜백
 *
 * 특징:
 *   - 체크박스 토글로 완료 처리 + line-through 스타일
 *   - 과목 Badge, 진행(N/N) 미니 프로그레스
 *   - 할 일 추가 인풋 + 버튼
 *   - 빈 상태 안내
 */

import { useState, type KeyboardEvent } from 'react'
import { CalendarPlus, X } from 'lucide-react'
import type { StudyTask } from '@/lib/db'
import { AnimatedCard } from '@/components/motion/AnimatedCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

interface TaskChecklistProps {
  tasks: StudyTask[]
  onToggle: (taskId: number) => void
  onAddTask: (title: string, subject?: string, targetCount?: number) => void
}

export function TaskChecklist({ tasks, onToggle, onAddTask }: TaskChecklistProps) {
  const [newTitle, setNewTitle] = useState('')

  function handleAdd() {
    const trimmed = newTitle.trim()
    if (!trimmed) return
    onAddTask(trimmed)
    setNewTitle('')
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') handleAdd()
  }

  // 진행률 계산 (0~100)
  function getProgress(task: StudyTask): number {
    if (task.targetCount <= 0) return task.isCompleted ? 100 : 0
    return Math.min(Math.round((task.completedCount / task.targetCount) * 100), 100)
  }

  return (
    <div className="flex flex-col gap-2">
      {/* 빈 상태 */}
      {tasks.length === 0 && (
        <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground gap-2">
          <CalendarPlus className="h-10 w-10 opacity-40" />
          <p className="text-sm">오늘의 학습 계획을 추가해보세요!</p>
        </div>
      )}

      {/* 태스크 목록 */}
      {tasks.map((task) => {
        const progress = getProgress(task)
        return (
          <AnimatedCard
            key={task.id}
            className="px-3 py-2.5"
          >
            <div className="flex items-center gap-2">
              {/* 체크박스 */}
              <button
                type="button"
                role="checkbox"
                aria-checked={task.isCompleted}
                aria-label={task.isCompleted ? '완료 취소' : '완료'}
                onClick={() => onToggle(task.id)}
                className={[
                  'flex-shrink-0 w-5 h-5 rounded border-2 transition-colors flex items-center justify-center',
                  task.isCompleted
                    ? 'bg-primary border-primary'
                    : 'border-muted-foreground/40 hover:border-primary',
                ].join(' ')}
              >
                {task.isCompleted && (
                  <svg
                    className="w-3 h-3 text-primary-foreground"
                    viewBox="0 0 12 12"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <path d="M2 6l3 3 5-5" />
                  </svg>
                )}
              </button>

              {/* 제목 + 과목 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span
                    className={[
                      'text-sm font-medium truncate',
                      task.isCompleted ? 'line-through text-muted-foreground' : 'text-foreground',
                    ].join(' ')}
                  >
                    {task.title}
                  </span>
                  {task.subject && (
                    <Badge variant="secondary" className="text-xs px-1.5 py-0 h-5">
                      {task.subject}
                    </Badge>
                  )}
                </div>

                {/* 진행률 바 (targetCount > 0) */}
                {task.targetCount > 0 && (
                  <div className="flex items-center gap-1.5 mt-1">
                    <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-1 rounded-full bg-primary transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {task.completedCount}/{task.targetCount}
                    </span>
                  </div>
                )}
              </div>

              {/* 삭제 버튼 자리 (현재는 토글만, 삭제는 향후 확장) */}
              <button
                type="button"
                aria-label="태스크 삭제"
                className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-colors"
                onClick={() => {
                  // 삭제 기능은 planner service에 없으므로 완료 토글로 대체
                  // 향후 확장 시 deleteTask(task.id) 호출
                }}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </AnimatedCard>
        )
      })}

      {/* 할 일 추가 */}
      <div className="flex gap-2 mt-1">
        <Input
          type="text"
          placeholder="할 일 추가..."
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 h-9 text-sm"
        />
        <Button
          type="button"
          size="sm"
          onClick={handleAdd}
          disabled={!newTitle.trim()}
          className="h-9 px-3"
        >
          추가
        </Button>
      </div>
    </div>
  )
}
