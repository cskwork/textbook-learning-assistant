/**
 * 과제 배정 페이지 (/instructor/groups/:id/assign)
 * 강사 자신의 문제집 목록에서 선택 → 그룹에 배정
 */
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAuth } from '@/contexts/AuthContext'
import { assignWorkbook, getGroup } from '@/services/group.service'
import { listWorkbooks } from '@/services/workbook.service'
import type { Workbook, Group } from '@/lib/db'

export default function AssignWorkbookPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const groupId = Number(id)

  const [group, setGroup] = useState<Group | null>(null)
  const [workbooks, setWorkbooks] = useState<Workbook[]>([])
  const [selectedWorkbookId, setSelectedWorkbookId] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!user) return
    ;(async () => {
      const g = await getGroup(groupId)
      if (!g || g.instructorId !== user.email) {
        navigate('/instructor/groups')
        return
      }
      setGroup(g)
      // 강사 자신이 만든 문제집만 조회 (user.email = 문제집의 studentId)
      setWorkbooks(await listWorkbooks(user.email))
    })()
  }, [groupId, user])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedWorkbookId) return
    setIsSubmitting(true)
    try {
      const wb = workbooks.find(w => String(w.id) === selectedWorkbookId)
      if (!wb) return
      await assignWorkbook({
        groupId,
        workbookId: wb.id,
        title: wb.title,
      })
      navigate(`/instructor/groups/${groupId}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!group) return <div className="p-6 text-center text-muted-foreground">로딩 중...</div>

  return (
    <div className="p-4 md:p-6 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-1">과제 배정</h1>
      <p className="text-sm text-muted-foreground mb-4">{group.name}</p>

      {workbooks.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            <CardHeader>
              <CardTitle className="text-sm">문제집이 없습니다</CardTitle>
            </CardHeader>
            <p className="text-xs">
              과제를 배정하려면 먼저 문제집을 만들어야 합니다.
              학생용 문제집 생성 페이지를 이용하거나,
              강사 계정으로 문제집을 직접 만드세요.
            </p>
            <Button variant="outline" size="sm" className="mt-3"
              onClick={() => navigate('/student/workbooks/create')}>
              문제집 만들기
            </Button>
          </CardContent>
        </Card>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label>문제집 선택</Label>
            <Select value={selectedWorkbookId} onValueChange={setSelectedWorkbookId}>
              <SelectTrigger>
                <SelectValue placeholder="과제로 배정할 문제집을 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {workbooks.map((wb) => (
                  <SelectItem key={wb.id} value={String(wb.id)}>
                    {wb.title} ({wb.questionIds.length}문제)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting || !selectedWorkbookId}>
              {isSubmitting ? '배정 중...' : '과제 배정'}
            </Button>
            <Button type="button" variant="outline"
              onClick={() => navigate(`/instructor/groups/${groupId}`)}>
              취소
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
