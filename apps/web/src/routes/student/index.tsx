/**
 * 학생 홈 대시보드 — 기출탭탭 스타일 리디자인
 *
 * 레이아웃:
 *   a. 인사 영역 (FadeIn)
 *   b. Swiper 배너 (HomeBannerSwiper — HOME-02)
 *   c. 통계 카드 그리드 4종 (AnimatedCard — HOME-01)
 *   [FunMode] 게이미피케이션 위젯 4종 (StreakCounter / DailyChallenge / WeeklyChallenge / Leaderboard)
 *   d. 빠른 학습 시작 CTA (QuickActionButtons — HOME-03)
 *   e. AI 추천 + 최근 활동 2컬럼 (lg:grid-cols-5)
 *
 * Empty State: attemptCount === 0 시 환영 메시지 + 앱 사용법 카드
 */

import {
  BookOpenCheck, TrendingUp, Target, Clock, Users,
  Sparkles, ArrowRight, Shuffle, Zap,
} from 'lucide-react'
import { Link, Navigate, useNavigate } from 'react-router'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { useEffect, useState } from 'react'
import { getOverallStats, getRecommendedQuestions } from '@/services/analytics.service'
import { getStreak } from '@/services/streak.service'
import AIRecommendations from '@/components/analytics/AIRecommendations'
import { AnimatedCard } from '@/components/motion/AnimatedCard'
import { FadeIn } from '@/components/motion/FadeIn'
import { HomeBannerSwiper } from '@/components/home/HomeBannerSwiper'
import { QuickActionButtons } from '@/components/home/QuickActionButtons'
import { RecentActivityList } from '@/components/home/RecentActivityList'
import { useFunMode } from '@/hooks/useFunMode'
import { useGamification } from '@/hooks/useGamification'
import { StreakCounter, DailyChallenge, WeeklyChallenge, Leaderboard } from '@/components/gamification'
import { StreakFlame } from '@/components/game/effects/StreakFlame'
import type { Question } from '@/lib/db'

/** 시간대별 인사말 */
function getGreeting(): { text: string; emoji: string } {
  const h = new Date().getHours()
  if (h < 6) return { text: '늦은 밤까지 열공', emoji: '🌙' }
  if (h < 12) return { text: '좋은 아침이에요', emoji: '☀️' }
  if (h < 18) return { text: '좋은 오후예요', emoji: '📚' }
  return { text: '좋은 저녁이에요', emoji: '🌆' }
}

