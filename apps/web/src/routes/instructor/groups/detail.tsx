/**
 * 반 상세 페이지 (/instructor/groups/:id)
 * 멤버 목록 + 과제 목록 + 모의 학생 시드 버튼 + 리포트 링크
 */
import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router'
import { Users, ClipboardList, BarChart2, Trash2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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

  if (!group) return <div className="p-6 text-center text-muted-foreground">로딩 중...</div>

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold">{group.name}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            초대 코드: <span className="font-mono font-semibold">{group.inviteCode}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild size="sm">
            <Link to={`/instructor/groups/${groupId}/report`}>
              <BarChart2 className="h-4 w-4 mr-1" />
              리포트
            </Link>
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* 멤버 목록 */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" />
              학생 ({members.length}명)
            </CardTitle>
            {members.length === 0 && (
              <Button size="sm" variant="outline" onClick={handleSeedMock} disabled={isSeeding}>
                {isSeeding ? '시드 중...' : '모의 학생 추가'}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              학생이 없습니다. 초대 코드를 공유하거나 "모의 학생 추가"를 눌러 테스트하세요.
            </p>
          ) : (
            <ul className="space-y-2">
              {members.map((m) => (
                <li key={m.id} className="flex items-center justify-between text-sm py-1 border-b last:border-0">
                  <span>{getMemberName(m.studentId)}</span>
                  <span className="text-xs text-muted-foreground">{m.studentId}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* 과제 목록 */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              과제 ({assignments.length}개)
            </CardTitle>
            <Button size="sm" asChild>
              <Link to={`/instructor/groups/${groupId}/assign`}>
                <Plus className="h-4 w-4 mr-1" />
                과제 추가
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {assignments.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              아직 배정된 과제가 없습니다.
            </p>
          ) : (
            <ul className="space-y-2">
              {assignments.map((a) => (
                <li key={a.id} className="flex items-center justify-between text-sm py-1 border-b last:border-0">
                  <div>
                    <span className="font-medium">{a.title}</span>
                    {a.dueDate && (
                      <span className="text-xs text-muted-foreground ml-2">
                        마감: {new Date(a.dueDate).toLocaleDateString('ko-KR')}
                      </span>
                    )}
                  </div>
                  <Button variant="ghost" size="sm" className="text-destructive h-7 px-2"
                    onClick={() => handleDeleteAssignment(a.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
