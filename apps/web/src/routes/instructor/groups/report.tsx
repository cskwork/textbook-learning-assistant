/**
 * 그룹 학습 리포트 페이지 (/instructor/groups/:id/report)
 * 멤버별 전체 통계(총 풀이·정답률·시간) + 취약 유형 상위 3개
 * analytics.service.ts를 studentId별로 호출하여 집계 (수정 없이 재사용)
 */
import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router'
import { ArrowLeft, Users } from 'lucide-react'
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
      // 총 풀이 수 내림차순 정렬
      setReports(results.sort((a, b) => b.total - a.total))
      setIsLoading(false)
    })()
  }, [groupId, user])

  if (isLoading) return <div className="p-6 text-center text-muted-foreground">분석 중...</div>
  if (!group) return null

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600)
    const m = Math.floor((secs % 3600) / 60)
    return h > 0 ? `${h}시간 ${m}분` : `${m}분`
  }

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link to={`/instructor/groups/${groupId}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-xl font-bold">학습 리포트</h1>
          <p className="text-sm text-muted-foreground">{group.name}</p>
        </div>
      </div>

      {reports.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">학생 데이터가 없습니다.</p>
            <p className="text-xs mt-1">반 상세 페이지에서 "모의 학생 추가"를 눌러 테스트하세요.</p>
            <Button variant="outline" size="sm" className="mt-3" asChild>
              <Link to={`/instructor/groups/${groupId}`}>반 상세로 이동</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* 요약 통계 */}
          <div className="grid grid-cols-3 gap-3">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold">{reports.length}</p>
                <p className="text-xs text-muted-foreground">학생 수</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold">
                  {reports.length > 0
                    ? Math.round(reports.reduce((s, r) => s + r.accuracy, 0) / reports.length)
                    : 0}%
                </p>
                <p className="text-xs text-muted-foreground">평균 정답률</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold">
                  {reports.reduce((s, r) => s + r.total, 0)}
                </p>
                <p className="text-xs text-muted-foreground">총 풀이 수</p>
              </CardContent>
            </Card>
          </div>

          {/* 학생별 상세 리포트 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">학생별 학습 현황</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground text-xs">
                    <th className="text-left py-2 pr-4">학생</th>
                    <th className="text-right pr-4">총 풀이</th>
                    <th className="text-right pr-4">정답률</th>
                    <th className="text-right pr-4">학습시간</th>
                    <th className="text-left">취약 유형</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((r) => (
                    <tr key={r.studentId} className="border-b last:border-0">
                      <td className="py-3 pr-4">
                        <div className="font-medium">{r.name}</div>
                        <div className="text-xs text-muted-foreground">{r.studentId}</div>
                      </td>
                      <td className="text-right pr-4">{r.total}문제</td>
                      <td className="text-right pr-4">
                        <span className={r.accuracy >= 70 ? 'text-green-600' : r.accuracy >= 50 ? 'text-yellow-600' : 'text-destructive'}>
                          {r.accuracy}%
                        </span>
                      </td>
                      <td className="text-right pr-4 text-xs">{formatTime(r.totalTimeSeconds)}</td>
                      <td className="py-2">
                        {r.weakCategories.length === 0 ? (
                          <span className="text-xs text-muted-foreground">데이터 부족</span>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {r.weakCategories.map((w) => (
                              <Badge key={w.category} variant="outline" className="text-xs text-destructive border-destructive/30">
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
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
