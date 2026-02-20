/**
 * 그룹 학습 리포트 페이지 (/instructor/groups/:id/report)
 * 멤버별 전체 통계 + 취약 유형 상위 3개
 */
import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router'
import { ArrowLeft, Users, Target, BookOpenCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/AuthContext'
import { getGroup, listGroupMembers, MOCK_STUDENTS } from '@/services/group.service'
import { getOverallStats, getWeakCategories } from '@/services/analytics.service'
import type { Group } from '@/lib/db'

interface StudentReport {
  studentId: string
  name: string
  total: number
  accuracy: number
  totalTimeSeconds: number
  weakCategories: { category: string; pL: number }[]
}

export default function GroupReportPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const groupId = Number(id)

  const [group, setGroup] = useState<Group | null>(null)
  const [reports, setReports] = useState<StudentReport[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    ;(async () => {
      const g = await getGroup(groupId)
      if (!g || g.instructorId !== user.email) {
        navigate('/instructor/groups')
        return
      }
      setGroup(g)

      const members = await listGroupMembers(groupId)
      const results = await Promise.all(
        members.map(async (m) => {
          const [overall, weakCategories] = await Promise.all([
            getOverallStats(m.studentId),
            getWeakCategories(m.studentId),
          ])
          return {
            studentId: m.studentId,
            name: MOCK_STUDENTS.find(s => s.email === m.studentId)?.name ?? m.studentId,
            total: overall.total,
            accuracy: overall.accuracy,
            totalTimeSeconds: overall.totalTimeSeconds,
            weakCategories: weakCategories.slice(0, 3),
          }
        }),
      )
      setReports(results.sort((a, b) => b.total - a.total))
      setIsLoading(false)
    })()
  }, [groupId, user])

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto space-y-5">
        <div className="h-8 w-48 bg-muted rounded-xl animate-pulse" />
        <div className="grid grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="h-24 bg-muted/40 rounded-2xl animate-pulse" />)}
        </div>
        <div className="h-64 bg-muted/40 rounded-2xl animate-pulse" />
      </div>
    )
  }
  if (!group) return null

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600)
    const m = Math.floor((secs % 3600) / 60)
    return h > 0 ? `${h}시간 ${m}분` : `${m}분`
  }

  const avgAccuracy = reports.length > 0
    ? Math.round(reports.reduce((s, r) => s + r.accuracy, 0) / reports.length)
    : 0

  const totalSolved = reports.reduce((s, r) => s + r.total, 0)

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto space-y-5">
      {/* 헤더 */}
      <div className="flex items-center gap-3 animate-fade-up stagger-1">
        <Button variant="ghost" size="icon" className="rounded-xl h-9 w-9 shrink-0" asChild>
          <Link to={`/instructor/groups/${groupId}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-[1.65rem] font-extrabold tracking-tight text-foreground">학습 리포트</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{group.name}</p>
        </div>
      </div>

      {reports.length === 0 ? (
        <div className="animate-fade-up stagger-2">
          <Card className="rounded-2xl border-none shadow-sm bg-white dark:bg-card">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-muted/60 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-muted-foreground/40" />
              </div>
              <p className="text-sm font-bold text-foreground mb-1">학생 데이터가 없습니다</p>
              <p className="text-xs text-muted-foreground mb-4">반 상세 페이지에서 "모의 학생 추가"를 눌러 테스트하세요.</p>
              <Button variant="outline" className="rounded-xl font-semibold" asChild>
                <Link to={`/instructor/groups/${groupId}`}>반 상세로 이동</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        <>
          {/* 요약 통계 카드 3종 */}
          <div className="grid grid-cols-3 gap-3 md:gap-4 animate-fade-up stagger-2">
            <div className="stat-accent-blue">
              <Card className="rounded-2xl border-none shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 overflow-hidden relative group bg-white dark:bg-card">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[var(--stat-bg)]" />
                <CardContent className="p-4 md:p-5 relative">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2" style={{ background: 'var(--stat-bg-strong)' }}>
                    <Users className="w-4 h-4" style={{ color: 'var(--stat-color)' }} />
                  </div>
                  <div className="text-2xl font-black tracking-tight leading-none" style={{ color: 'var(--stat-color)' }}>
                    {reports.length}
                    <span className="text-xs font-semibold text-muted-foreground ml-0.5">명</span>
                  </div>
                  <p className="text-[11px] font-medium text-muted-foreground mt-1 tracking-wide">학생 수</p>
                </CardContent>
              </Card>
            </div>

            <div className="stat-accent-emerald">
              <Card className="rounded-2xl border-none shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 overflow-hidden relative group bg-white dark:bg-card">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[var(--stat-bg)]" />
                <CardContent className="p-4 md:p-5 relative">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2" style={{ background: 'var(--stat-bg-strong)' }}>
                    <Target className="w-4 h-4" style={{ color: 'var(--stat-color)' }} />
                  </div>
                  <div className="text-2xl font-black tracking-tight leading-none" style={{ color: 'var(--stat-color)' }}>
                    {avgAccuracy}
                    <span className="text-xs font-semibold text-muted-foreground ml-0.5">%</span>
                  </div>
                  <p className="text-[11px] font-medium text-muted-foreground mt-1 tracking-wide">평균 정답률</p>
                </CardContent>
              </Card>
            </div>

            <div className="stat-accent-amber">
              <Card className="rounded-2xl border-none shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 overflow-hidden relative group bg-white dark:bg-card">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[var(--stat-bg)]" />
                <CardContent className="p-4 md:p-5 relative">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2" style={{ background: 'var(--stat-bg-strong)' }}>
                    <BookOpenCheck className="w-4 h-4" style={{ color: 'var(--stat-color)' }} />
                  </div>
                  <div className="text-2xl font-black tracking-tight leading-none" style={{ color: 'var(--stat-color)' }}>
                    {totalSolved}
                    <span className="text-xs font-semibold text-muted-foreground ml-0.5">문제</span>
                  </div>
                  <p className="text-[11px] font-medium text-muted-foreground mt-1 tracking-wide">총 풀이 수</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* 학생별 카드 리스트 */}
          <div className="animate-fade-up stagger-3">
            <Card className="rounded-2xl border-none shadow-sm bg-white dark:bg-card overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-violet-50 dark:bg-violet-500/20 flex items-center justify-center">
                    <Users className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
                  </div>
                  학생별 학습 현황
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* 데스크톱: 테이블 */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-muted-foreground text-[11px] uppercase tracking-wider font-bold">
                        <th className="text-left py-3 pr-4">학생</th>
                        <th className="text-right pr-4">총 풀이</th>
                        <th className="text-right pr-4">정답률</th>
                        <th className="text-right pr-4">학습시간</th>
                        <th className="text-left">취약 유형</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {reports.map((r) => (
                        <tr key={r.studentId} className="hover:bg-muted/30 transition-colors">
                          <td className="py-3.5 pr-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-primary/8 flex items-center justify-center shrink-0 text-xs font-bold text-primary">
                                {r.name.charAt(0)}
                              </div>
                              <div>
                                <div className="font-semibold text-foreground">{r.name}</div>
                                <div className="text-[11px] text-muted-foreground/60 font-mono">{r.studentId}</div>
                              </div>
                            </div>
                          </td>
                          <td className="text-right pr-4 font-semibold">{r.total}문제</td>
                          <td className="text-right pr-4">
                            <span className={
                              r.accuracy >= 70 ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                              : r.accuracy >= 50 ? 'text-amber-600 dark:text-amber-400 font-bold'
                              : 'text-rose-600 dark:text-rose-400 font-bold'
                            }>
                              {r.accuracy}%
                            </span>
                          </td>
                          <td className="text-right pr-4 text-muted-foreground text-xs">{formatTime(r.totalTimeSeconds)}</td>
                          <td className="py-3">
                            {r.weakCategories.length === 0 ? (
                              <span className="text-xs text-muted-foreground/50">데이터 부족</span>
                            ) : (
                              <div className="flex flex-wrap gap-1">
                                {r.weakCategories.map((w) => (
                                  <Badge key={w.category} variant="outline" className="text-[10px] text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/30 rounded-md px-1.5 py-0">
                                    {w.category}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* 모바일: 카드 리스트 */}
                <div className="md:hidden space-y-2">
                  {reports.map((r) => (
                    <div key={r.studentId} className="p-3 rounded-xl bg-muted/20 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-primary/8 flex items-center justify-center shrink-0 text-xs font-bold text-primary">
                            {r.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold text-sm">{r.name}</div>
                            <div className="text-[10px] text-muted-foreground/60 font-mono">{r.studentId}</div>
                          </div>
                        </div>
                        <span className={
                          r.accuracy >= 70 ? 'text-emerald-600 font-black text-lg'
                          : r.accuracy >= 50 ? 'text-amber-600 font-black text-lg'
                          : 'text-rose-600 font-black text-lg'
                        }>
                          {r.accuracy}%
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{r.total}문제</span>
                        <span>{formatTime(r.totalTimeSeconds)}</span>
                      </div>
                      {r.weakCategories.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {r.weakCategories.map((w) => (
                            <Badge key={w.category} variant="outline" className="text-[10px] text-rose-600 border-rose-200 rounded-md px-1.5 py-0">
                              {w.category}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