export default function StudentHomePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const greeting = getGreeting()
  const { isFunMode } = useFunMode()
  const { profile } = useGamification(user?.email)

  const userSetting = useLiveQuery(
    async () => {
      if (!user) return undefined
      const result = await db.userSettings.where('userId').equals(user.email).first()
      return result ?? null
    },
    [user?.email],
  )

  const attemptCount = useLiveQuery(
    () => user ? db.quizAttempts.where('studentId').equals(user.email).count() : 0,
    [user?.email],
  )

  const questionCount = useLiveQuery(() => db.questions.count(), []) ?? 0

  const todayStart = (() => {
    const d = new Date(); d.setHours(0, 0, 0, 0); return d.getTime()
  })()

  const todayCount = useLiveQuery(
    () => user
      ? db.quizAttempts.where('studentId').equals(user.email)
          .filter((a) => a.attemptedAt >= todayStart).count()
      : 0,
    [user?.email, todayStart],
  ) ?? 0

  // 오답노트 수
  const wrongNoteCount = useLiveQuery(
    () => user ? db.wrongNotes.where('studentId').equals(user.email).count() : 0,
    [user?.email],
  ) ?? 0

  // 리더보드 표시용 — 학생이 속한 반 ID 조회
  const studentGroupId = useLiveQuery(
    async () => {
      if (!user) return null
      const membership = await db.groupMembers.where('studentId').equals(user.email).first()
      return membership?.groupId ?? null
    },
    [user?.email],
  )

  const [accuracy, setAccuracy] = useState<number | undefined>(undefined)
  const [streakCurrent, setStreakCurrent] = useState<number | undefined>(undefined)
  const [totalMinutes, setTotalMinutes] = useState<number | undefined>(undefined)
  const [recommendedQuestions, setRecommendedQuestions] = useState<Question[] | undefined>(undefined)
  const [isHeuristic, setIsHeuristic] = useState(true)

  useEffect(() => {
    if (!user) return
    const studentId = user.email
    async function loadStats() {
      const [overall, streakData, recommendedIds] = await Promise.all([
        getOverallStats(studentId),
        getStreak(studentId),
        getRecommendedQuestions(studentId, 3),
      ])
      setAccuracy(overall.accuracy)
      setStreakCurrent(streakData.current)
      setTotalMinutes(Math.floor(overall.totalTimeSeconds / 60))
      if (recommendedIds.length > 0) {
        const questions = await db.questions.where('id').anyOf(recommendedIds).toArray()
        setRecommendedQuestions(questions)
      } else {
        setRecommendedQuestions([])
      }
      const count = await db.quizAttempts.where('studentId').equals(studentId).count()
      setIsHeuristic(count < 30)
    }
    loadStats()
  }, [user, attemptCount])

  async function handleRandomQuiz() {
    const all = await db.questions.toArray()
    if (all.length === 0) return
    const random = all[Math.floor(Math.random() * all.length)]
    navigate(`/student/quiz/${random.id}`)
  }

  /** 데일리 챌린지 시작 — Phase 19에서 실제 챌린지 모드 구현 전까지 문제 목록으로 이동 */
  function handleStartDailyChallenge() {
    navigate('/student/problems')
  }

  // ── 로딩 스켈레톤 ──
  if (userSetting === undefined) {
    return (
      <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
        <div className="space-y-2">
          <div className="h-8 bg-muted rounded-xl w-52 animate-pulse" />
          <div className="h-4 bg-muted/60 rounded-lg w-36 animate-pulse" />
        </div>
        <div className="h-[120px] bg-muted/40 rounded-2xl animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-[120px] bg-muted/40 rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="h-40 bg-muted/40 rounded-2xl animate-pulse" />
      </div>
    )
  }

  if (userSetting === null || !userSetting.isDiagnosisCompleted) {
    return <Navigate to="/student/onboarding-quiz" replace />
  }

  const userName = user?.email?.split('@')[0] ?? '학생'

  // ── Empty State: 한 번도 문제를 풀지 않은 신규 학생 ──
  if (attemptCount === 0) {
    return (
      <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto space-y-5">

        {/* 인사 영역 */}
        <FadeIn delay={0}>
          <p className="text-sm font-medium text-muted-foreground tracking-wide">
            {greeting.emoji} {greeting.text}
          </p>
          <h1 className="text-[1.65rem] font-extrabold tracking-tight text-foreground mt-0.5 leading-tight">
            {userName}님, 환영해요!
          </h1>
        </FadeIn>

        {/* 환영 히어로 카드 */}
        <FadeIn delay={0.05}>
          <div className="cta-gradient rounded-2xl text-white relative">
            {/* 데코 서클 */}
            <div className="absolute inset-0 overflow-hidden rounded-2xl">
              <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 blur-sm" />
              <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/5" />
            </div>

            <div className="relative p-6 md:p-8 flex flex-col items-start gap-4">
              <div className="w-16 h-16 rounded-3xl bg-white/15 flex items-center justify-center">
                <BookOpenCheck className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold leading-snug">
                  학습을 시작해 볼까요?
                </h2>
                <p className="text-sm text-white/75 mt-1.5 leading-relaxed">
                  문제를 풀면 AI가 취약점을 분석하고 맞춤 추천을 해드려요.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 mt-1">
                {questionCount > 0 ? (
                  <>
                    <Button
                      asChild
                      size="sm"
                      className="bg-white text-primary hover:bg-white/90 font-semibold rounded-xl shadow-md h-9 px-4"
                    >
                      <Link to="/student/problems">
                        문제 풀러 가기
                        <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Link>
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-white/90 hover:bg-white/15 hover:text-white font-medium rounded-xl h-9 px-4"
                      onClick={handleRandomQuiz}
                    >
                      <Shuffle className="w-3.5 h-3.5 mr-1" />
                      랜덤 문제 풀기
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      asChild
                      size="sm"
                      className="bg-white text-primary hover:bg-white/90 font-semibold rounded-xl shadow-md h-9 px-4"
                    >
                      <Link to="/student/join-group">
                        <Users className="w-3.5 h-3.5 mr-1" />
                        반 참여하기
                      </Link>
                    </Button>
                    <p className="w-full text-xs text-white/65 mt-1 leading-relaxed">
                      강사님이 등록한 문제가 있어야 학습을 시작할 수 있어요.
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </FadeIn>

        {/* 앱 사용법 안내 스텝 카드 3개 */}
        <FadeIn delay={0.1}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <AnimatedCard className="border-none shadow-sm bg-white dark:bg-card">
              <div className="p-4 md:p-5">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-500/15 flex items-center justify-center mb-3">
                  <BookOpenCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <p className="text-sm font-bold text-foreground">문제 풀기</p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  다양한 수학 기출문제를 풀어보세요
                </p>
              </div>
            </AnimatedCard>

            <AnimatedCard className="border-none shadow-sm bg-white dark:bg-card">
              <div className="p-4 md:p-5">
                <div className="w-10 h-10 rounded-2xl bg-violet-50 dark:bg-violet-500/15 flex items-center justify-center mb-3">
                  <Sparkles className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                </div>
                <p className="text-sm font-bold text-foreground">AI 분석</p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  AI가 취약 유형을 자동 분석해요
                </p>
              </div>
            </AnimatedCard>

            <AnimatedCard className="border-none shadow-sm bg-white dark:bg-card">
              <div className="p-4 md:p-5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-500/15 flex items-center justify-center mb-3">
                  <Target className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <p className="text-sm font-bold text-foreground">맞춤 추천</p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  약점 보완 문제를 추천받으세요
                </p>
              </div>
            </AnimatedCard>
          </div>
        </FadeIn>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto space-y-5">

      {/* ── a. 인사 영역 ── */}
      <FadeIn delay={0}>
        <p className="text-sm font-medium text-muted-foreground tracking-wide">
          {greeting.emoji} {greeting.text}
        </p>
        <h1 className="text-[1.65rem] font-extrabold tracking-tight text-foreground mt-0.5 leading-tight">
          {userName}님의 학습 현황
        </h1>
      </FadeIn>

      {/* ── b. Swiper 배너 (HOME-02) ── */}
      <FadeIn delay={0.05}>
        {recommendedQuestions !== undefined && (
          <HomeBannerSwiper
            recommendedQuestions={recommendedQuestions}
            wrongNoteCount={wrongNoteCount}
            isHeuristic={isHeuristic}
          />
        )}
      </FadeIn>

      {/* ── c. 통계 카드 그리드 (HOME-01) ── */}
      <FadeIn delay={0.1}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">

          {/* 오늘 풀이 */}
          <div className="stat-accent-blue">
            <AnimatedCard className="border-none shadow-sm overflow-hidden relative group bg-white dark:bg-card">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[var(--stat-bg)]" />
              <div className="p-4 md:p-5 relative">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: 'var(--stat-bg-strong)' }}
                >
                  <BookOpenCheck className="w-[18px] h-[18px]" style={{ color: 'var(--stat-color)' }} />
                </div>
                <div className="animate-count-up">
                  <span className="text-[1.75rem] font-black tracking-tight leading-none" style={{ color: 'var(--stat-color)' }}>
                    {todayCount}
                  </span>
                  <span className="text-xs font-semibold text-muted-foreground ml-0.5">문제</span>
                </div>
                <p className="text-[11px] font-medium text-muted-foreground mt-1.5 tracking-wide">오늘 풀이</p>
              </div>
            </AnimatedCard>
          </div>

          {/* 정답률 */}
          <div className="stat-accent-emerald">
            <AnimatedCard className="border-none shadow-sm overflow-hidden relative group bg-white dark:bg-card">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[var(--stat-bg)]" />
              <div className="p-4 md:p-5 relative">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: 'var(--stat-bg-strong)' }}
                >
                  <Target className="w-[18px] h-[18px]" style={{ color: 'var(--stat-color)' }} />
                </div>
                {accuracy === undefined ? (
                  <div className="h-8 w-14 bg-muted rounded-lg animate-pulse" />
                ) : (
                  <div className="animate-count-up">
                    <span className="text-[1.75rem] font-black tracking-tight leading-none" style={{ color: 'var(--stat-color)' }}>
                      {accuracy}
                    </span>
                    <span className="text-xs font-semibold text-muted-foreground ml-0.5">%</span>
                  </div>
                )}
                <p className="text-[11px] font-medium text-muted-foreground mt-1.5 tracking-wide">정답률</p>
              </div>
            </AnimatedCard>
          </div>

          {/* 연속 학습 */}
          <div className="stat-accent-amber">
            <AnimatedCard className="border-none shadow-sm overflow-hidden relative group bg-white dark:bg-card">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[var(--stat-bg)]" />
              <div className="p-4 md:p-5 relative">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: 'var(--stat-bg-strong)' }}
                >
                  <TrendingUp className="w-[18px] h-[18px]" style={{ color: 'var(--stat-color)' }} />
                </div>
                {streakCurrent === undefined ? (
                  <div className="h-8 w-14 bg-muted rounded-lg animate-pulse" />
                ) : (
                  <div className="animate-count-up">
                    <span className="text-[1.75rem] font-black tracking-tight leading-none" style={{ color: 'var(--stat-color)' }}>
                      {streakCurrent}
                    </span>
                    <span className="text-xs font-semibold text-muted-foreground ml-0.5">일</span>
                  </div>
                )}
                <p className="text-[11px] font-medium text-muted-foreground mt-1.5 tracking-wide">연속 학습</p>
              </div>
            </AnimatedCard>
          </div>

          {/* 학습 시간 */}
          <div className="stat-accent-rose">
            <AnimatedCard className="border-none shadow-sm overflow-hidden relative group bg-white dark:bg-card">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[var(--stat-bg)]" />
              <div className="p-4 md:p-5 relative">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: 'var(--stat-bg-strong)' }}
                >
                  <Clock className="w-[18px] h-[18px]" style={{ color: 'var(--stat-color)' }} />
                </div>
                {totalMinutes === undefined ? (
                  <div className="h-8 w-14 bg-muted rounded-lg animate-pulse" />
                ) : (
                  <div className="animate-count-up">
                    <span className="text-[1.75rem] font-black tracking-tight leading-none" style={{ color: 'var(--stat-color)' }}>
                      {totalMinutes}
                    </span>
                    <span className="text-xs font-semibold text-muted-foreground ml-0.5">분</span>
                  </div>
                )}
                <p className="text-[11px] font-medium text-muted-foreground mt-1.5 tracking-wide">학습 시간</p>
              </div>
            </AnimatedCard>
          </div>
        </div>
      </FadeIn>

      {/* ── FunMode 게이미피케이션 위젯 ── */}
      {isFunMode && profile && (
        <FadeIn delay={0.12}>
          <div className="space-y-4">
            {/* 스트릭 + 데일리 챌린지 한 줄 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <AnimatedCard className="border-none shadow-sm bg-white dark:bg-card p-4">
                <div className="relative">
                  {/* Phase 18: 스트릭 불꽃 — FunMode에서 StreakCounter 아이콘 뒤 배치 */}
                  {isFunMode && (
                    <StreakFlame
                      streakDays={profile.streakDays}
                      className="-top-3 -left-1"
                    />
                  )}
                  <StreakCounter
                    streakDays={profile.streakDays}
                    bonusXP={0}
                  />
                </div>
              </AnimatedCard>
              <AnimatedCard className="border-none shadow-sm bg-white dark:bg-card">
                <DailyChallenge
                  studentId={user!.email}
                  onStartChallenge={handleStartDailyChallenge}
                />
              </AnimatedCard>
            </div>

            {/* 주간 챌린지 */}
            <AnimatedCard className="border-none shadow-sm bg-white dark:bg-card">
              <WeeklyChallenge studentId={user!.email} />
            </AnimatedCard>

            {/* 리더보드 */}
            <AnimatedCard className="border-none shadow-sm bg-white dark:bg-card">
              <Leaderboard
                groupId={studentGroupId ?? null}
                currentStudentId={user!.email}
              />
            </AnimatedCard>
          </div>
        </FadeIn>
      )}

      {/* ── d. 빠른 학습 시작 CTA (HOME-03) ── */}
      <FadeIn delay={0.15}>
        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-primary" />
            <span className="text-sm font-bold text-foreground">빠른 시작</span>
          </div>
          <QuickActionButtons
            onRandomQuiz={handleRandomQuiz}
            wrongNoteCount={wrongNoteCount}
            hasWorkbookInProgress={false}
          />
        </div>
      </FadeIn>

      {/* ── e. AI 추천 + 최근 활동 (lg 2컬럼) ── */}
      <FadeIn delay={0.2}>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-5">

          {/* AI 추천 — lg에서 3/5 */}
          <div className="lg:col-span-3">
            <AnimatedCard className="border-none shadow-sm bg-white dark:bg-card overflow-hidden h-full flex flex-col">
              <div className="p-4 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-violet-100 dark:bg-violet-500/20 flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
                  </div>
                  <h3 className="text-sm font-bold">AI 추천 문제</h3>
                </div>
              </div>
              <div className="p-4 pt-2 space-y-4 flex-1 flex flex-col">
                <div className="flex-1">
                  {recommendedQuestions === undefined ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-16 bg-muted/40 rounded-xl animate-pulse" />
                      ))}
                    </div>
                  ) : recommendedQuestions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-6 text-center space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-violet-400" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">아직 분석 데이터가 없어요!</p>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                          {questionCount === 0
                            ? <>먼저 문제가 등록되어야<br />AI 추천이 시작됩니다.</>
                            : <>문제를 몇 번 풀면<br />AI가 맞춤 추천해 드려요.</>}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <AIRecommendations
                      questions={recommendedQuestions}
                      isHeuristic={isHeuristic}
                    />
                  )}
                </div>
                <Button
                  asChild
                  variant="ghost"
                  className="w-full rounded-xl text-sm font-semibold text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-500/10 h-10 mt-auto"
                >
                  <Link to="/student/analytics">
                    자세한 분석 보기
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Link>
                </Button>
              </div>
            </AnimatedCard>
          </div>

          {/* 최근 활동 — lg에서 2/5 */}
          <div className="lg:col-span-2">
            <AnimatedCard className="border-none shadow-sm bg-white dark:bg-card overflow-hidden h-full flex flex-col">
              <div className="p-4 pb-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold">최근 학습 이력</h3>
                  <Link
                    to="/student/wrong-notes"
                    className="text-[11px] font-semibold text-primary hover:underline"
                  >
                    전체 보기
                  </Link>
                </div>
              </div>
              <div className="p-4 pt-2 flex-1">
                {user && (
                  <RecentActivityList studentId={user.email} />
                )}
              </div>
            </AnimatedCard>
          </div>
        </div>
      </FadeIn>
    </div>
  )
}
