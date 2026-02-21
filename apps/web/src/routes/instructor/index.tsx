/**
 * 강사 홈 대시보드 — 기출탭탭 스타일 전면 리디자인
 *
 * 레이아웃:
 *   a. 인사 영역 + 문제 출제 CTA (FadeIn delay=0)
 *   b. 통계 카드 2종 AnimatedCard (FadeIn delay=0.05)
 *   c. 빠른 이동 버튼 — 반 관리 / 문제 관리 / 새 반 만들기 (FadeIn delay=0.1)
 *   d. 최근 반 (lg:col-span-3) + 최근 과제 (lg:col-span-2) (FadeIn delay=0.15)
 *
 * INST-01: 학생 현황 카드 + 최근 과제 + 반별 성적 요약
 */

import { useLiveQuery } from 'dexie-react-hooks'
import {
  Users, BookOpen, PlusCircle, ClipboardList,
  ArrowRight, ChevronRight, Layers, CalendarDays,
} from 'lucide-react'
import { Link } from 'react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/AuthContext'
import { db } from '@/lib/db'
import { useEffect, useState } from 'react'
import { AnimatedCard } from '@/components/motion/AnimatedCard'
import { FadeIn } from '@/components/motion/FadeIn'
import { getOverallStats } from '@/services/analytics.service'
import { listGroupMembers } from '@/services/group.service'

/** 시간대별 인사말 */
function getGreeting(): { text: string; emoji: string } {
  const h = new Date().getHours()
  if (h < 6) return { text: '늦은 밤까지 수고하세요', emoji: '🌙' }
  if (h < 12) return { text: '좋은 아침이에요', emoji: '☀️' }
  if (h < 18) return { text: '좋은 오후예요', emoji: '📋' }
  return { text: '좋은 저녁이에요', emoji: '🌆' }
}

/** 반별 성적 요약 인터페이스 */
interface GroupSummary {
  groupId: number
  memberCount: number
  avgAccuracy: number
}

