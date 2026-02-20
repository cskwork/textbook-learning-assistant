/**
 * 강사 홈 대시보드
 *
 * 디자인: Editorial Learning —
 *   시간대별 인사, 개별 컬러 통계 카드,
 *   최근 반 리스트 개선, staggered 애니메이션
 */

import { useLiveQuery } from 'dexie-react-hooks'
import {
  Users, BookOpen, PlusCircle, ClipboardList,
  ArrowRight, ChevronRight, Layers,
} from 'lucide-react'
import { Link } from 'react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { db } from '@/lib/db'

function getGreeting(): { text: string; emoji: string } {
  const h = new Date().getHours()
  if (h < 6) return { text: '늦은 밤까지 수고하세요', emoji: '🌙' }
  if (h < 12) return { text: '좋은 아침이에요', emoji: '☀️' }
  if (h < 18) return { text: '좋은 오후예요', emoji: '📋' }
  return { text: '좋은 저녁이에요', emoji: '🌆' }
}

export default function InstructorHomePage() {
  const { user } = useAuth()
  const greeting = getGreeting()

  const groupCount = useLiveQuery(
    () => user ? db.groups.where('instructorId').equals(user.email).count() : 0,
    [user?.email],
  )

  const problemCount = useLiveQuery(
    () => user ? db.questions.where('createdBy').equals(user.email).count() : 0,
    [user?.email],
  )

  const recentGroups = useLiveQuery(
    () => user
      ? db.groups.where('instructorId').equals(user.email).toArray()
          .then(arr => arr.sort((a, b) => b.createdAt - a.createdAt).slice(0, 3))
      : [],
    [user?.email],
  )

  const userName = user?.email?.split('@')[0] ?? '선생님'

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto space-y-5">

      {/* ────────── 인사 + 문제 출제 CTA ────────── */}
      <div className="flex items-start justify-between gap-4 animate-fade-up stagger-1">
        <div>
          <p className="text-sm font-medium text-muted-foreground tracking-wide">
            {greeting.emoji} {greeting.text}
          </p>
          <h1 className="text-[1.65rem] font-extrabold tracking-tight text-foreground mt-0.5 leading-tight">
            {userName}님의 대시보드
          </h1>
        </div>
        <Button
          className="shrink-0 rounded-xl shadow-sm font-semibold h-9 px-4"
          asChild
        >
          <Link to="/instructor/problems/new">
            <PlusCircle className="w-4 h-4" />
            문제 출제
          </Link>
        </Button>
      </div>

      {/* ────────── 통계 + 최근 반: 데스크톱 2컬럼 ────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-5">

        {/* 좌측: 통계 카드 — lg에서 2/5 */}
        <div className="lg:col-span-2 space-y-3 md:space-y-4">
          {/* 관리 중인 반 */}
          <div className="stat-accent-blue animate-scale-in stagger-2">
            <Card className="rounded-2xl border-none shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 overflow-hidden relative group bg-white dark:bg-card">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[var(--stat-bg)]" />
              <CardContent className="p-4 md:p-5 relative">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: 'var(--stat-bg-strong)' }}
                >
                  <Users className="w-[18px] h-[18px]" style={{ color: 'var(--stat-color)' }} />
                </div>
                <div className="animate-count-up">
                  <span
                    className="text-[1.75rem] font-black tracking-tight leading-none"
                    style={{ color: 'var(--stat-color)' }}
                  >
                    {groupCount ?? 0}
                  </span>
                  <span className="text-xs font-semibold text-muted-foreground ml-0.5">개</span>
                </div>
                <p className="text-[11px] font-medium text-muted-foreground mt-1.5 tracking-wide">관리 중인 반</p>
              </CardContent>
            </Card>
          </div>

          {/* 출제한 문제 */}
          <div className="stat-accent-emerald animate-scale-in stagger-3">
            <Card className="rounded-2xl border-none shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 overflow-hidden relative group bg-white dark:bg-card">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[var(--stat-bg)]" />
              <CardContent className="p-4 md:p-5 relative">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: 'var(--stat-bg-strong)' }}
                >
                  <BookOpen className="w-[18px] h-[18px]" style={{ color: 'var(--stat-color)' }} />
                </div>
                <div className="animate-count-up">
                  <span
                    className="text-[1.75rem] font-black tracking-tight leading-none"
                    style={{ color: 'var(--stat-color)' }}
                  >
                    {problemCount ?? 0}
                  </span>
                  <span className="text-xs font-semibold text-muted-foreground ml-0.5">문제</span>
                </div>
                <p className="text-[11px] font-medium text-muted-foreground mt-1.5 tracking-wide">출제한 문제</p>
              </CardContent>
            </Card>
          </div>

          {/* 빠른 이동 */}
          <div className="stat-accent-violet animate-scale-in stagger-4">
            <Card className="rounded-2xl border-none shadow-sm hover:shadow-lg transition-all duration-300 bg-white dark:bg-card overflow-hidden relative group">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[var(--stat-bg)]" />
              <CardContent className="p-4 md:p-5 relative">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: 'var(--stat-bg-strong)' }}
                >
                  <Layers className="w-[18px] h-[18px]" style={{ color: 'var(--stat-color)' }} />
                </div>
                <p className="text-sm font-bold text-foreground mb-3">빠른 이동</p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-xl hover:bg-[var(--stat-bg)] hover:text-[var(--stat-color)] hover:border-transparent transition-colors text-xs h-8"
                    asChild
                  >
                    <Link to="/instructor/groups">반 관리</Link>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-xl hover:bg-[var(--stat-bg)] hover:text-[var(--stat-color)] hover:border-transparent transition-colors text-xs h-8"
                    asChild
                  >
                    <Link to="/instructor/problems">문제 관리</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 우측: 최근 반 — lg에서 3/5 */}
        <div className="lg:col-span-3 animate-fade-up stagger-5">
          <Card className="rounded-2xl border-none shadow-sm bg-white dark:bg-card overflow-hidden h-full flex flex-col">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-500/20 flex items-center justify-center">
                  <ClipboardList className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                </div>
                최근 반
              </CardTitle>
              <Button size="sm" variant="ghost" className="text-xs font-semibold text-primary h-7 px-2 rounded-lg" asChild>
                <Link to="/instructor/groups">
                  전체 보기
                  <ArrowRight className="w-3 h-3 ml-0.5" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pb-4">
            {!recentGroups || recentGroups.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-muted/60 flex items-center justify-center">
                  <Users className="w-7 h-7 text-muted-foreground/50" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">아직 만든 반이 없습니다</p>
                  <p className="text-xs text-muted-foreground mt-1">첫 번째 반을 만들어 학생들을 초대해 보세요.</p>
                </div>
                <Button size="sm" className="rounded-xl font-semibold mt-1" asChild>
                  <Link to="/instructor/groups/new">
                    <PlusCircle className="w-3.5 h-3.5" />
                    첫 번째 반 만들기
                  </Link>
                </Button>
              </div>
            ) : (
              <ul className="space-y-1">
                {recentGroups.map((g) => (
                  <li key={g.id}>
                    <Link
                      to={`/instructor/groups/${g.id}`}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors group/item"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-primary/8 flex items-center justify-center shrink-0">
                          <Users className="w-4 h-4 text-primary/70" />
                        </div>
                        <span className="font-semibold text-sm truncate">{g.name}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[11px] text-muted-foreground font-mono bg-muted/60 px-2 py-0.5 rounded-md">
                          {g.inviteCode}
                        </span>
                        <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover/item:text-primary transition-colors" />
                      </div>
                    </Link>
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
