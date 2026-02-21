/**
 * 강사 학생별 상세 분석 페이지 (/instructor/groups/:id/student/:studentId)
 * 정답률 차트, 취약 유형 레이더 차트, 오답노트 미리보기, 전체 학습 통계
 * 기출탭탭 스타일 리디자인 — AnimatedCard + FadeIn (INST-03)
 */
import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router'
import { ArrowLeft, BookOpenCheck, Target, Clock, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/AuthContext'
import { getGroup, MOCK_STUDENTS } from '@/services/group.service'
import {
  getCategoryAccuracy,
  getWeakCategories,
  getOverallStats,
} from '@/services/analytics.service'
import { db } from '@/lib/db'
import type { WrongNote } from '@/lib/db'
import type { AccuracyData } from '@/components/analytics/AccuracyBarChart'
import type { WeakTypeData } from '@/components/analytics/WeakTypeRadarChart'
import { AccuracyBarChart } from '@/components/analytics/AccuracyBarChart'
import { WeakTypeRadarChart } from '@/components/analytics/WeakTypeRadarChart'
import { FadeIn } from '@/components/motion/FadeIn'
import { AnimatedCard } from '@/components/motion/AnimatedCard'

interface OverallStats {
  total: number
  correct: number
  accuracy: number
  totalTimeSeconds: number
}

function formatTime(secs: number): string {
  const h = Math.floor(secs / 3600)
  const m = Math.floor((secs % 3600) / 60)
  return h > 0 ? `${h}시간 ${m}분` : `${m}분`
}

export default function StudentAnalyticsDetailPage() {
  const { id, studentId } = useParams<{ id: string; studentId: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const groupId = Number(id)

  const [isLoading, setIsLoading] = useState(true)
  const [studentName, setStudentName] = useState<string>('')
  const [overallStats, setOverallStats] = useState<OverallStats | null>(null)
  const [accuracyData, setAccuracyData] = useState<AccuracyData[]>([])
  const [weakData, setWeakData] = useState<WeakTypeData[]>([])
  const [wrongNotes, setWrongNotes] = useState<WrongNote[]>([])

  useEffect(() => {
    if (!user || !studentId) return
    ;(async () => {
      // 강사 소유 그룹 확인
      const g = await getGroup(groupId)
      if (!g || g.instructorId !== user.email) {
        navigate('/instructor/groups')
        return
      }

      // 학생 이름 조회
      const found = MOCK_STUDENTS.find((s) => s.email === studentId)
      setStudentName(found?.name ?? studentId)

      // 병렬 데이터 로드
      const [overall, accuracy, weak, notes] = await Promise.all([
        getOverallStats(studentId),
        getCategoryAccuracy(studentId),
        getWeakCategories(studentId),
        db.wrongNotes.where('studentId').equals(studentId).limit(5).toArray(),
      ])

      setOverallStats(overall)
      setAccuracyData(accuracy)
      setWeakData(weak)
      // 최근 오답 순 정렬 (lastWrongAt 내림차순)
      setWrongNotes(notes.sort((a, b) => b.lastWrongAt - a.lastWrongAt))
      setIsLoading(false)
    })()
  }, [groupId, studentId, user])

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto space-y-5">
        <div className="h-8 w-48 bg-muted rounded-xl animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-muted/40 rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-64 bg-muted/40 rounded-2xl animate-pulse" />
          <div className="h-64 bg-muted/40 rounded-2xl animate-pulse" />
        </div>
        <div className="h-48 bg-muted/40 rounded-2xl animate-pulse" />
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto space-y-5">

      {/* 헤더 */}
      <FadeIn delay={0}>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="rounded-xl h-9 w-9 shrink-0" asChild>
            <Link to={`/instructor/groups/${groupId}/report`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-[1.65rem] font-extrabold tracking-tight text-foreground">
              학생 상세 분석
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {studentName}
              {studentName !== studentId && (
                <span className="font-mono text-[11px] ml-2 text-muted-foreground/50">{studentId}</span>
              )}
            </p>
          </div>
        </div>
      </FadeIn>

      {/* 전체 통계 카드 4종 — AnimatedCard 적용 */}
      {overallStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* 총 풀이 수 */}
          <FadeIn delay={0.05}>
            <div className="stat-accent-blue">
              <AnimatedCard className="border-none shadow-sm overflow-hidden relative group bg-white dark:bg-card">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[var(--stat-bg)]" />
                <div className="p-4 relative">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center mb-2"
                    style={{ background: 'var(--stat-bg-strong)' }}
                  >
                    <BookOpenCheck className="w-4 h-4" style={{ color: 'var(--stat-color)' }} />
                  </div>
                  <div
                    className="text-2xl font-black tracking-tight leading-none"
                    style={{ color: 'var(--stat-color)' }}
                  >
                    {overallStats.total}
                    <span className="text-xs font-semibold text-muted-foreground ml-0.5">문제</span>
                  </div>
                  <p className="text-[11px] font-medium text-muted-foreground mt-1 tracking-wide">
                    총 풀이 수
                  </p>
                </div>
              </AnimatedCard>
            </div>
          </FadeIn>

          {/* 정답률 */}
          <FadeIn delay={0.1}>
            <div className="stat-accent-emerald">
              <AnimatedCard className="border-none shadow-sm overflow-hidden relative group bg-white dark:bg-card">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[var(--stat-bg)]" />
                <div className="p-4 relative">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center mb-2"
                    style={{ background: 'var(--stat-bg-strong)' }}
                  >
                    <Target className="w-4 h-4" style={{ color: 'var(--stat-color)' }} />
                  </div>
                  <div
                    className="text-2xl font-black tracking-tight leading-none"
                    style={{ color: 'var(--stat-color)' }}
                  >
                    {overallStats.accuracy}
                    <span className="text-xs font-semibold text-muted-foreground ml-0.5">%</span>
                  </div>
                  <p className="text-[11px] font-medium text-muted-foreground mt-1 tracking-wide">
                    전체 정답률
                  </p>
                  <p className="text-[10px] text-muted-foreground/60">
                    {overallStats.correct}/{overallStats.total} 정답
                  </p>
                </div>
              </AnimatedCard>
            </div>
          </FadeIn>

          {/* 학습 시간 */}
          <FadeIn delay={0.15}>
            <div className="stat-accent-amber">
              <AnimatedCard className="border-none shadow-sm overflow-hidden relative group bg-white dark:bg-card">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[var(--stat-bg)]" />
                <div className="p-4 relative">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center mb-2"
                    style={{ background: 'var(--stat-bg-strong)' }}
                  >
                    <Clock className="w-4 h-4" style={{ color: 'var(--stat-color)' }} />
                  </div>
                  <div
                    className="text-2xl font-black tracking-tight leading-none"
                    style={{ color: 'var(--stat-color)' }}
                  >
                    {formatTime(overallStats.totalTimeSeconds)}
                  </div>
                  <p className="text-[11px] font-medium text-muted-foreground mt-1 tracking-wide">
                    총 학습 시간
                  </p>
                </div>
              </AnimatedCard>
            </div>
          </FadeIn>

          {/* 오답 수 */}
          <FadeIn delay={0.2}>
            <div className="stat-accent-rose">
              <AnimatedCard className="border-none shadow-sm overflow-hidden relative group bg-white dark:bg-card">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[var(--stat-bg)]" />
                <div className="p-4 relative">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center mb-2"
                    style={{ background: 'var(--stat-bg-strong)' }}
                  >
                    <AlertCircle className="w-4 h-4" style={{ color: 'var(--stat-color)' }} />
                  </div>
                  <div
                    className="text-2xl font-black tracking-tight leading-none"
                    style={{ color: 'var(--stat-color)' }}
                  >
                    {overallStats.total - overallStats.correct}
                    <span className="text-xs font-semibold text-muted-foreground ml-0.5">문제</span>
                  </div>
                  <p className="text-[11px] font-medium text-muted-foreground mt-1 tracking-wide">
                    오답 수
                  </p>
                </div>
              </AnimatedCard>
            </div>
          </FadeIn>
        </div>
      )}

      {/* 차트 2컬럼 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 유형별 정답률 BarChart */}
        <FadeIn delay={0.25}>
          <Card className="rounded-2xl border-none shadow-sm bg-white dark:bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-500/20 flex items-center justify-center">
                  <Target className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                </div>
                유형별 정답률
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AccuracyBarChart data={accuracyData} />
            </CardContent>
          </Card>
        </FadeIn>

        {/* 취약 유형 RadarChart */}
        <FadeIn delay={0.3}>
          <Card className="rounded-2xl border-none shadow-sm bg-white dark:bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-rose-50 dark:bg-rose-500/20 flex items-center justify-center">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                </div>
                취약 유형 레이더
              </CardTitle>
            </CardHeader>
            <CardContent>
              <WeakTypeRadarChart data={weakData} />
            </CardContent>
          </Card>
        </FadeIn>
      </div>

      {/* 최근 오답노트 */}
      <FadeIn delay={0.35}>
        <Card className="rounded-2xl border-none shadow-sm bg-white dark:bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-amber-50 dark:bg-amber-500/20 flex items-center justify-center">
                <BookOpenCheck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              </div>
              최근 오답노트
              <span className="text-xs font-normal text-muted-foreground ml-1">(최근 5개)</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {wrongNotes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-12 h-12 rounded-2xl bg-muted/60 flex items-center justify-center mx-auto mb-3">
                  <BookOpenCheck className="h-6 w-6 text-muted-foreground/40" />
                </div>
                <p className="text-sm font-bold text-foreground">오답 기록이 없습니다</p>
                <p className="text-xs text-muted-foreground mt-1">아직 오답을 기록한 문제가 없어요.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {wrongNotes.map((note) => (
                  <div
                    key={note.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-muted/20 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
                          {note.wrongCount}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge
                            variant="outline"
                            className="text-[10px] text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/30 rounded-md px-1.5 py-0 shrink-0"
                          >
                            {note.questionCategory}
                          </Badge>
                          <span className="text-[11px] text-muted-foreground/60 truncate">
                            문제 #{note.questionId}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground/50 mt-0.5">
                          {note.lastWrongAt > 0
                            ? `마지막 오답: ${new Date(note.lastWrongAt).toLocaleDateString('ko-KR')}`
                            : '오답 날짜 없음'}
                        </p>
                      </div>
                    </div>
                    <div className="shrink-0 ml-2">
                      {note.isMastered ? (
                        <Badge className="text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border-0 rounded-md">
                          완료
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-[10px] text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/30 rounded-md"
                        >
                          미완료
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  )
}