export default function InstructorHomePage() {
  const { user } = useAuth()
  const greeting = getGreeting()

  // ── 통계 카드용 Live 쿼리 ──
  const groupCount = useLiveQuery(
    () => user ? db.groups.where('instructorId').equals(user.email).count() : 0,
    [user?.email],
  )

  const problemCount = useLiveQuery(
    () => user ? db.questions.where('createdBy').equals(user.email).count() : 0,
    [user?.email],
  )

  // ── 최근 반 (최대 3개) ──
  const recentGroups = useLiveQuery(
    () => user
      ? db.groups.where('instructorId').equals(user.email).toArray()
          .then(arr => arr.sort((a, b) => b.createdAt - a.createdAt).slice(0, 3))
      : [],
    [user?.email],
  )

  // ── 최근 과제 (최대 5개, 전체 반 기준) ──
  const recentAssignments = useLiveQuery(
    async () => {
      if (!user) return []
      const groups = await db.groups.where('instructorId').equals(user.email).toArray()
      const groupIds = groups.map(g => g.id!)
      if (groupIds.length === 0) return []
      const allAssignments = await db.assignments
        .where('groupId')
        .anyOf(groupIds)
        .toArray()
      return allAssignments
        .sort((a, b) => b.assignedAt - a.assignedAt)
        .slice(0, 5)
    },
    [user?.email],
  )

  // ── 반별 성적 요약 (학생 수 + 평균 정답률) ──
  const [groupSummaries, setGroupSummaries] = useState<Map<number, GroupSummary>>(new Map())

  useEffect(() => {
    if (!recentGroups || recentGroups.length === 0) return

    async function loadGroupSummaries() {
      const summaryMap = new Map<number, GroupSummary>()

      await Promise.all(
        (recentGroups ?? []).map(async (group) => {
          const members = await listGroupMembers(group.id!)
          const memberCount = members.length

          if (memberCount === 0) {
            summaryMap.set(group.id!, { groupId: group.id!, memberCount: 0, avgAccuracy: 0 })
            return
          }

          const statsResults = await Promise.all(
            members.map(m => getOverallStats(m.studentId))
          )
          const totalAccuracy = statsResults.reduce((sum, s) => sum + s.accuracy, 0)
          const avgAccuracy = Math.round(totalAccuracy / statsResults.length)

          summaryMap.set(group.id!, { groupId: group.id!, memberCount, avgAccuracy })
        })
      )

      setGroupSummaries(new Map(summaryMap))
    }

    loadGroupSummaries()
  }, [recentGroups])

  const userName = user?.email?.split('@')[0] ?? '선생님'

  // 과제의 그룹명 조회 헬퍼 (recentGroups + 모든 그룹 통합)
  const allGroupsQuery = useLiveQuery(
    () => user ? db.groups.where('instructorId').equals(user.email).toArray() : [],
    [user?.email],
  )
  const groupNameMap = new Map((allGroupsQuery ?? []).map(g => [g.id!, g.name]))

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto space-y-5">

      {/* ── a. 인사 영역 + 문제 출제 CTA ── */}
      <FadeIn delay={0}>
        <div className="flex items-start justify-between gap-4">
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
      </FadeIn>

      {/* ── b. 통계 카드 2종 ── */}
      <FadeIn delay={0.05}>
        <div className="grid grid-cols-2 gap-3 md:gap-4">

          {/* 관리 중인 반 */}
          <div className="stat-accent-blue">
            <AnimatedCard className="border-none shadow-sm overflow-hidden relative group bg-white dark:bg-card">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[var(--stat-bg)]" />
              <div className="p-4 md:p-5 relative">
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
              </div>
            </AnimatedCard>
          </div>

          {/* 출제한 문제 */}
          <div className="stat-accent-emerald">
            <AnimatedCard className="border-none shadow-sm overflow-hidden relative group bg-white dark:bg-card">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[var(--stat-bg)]" />
              <div className="p-4 md:p-5 relative">
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
              </div>
            </AnimatedCard>
          </div>
        </div>
      </FadeIn>

      {/* ── c. 빠른 이동 버튼 ── */}
      <FadeIn delay={0.1}>
        <div className="stat-accent-violet">
          <AnimatedCard className="border-none shadow-sm overflow-hidden relative group bg-white dark:bg-card">
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[var(--stat-bg)]" />
            <div className="p-4 md:p-5 relative">
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: 'var(--stat-bg-strong)' }}
                >
                  <Layers className="w-[16px] h-[16px]" style={{ color: 'var(--stat-color)' }} />
                </div>
                <p className="text-sm font-bold text-foreground">빠른 이동</p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-xl hover:bg-[var(--stat-bg)] hover:text-[var(--stat-color)] hover:border-transparent transition-colors text-xs h-9 font-semibold"
                  asChild
                >
                  <Link to="/instructor/groups">
                    <Users className="w-3.5 h-3.5 mr-1" />
                    반 관리
                  </Link>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-xl hover:bg-[var(--stat-bg)] hover:text-[var(--stat-color)] hover:border-transparent transition-colors text-xs h-9 font-semibold"
                  asChild
                >
                  <Link to="/instructor/problems">
                    <BookOpen className="w-3.5 h-3.5 mr-1" />
                    문제 관리
                  </Link>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-xl hover:bg-[var(--stat-bg)] hover:text-[var(--stat-color)] hover:border-transparent transition-colors text-xs h-9 font-semibold"
                  asChild
                >
                  <Link to="/instructor/groups/new">
                    <PlusCircle className="w-3.5 h-3.5 mr-1" />
                    새 반 만들기
                  </Link>
                </Button>
              </div>
            </div>
          </AnimatedCard>
        </div>
      </FadeIn>

      {/* ── d. 최근 반 + 최근 과제 ── */}
      <FadeIn delay={0.15}>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-5">

          {/* 최근 반 — lg에서 3/5 */}
          <div className="lg:col-span-3">
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
              <CardContent className="pb-4 flex-1">
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
                    {recentGroups.map((g) => {
                      const summary = groupSummaries.get(g.id!)
                      return (
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
                              {summary && (
                                <>
                                  <Badge variant="secondary" className="text-[10px] font-semibold rounded-lg px-1.5 py-0.5">
                                    {summary.memberCount}명
                                  </Badge>
                                  <span className="text-[11px] font-mono text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md">
                                    {summary.avgAccuracy}%
                                  </span>
                                </>
                              )}
                              <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover/item:text-primary transition-colors" />
                            </div>
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 최근 과제 — lg에서 2/5 */}
          <div className="lg:col-span-2">
            <Card className="rounded-2xl border-none shadow-sm bg-white dark:bg-card overflow-hidden h-full flex flex-col">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-emerald-50 dark:bg-emerald-500/20 flex items-center justify-center">
                      <CalendarDays className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    최근 과제
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pb-4 flex-1">
                {!recentAssignments || recentAssignments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center space-y-3">
                    <div className="w-14 h-14 rounded-2xl bg-muted/60 flex items-center justify-center">
                      <CalendarDays className="w-7 h-7 text-muted-foreground/50" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">배정된 과제가 없습니다</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        반에 문제집을 과제로 배정해 보세요.
                      </p>
                    </div>
                    <Button size="sm" variant="outline" className="rounded-xl font-semibold mt-1" asChild>
                      <Link to="/instructor/groups">
                        반 관리로 이동
                        <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <ul className="space-y-1">
                    {recentAssignments.map((a) => (
                      <li key={a.id}>
                        <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors">
                          <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-500/15 flex items-center justify-center shrink-0 mt-0.5">
                            <CalendarDays className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold truncate">{a.title}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              {groupNameMap.get(a.groupId) && (
                                <span className="text-[10px] text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded-md">
                                  {groupNameMap.get(a.groupId)}
                                </span>
                              )}
                              {a.dueDate && (
                                <span className="text-[10px] text-muted-foreground">
                                  마감: {new Date(a.dueDate).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </FadeIn>

    </div>
  )
}
