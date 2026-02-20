// apps/web/src/components/wrong-notes/WrongNoteFilter.tsx
// 오답노트 단원/유형 필터 드롭다운 컴포넌트
import { useEffect, useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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

  function handleUnitChange(value: string) {
    onFilterUnit(value === '__all__' ? undefined : value)
  }

  function handleCategoryChange(value: string) {
    onFilterCategory(value === '__all__' ? undefined : value)
  }

  return (
    <div className="flex flex-wrap gap-3">
      {/* 단원 필터 */}
      <Select
        value={filterUnit ?? '__all__'}
        onValueChange={handleUnitChange}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="단원 선택" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">전체 단원</SelectItem>
          {units.map((unit) => (
            <SelectItem key={unit} value={unit}>
              {unit}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* 유형 필터 */}
      <Select
        value={filterCategory ?? '__all__'}
        onValueChange={handleCategoryChange}
      >
        <SelectTrigger className="w-44">
          <SelectValue placeholder="유형 선택" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">전체 유형</SelectItem>
          {categories.map((cat) => (
            <SelectItem key={cat} value={cat}>
              {cat}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
