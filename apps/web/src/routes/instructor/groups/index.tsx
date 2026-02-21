/**
 * 강사 반 목록 페이지 (/instructor/groups)
 */
import { useNavigate } from 'react-router'
import { useLiveQuery } from 'dexie-react-hooks'
import { Plus, Users, ChevronRight, CalendarDays } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/AuthContext'
import { db } from '@/lib/db'
import { AnimatedCard } from '@/components/motion/AnimatedCard'
import { FadeIn } from '@/components/motion/FadeIn'

export default function GroupListPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const groups = useLiveQuery(
    () => user ? db.groups.where('instructorId').equals(user.email).toArray()
                      .then(arr => arr.sort((a, b) => b.createdAt - a.createdAt)) : [],
    [user?.email],
  )

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto space-y-5">
      {/* 헤더 */}
      <FadeIn delay={0}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[1.65rem] font-extrabold tracking-tight text-foreground">반 관리</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {groups ? `${groups.length}개의 반을 관리하고 있어요` : '로딩 중...'}
            </p>
          </div>
          <Button className="rounded-xl shadow-sm font-semibold h-9 px-4" onClick={() => navigate('/instructor/groups/new')}>
            <Plus className="h-4 w-4" />
            새 반 만들기
          </Button>
        </div>
      </FadeIn>

      {!groups || groups.length === 0 ? (
        <FadeIn delay={0.05}>
          <Card className="rounded-2xl border-none shadow-sm bg-white dark:bg-card">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-muted/60 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-muted-foreground/40" />
              </div>
              <p className="text-sm font-bold text-foreground mb-1">아직 만든 반이 없습니다</p>
              <p className="text-xs text-muted-foreground mb-4">첫 번째 반을 만들어 학생들을 초대해 보세요.</p>
              <Button className="rounded-xl font-semibold" onClick={() => navigate('/instructor/groups/new')}>
                <Plus className="h-4 w-4" />
                첫 번째 반 만들기
              </Button>
            </CardContent>
          </Card>
        </FadeIn>
      ) : (
        <FadeIn delay={0.05}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups.map((group, idx) => (
              <FadeIn key={group.id} delay={0.05 * (idx + 1)}>
                <AnimatedCard
                  className="border border-border/50 shadow-sm hover:shadow-md hover:border-border bg-white/80 dark:bg-card/60 backdrop-blur-sm overflow-hidden cursor-pointer"
                  onClick={() => navigate(`/instructor/groups/${group.id}`)}
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <Users className="w-5 h-5 text-primary" />
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground/30" />
                    </div>
                    <h3 className="text-base font-bold text-foreground mb-2 truncate">{group.name}</h3>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <Badge variant="secondary" className="font-mono text-[11px] rounded-md px-2 py-0.5">
                        {group.inviteCode}
                      </Badge>
                      <span className="flex items-center gap-1">
                        <CalendarDays className="h-3 w-3" />
                        {new Date(group.createdAt).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                  </div>
                </AnimatedCard>
              </FadeIn>
            ))}
          </div>
        </FadeIn>
      )}
    </div>
  )
}
