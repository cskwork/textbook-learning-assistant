/**
 * 반 상세 페이지 (/instructor/groups/:id)
 * 멤버 목록 + 과제 목록 + 모의 학생 시드 버튼 + 리포트 링크
 */
import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router'
import { Users, ClipboardList, BarChart2, Trash2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/AuthContext'
import {
  getGroup, listGroupMembers, listAssignments, deleteGroup,
  seedMockStudentData, deleteAssignment, MOCK_STUDENTS,
} from '@/services/group.service'
import type { Group, GroupMember, Assignment } from '@/lib/db'

export default function GroupDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const groupId = Number(id)

  const [group, setGroup] = useState<Group | null>(null)
  const [members, setMembers] = useState<GroupMember[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [isSeeding, setIsSeeding] = useState(false)

  async function loadData() {
    const g = await getGroup(groupId)
    if (!g || g.instructorId !== user?.email) {
      navigate('/instructor/groups')
      return
    }
    setGroup(g)
    setMembers(await listGroupMembers(groupId))
    setAssignments(await listAssignments(groupId))
  }

  useEffect(() => { loadData() }, [groupId])

  async function handleDelete() {
    if (!confirm('반을 삭제하면 멤버와 과제 정보도 함께 삭제됩니다. 계속하시겠습니까?')) return
    await deleteGroup(groupId)
    navigate('/instructor/groups')
  }

  async function handleSeedMock() {
    setIsSeeding(true)
    await seedMockStudentData(groupId)
    await loadData()
    setIsSeeding(false)
  }

  async function handleDeleteAssignment(assignmentId: number) {
    await deleteAssignment(assignmentId)
    setAssignments(await listAssignments(groupId))
  }

  const getMemberName = (email: string) =>
    MOCK_STUDENTS.find(s => s.email === email)?.name ?? email

  if (!group) {
    return (
      <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto">
        <div className="h-8 w-48 bg-muted rounded-xl animate-pulse mb-4" />
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          <div className="lg:col-span-3 h-64 bg-muted/40 rounded-2xl animate-pulse" />
          <div className="lg:col-span-2 h-64 bg-muted/40 rounded-2xl animate-pulse" />
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto space-y-5">
      {/* 헤더 */}
      <div className="flex items-start justify-between gap-4 animate-fade-up stagger-1">
        <div>
          <h1 className="text-[1.65rem] font-extrabold tracking-tight text-foreground">{group.name}</h1>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-sm text-muted-foreground">초대 코드:</span>
            <Badge variant="secondary" className="font-mono text-sm tracking-widest rounded-lg px-3 py-0.5">
              {group.inviteCode}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button asChild className="rounded-xl font-semibold h-9 px-4">
            <Link to={`/instructor/groups/${groupId}/report`}>
              <BarChart2 className="h-4 w-4" />
              리포트
            </Link>
          </Button>
          <Button variant="outline" size="icon" className="rounded-xl h-9 w-9 text-destructive hover:bg-destructive/8 hover:text-destructive border-destructive/20" onClick={handleDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* 멤버 + 과제: 데스크톱 2컬럼 */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-5">

        {/* 멤버 목록 — lg 3/5 */}
        <div className="lg:col-span-3 animate-fade-up stagger-2">
          <Card className="rounded-2xl border-none shadow-sm bg-white dark:bg-card h-full flex flex-col">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-500/20 flex items-center justify-center">
                    <Users className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  </div>
                  학생 ({members.length}명)
                </CardTitle>
                {members.length === 0 && (
                  <Button size="sm" variant="outline" className="rounded-xl text-xs h-7" onClick={handleSeedMock} disabled={isSeeding}>
                    {isSeeding ? '시드 중...' : '모의 학생 추가'}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              {members.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-muted/60 flex items-center justify-center mb-3">
                    <Users className="w-6 h-6 text-muted-foreground/40" />
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    학생이 없습니다.<br />초대 코드를 공유하거나 "모의 학생 추가"로 테스트하세요.
                  </p>
                </div>
              ) : (
                <ul className="space-y-1">
                  {members.map((m) => (
                    <li key={m.id} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-muted/40 transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-primary/8 flex items-center justify-center shrink-0 text-xs font-bold text-primary">
                          {getMemberName(m.studentId).charAt(0)}
                        </div>
                        <span className="font-semibold text-sm truncate">{getMemberName(m.studentId)}</span>
                      </div>
                      <span className="text-[11px] text-muted-foreground/60 font-mono shrink-0">{m.studentId}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 과제 목록 — lg 2/5 */}
        <div className="lg:col-span-2 animate-fade-up stagger-3">
          <Card className="rounded-2xl border-none shadow-sm bg-white dark:bg-card h-full flex flex-col">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-emerald-50 dark:bg-emerald-500/20 flex items-center justify-center">
                    <ClipboardList className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  과제 ({assignments.length}개)
                </CardTitle>
                <Button size="sm" className="rounded-xl text-xs h-7 px-3 font-semibold" asChild>
                  <Link to={`/instructor/groups/${groupId}/assign`}>
                    <Plus className="h-3.5 w-3.5" />
                    추가
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              {assignments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-muted/60 flex items-center justify-center mb-3">
                    <ClipboardList className="w-6 h-6 text-muted-foreground/40" />
                  </div>
                  <p className="text-xs text-muted-foreground">아직 배정된 과제가 없습니다.</p>
                </div>
              ) : (
                <ul className="space-y-1">
                  {assignments.map((a) => (
                    <li key={a.id} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-muted/40 transition-colors group/item">
                      <div className="min-w-0">
                        <span className="font-semibold text-sm block truncate">{a.title}</span>
                        {a.dueDate && (
                          <span className="text-[11px] text-muted-foreground">
                            마감: {new Date(a.dueDate).toLocaleDateString('ko-KR')}
                          </span>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-lg text-muted-foreground/40 hover:text-destructive hover:bg-destructive/8 opacity-0 group-hover/item:opacity-100 transition-all shrink-0"
                        onClick={(e) => { e.stopPropagation(); handleDeleteAssignment(a.id) }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
