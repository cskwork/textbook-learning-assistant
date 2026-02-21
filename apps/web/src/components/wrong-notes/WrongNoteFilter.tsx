// apps/web/src/components/wrong-notes/WrongNoteFilter.tsx
// 오답노트 단원/유형 필터 — 칩 버튼 토글 방식
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { getWrongNoteUnits, getWrongNoteCategories } from '@/services/wrongNote.service'

interface WrongNoteFilterProps {
  studentId: string
  filterUnit: string | undefined
  filterCategory: string | undefined
  onFilterUnit: (unit: string | undefined) => void
  onFilterCategory: (category: string | undefined) => void
}

export function WrongNoteFilter({
  studentId,
  filterUnit,
  filterCategory,
  onFilterUnit,
  onFilterCategory,
}: WrongNoteFilterProps) {
  const [units, setUnits] = useState<string[]>([])
  const [categories, setCategories] = useState<string[]>([])

  useEffect(() => {
    if (!studentId) return
    getWrongNoteUnits(studentId).then(setUnits)
    getWrongNoteCategories(studentId).then(setCategories)
  }, [studentId])

  // 칩 버튼 공통 스타일
  const chipBase =
    'px-3 py-1.5 rounded-full text-sm font-medium border border-border/60 bg-white dark:bg-card text-muted-foreground hover:bg-muted/50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/30'
  const chipActive =
    'bg-primary/10 text-primary border-primary/30 font-semibold hover:bg-primary/15'

  return (
    <div className="space-y-3">
      {/* 단원 필터 그룹 */}
      {units.length > 0 && (
        <div className="space-y-1.5">
          <span className="text-xs text-muted-foreground font-medium">단원</span>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onFilterUnit(undefined)}
              className={cn(chipBase, !filterUnit && chipActive)}
            >
              전체
            </button>
            {units.map((unit) => (
              <button
                key={unit}
                type="button"
                onClick={() => onFilterUnit(unit === filterUnit ? undefined : unit)}
                className={cn(chipBase, filterUnit === unit && chipActive)}
              >
                {unit}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 유형 필터 그룹 */}
      {categories.length > 0 && (
        <div className="space-y-1.5">
          <span className="text-xs text-muted-foreground font-medium">유형</span>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onFilterCategory(undefined)}
              className={cn(chipBase, !filterCategory && chipActive)}
            >
              전체
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => onFilterCategory(cat === filterCategory ? undefined : cat)}
                className={cn(chipBase, filterCategory === cat && chipActive)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
