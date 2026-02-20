/**
 * 강사 홈 페이지 — Phase 7 업데이트
 * 실제 그룹/문제 데이터를 표시하고 반 관리로 진입한다
 */

import { useLiveQuery } from 'dexie-react-hooks'
import { Users, BookOpen, BarChart2, PlusCircle, ClipboardList } from 'lucide-react'
import { Link } from 'react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { db } from '@/lib/db'

export default function InstructorHomePage() {
  const { user } = useAuth()

  // 그룹 수 실시간 쿼리
  const groupCount = useLiveQuery(
    () => user ? db.groups.where('instructorId').equals(user.email).count() : 0,
    [user?.email],
  )

  // 출제한 문제 수
  const problemCount = useLiveQuery(
    () => user ? db.questions.where('createdBy').equals(user.email).count() : 0,
    [user?.email],
  )

  // 최근 그룹 목록 (최대 3개)
  const recentGroups = useLiveQuery(
    () => user
      ? db.groups.where('instructorId').equals(user.email).toArray()
          .then(arr => arr.sort((a, b) => b.createdAt - a.createdAt).slice(0, 3))
      : [],
    [user?.email],
  )

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      {/* 환영 메시지 */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">강사 대시보드</h1>
          <p className="text-muted-foreground mt-1">
            {user?.email} 님, 오늘도 좋은 하루 되세요.
          </p>
        </div>
        <Button className="shrink-0" asChild>
          <Link to="/instructor/problems/new">
            <PlusCircle className="w-4 h-4 mr-2" />
            문제 출제
          </Link>
        </Button>
      </div>

      {/* 요약 통계 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
        <Card className="rounded-2xl border-none shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 bg-white/60 dark:bg-card/40 backdrop-blur-xl">
          <CardContent className="p-5 flex flex-col items-center justify-center text-center h-full">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-3">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div className="text-3xl font-bold tracking-tight mb-1">{groupCount ?? 0}</div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">관리 중인 반</span>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-none shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 bg-white/60 dark:bg-card/40 backdrop-blur-xl">
          <CardContent className="p-5 flex flex-col items-center justify-center text-center h-full">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-3">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <div className="text-3xl font-bold tracking-tight mb-1">{problemCount ?? 0}</div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">출제한 문제</span>
          </CardContent>
        </Card>

        <Card className="col-span-2 md:col-span-1 rounded-2xl border-none shadow-sm hover:shadow-md transition-all duration-300 bg-white/60 dark:bg-card/40 backdrop-blur-xl flex flex-col justify-center">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4 justify-center md:justify-start">
              <BarChart2 className="w-5 h-5 text-primary" />
              <span className="text-sm font-semibold text-foreground">빠른 이동</span>
            </div>
            <Button size="sm" variant="outline" className="w-full rounded-xl hover:bg-primary/5 hover:text-primary transition-colors" asChild>
              <Link to="/instructor/groups">반 관리</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* 최근 반 섹션 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <ClipboardList className="w-4 h-4" />
              최근 반
            </CardTitle>
            <Button size="sm" variant="ghost" asChild>
              <Link to="/instructor/groups">전체 보기</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!recentGroups || recentGroups.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <p className="text-sm">아직 만든 반이 없습니다.</p>
              <Button size="sm" variant="outline" className="mt-3" asChild>
                <Link to="/instructor/groups/new">첫 번째 반 만들기</Link>
              </Button>
            </div>
          ) : (
            <ul className="space-y-2">
              {recentGroups.map((g) => (
                <li key={g.id}>
                  <Link
                    to={`/instructor/groups/${g.id}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
                  >
                    <span className="font-medium text-sm">{g.name}</span>
                    <span className="text-xs text-muted-foreground font-mono">{g.inviteCode}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
