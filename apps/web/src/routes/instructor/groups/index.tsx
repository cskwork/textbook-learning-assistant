/**
 * 강사 반 목록 페이지 (/instructor/groups)
 * useLiveQuery로 그룹 목록 실시간 반응
 */
import { useNavigate } from 'react-router'
import { useLiveQuery } from 'dexie-react-hooks'
import { Plus, Users, ClipboardList } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/AuthContext'
import { db } from '@/lib/db'

export default function GroupListPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const groups = useLiveQuery(
    () => user ? db.groups.where('instructorId').equals(user.email).toArray()
                      .then(arr => arr.sort((a, b) => b.createdAt - a.createdAt)) : [],
    [user?.email],
  )

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">반 관리</h1>
        <Button size="sm" onClick={() => navigate('/instructor/groups/new')}>
          <Plus className="h-4 w-4 mr-1" />
          새 반 만들기
        </Button>
      </div>

      {!groups || groups.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">아직 만든 반이 없습니다.</p>
            <Button variant="outline" size="sm" className="mt-3"
              onClick={() => navigate('/instructor/groups/new')}>
              첫 번째 반 만들기
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {groups.map((group) => (
            <Card key={group.id} className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate(`/instructor/groups/${group.id}`)}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{group.name}</CardTitle>
                  <Badge variant="secondary" className="font-mono text-xs">
                    {group.inviteCode}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    초대 코드: {group.inviteCode}
                  </span>
                  <span className="flex items-center gap-1">
                    <ClipboardList className="h-3 w-3" />
                    {new Date(group.createdAt).toLocaleDateString('ko-KR')} 생성
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
