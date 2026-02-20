/**
 * 과제 배정 페이지 (/instructor/groups/:id/assign)
 */
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import { ClipboardList } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
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

  if (!group) {
    return (
      <div className="p-4 md:p-6 lg:p-8 max-w-lg mx-auto flex flex-col justify-center min-h-[60vh]">
        <div className="h-8 w-40 bg-muted rounded-xl animate-pulse mb-4" />
        <div className="h-32 bg-muted/40 rounded-2xl animate-pulse" />
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-lg mx-auto flex flex-col justify-center min-h-[60vh]">
      <div className="animate-fade-up stagger-1">
        <h1 className="text-[1.65rem] font-extrabold tracking-tight text-foreground mb-1">과제 배정</h1>
        <p className="text-sm text-muted-foreground mb-6">{group.name}</p>

        {workbooks.length === 0 ? (
          <Card className="rounded-2xl border-none shadow-sm bg-white dark:bg-card">
            <CardContent className="p-8 text-center">
              <div className="w-14 h-14 rounded-2xl bg-muted/60 flex items-center justify-center mx-auto mb-4">
                <ClipboardList className="w-7 h-7 text-muted-foreground/40" />
              </div>
              <p className="text-sm font-bold text-foreground mb-1">문제집이 없습니다</p>
              <p className="text-xs text-muted-foreground mb-4">
                과제를 배정하려면 먼저 문제집을 만들어야 합니다.
              </p>
              <Button variant="outline" className="rounded-xl font-semibold"
                onClick={() => navigate('/student/workbooks/create')}>
                문제집 만들기
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="rounded-2xl border-none shadow-sm bg-white dark:bg-card">
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">문제집 선택</Label>
                  <Select value={selectedWorkbookId} onValueChange={setSelectedWorkbookId}>
                    <SelectTrigger className="h-11 rounded-xl bg-muted/40 border-transparent focus:border-primary/30">
                      <SelectValue placeholder="과제로 배정할 문제집을 선택하세요" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {workbooks.map((wb) => (
                        <SelectItem key={wb.id} value={String(wb.id)} className="rounded-lg">
                          {wb.title} ({wb.questionIds.length}문제)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2 pt-1">
                  <Button type="submit" className="rounded-xl font-semibold flex-1" disabled={isSubmitting || !selectedWorkbookId}>
                    {isSubmitting ? '배정 중...' : '과제 배정'}
                  </Button>
                  <Button type="button" variant="outline" className="rounded-xl"
                    onClick={() => navigate(`/instructor/groups/${groupId}`)}>
                    취소
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
