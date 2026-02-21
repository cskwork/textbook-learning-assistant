/**
 * 미니 캘린더 뷰 컴포넌트 — Phase 13 PLAN-01
 *
 * Props:
 *   selectedDate: string  — 선택된 날짜 (YYYY-MM-DD)
 *   onDateChange: (date: string) => void — 날짜 선택 콜백
 *   markedDates?: Set<string>  — 학습한 날짜 Set (도트 표시)
 *
 * 특징:
 *   - 현재 월 기준 7x5/7x6 그리드
 *   - 이전/다음 월 이동 버튼
 *   - 오늘 날짜 border 강조
 *   - 선택된 날짜 primary 배경
 *   - markedDates 도트 표시
 *   - 현재 월 외 날짜는 흐리게
 */

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PlannerCalendarProps {
  selectedDate: string
  onDateChange: (date: string) => void
  markedDates?: Set<string>
}

/** 로컬 타임존 기준 날짜 키 YYYY-MM-DD 반환 */
function toLocalKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

/** 주어진 연/월의 그리드 날짜 배열 반환 (이전/다음 월 날짜 포함) */
function buildCalendarGrid(year: number, month: number): Date[] {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)

  // 일요일(0) 기준 시작 요일 offset
  const startOffset = firstDay.getDay()
  const grid: Date[] = []

  // 이전 달 날짜 채우기
  for (let i = startOffset - 1; i >= 0; i--) {
    const d = new Date(year, month, -i)
    grid.push(d)
  }

  // 현재 달 날짜
  for (let d = 1; d <= lastDay.getDate(); d++) {
    grid.push(new Date(year, month, d))
  }

  // 다음 달 날짜로 6x7 채우기 (최대 42칸)
  const remaining = 42 - grid.length
  for (let i = 1; i <= remaining; i++) {
    grid.push(new Date(year, month + 1, i))
  }

  return grid
}

const WEEK_DAYS = ['일', '월', '화', '수', '목', '금', '토']
const KOREAN_MONTHS = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']

export function PlannerCalendar({ selectedDate, onDateChange, markedDates }: PlannerCalendarProps) {
  // 뷰 기준 연/월 (selectedDate 초기값)
  const initDate = new Date(selectedDate + 'T00:00:00')
  const [viewYear, setViewYear] = useState(initDate.getFullYear())
  const [viewMonth, setViewMonth] = useState(initDate.getMonth())

  const today = toLocalKey(new Date())
  const grid = buildCalendarGrid(viewYear, viewMonth)

  function goToPrevMonth() {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1)
      setViewMonth(11)
    } else {
      setViewMonth((m) => m - 1)
    }
  }

  function goToNextMonth() {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1)
      setViewMonth(0)
    } else {
      setViewMonth((m) => m + 1)
    }
  }

  function handleDateClick(date: Date) {
    onDateChange(toLocalKey(date))
  }

  return (
    <div className="w-full select-none">
      {/* 월 헤더 */}
      <div className="flex items-center justify-between mb-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={goToPrevMonth}
          aria-label="이전 달"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-semibold text-foreground">
          {viewYear}년 {KOREAN_MONTHS[viewMonth]}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={goToNextMonth}
          aria-label="다음 달"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 mb-1">
        {WEEK_DAYS.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-muted-foreground py-1"
          >
            {day}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div className="grid grid-cols-7 gap-y-1">
        {grid.map((date, idx) => {
          const key = toLocalKey(date)
          const isCurrentMonth = date.getMonth() === viewMonth
          const isSelected = key === selectedDate
          const isToday = key === today
          const isMarked = markedDates?.has(key) ?? false

          return (
            <div key={idx} className="flex flex-col items-center">
              <button
                type="button"
                aria-label={key}
                aria-pressed={isSelected}
                onClick={() => handleDateClick(date)}
                className={[
                  'flex items-center justify-center min-w-[36px] min-h-[36px] rounded-full text-sm transition-colors',
                  isSelected
                    ? 'bg-primary text-primary-foreground font-semibold'
                    : isToday
                      ? 'border-2 border-primary text-foreground font-semibold hover:bg-primary/10'
                      : isCurrentMonth
                        ? 'text-foreground hover:bg-muted'
                        : 'text-muted-foreground/30 hover:bg-muted',
                ].join(' ')}
              >
                {date.getDate()}
              </button>
              {/* 학습 도트 — 선택된 날은 도트 숨김 (배경이 채워지므로) */}
              {isMarked && !isSelected ? (
                <span className="w-1 h-1 rounded-full bg-primary mt-0.5" aria-hidden />
              ) : (
                <span className="w-1 h-1 mt-0.5" aria-hidden />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
