// apps/web/src/routes/student/quiz/index.tsx
// 퀴즈 플레이어 페이지 — useParams(:id) + QuizPlayer + 북마크 + 기출탭탭 스타일
// Phase 16: 게이미피케이션 오버레이 (FunMode 시 LevelUpOverlay + BadgeUnlockOverlay)
// Phase 19: 게임 모드 통합 (FunMode ON → 모드 선택 → 게임 플레이 → 결과)
import { lazy, Suspense, useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router'
import { Bookmark, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { QuizPlayer } from '@/components/quiz/QuizPlayer'
import { FadeIn } from '@/components/motion/FadeIn'
import { AnimatedCard } from '@/components/motion/AnimatedCard'
import { GameModeSelector } from '@/components/game/quiz/GameModeSelector'
import { useAuth } from '@/contexts/AuthContext'
import { useFunMode } from '@/hooks/useFunMode'
import { db, type Question, type GameMode } from '@/lib/db'
import { getWrongNote, toggleBookmark } from '@/services/wrongNote.service'
import { LevelUpOverlay, BadgeUnlockOverlay } from '@/components/gamification'
import { BADGE_DEFINITIONS, type BadgeDefinition } from '@/lib/gamification/badge-definitions'
import { EventBus } from '@/game/EventBus'
import type { GamificationResult } from '@/components/quiz/QuizPlayer'
import type { GameSessionResult } from '@/hooks/useGameSession'

// ─── Lazy 로드 컴포넌트 (번들 분리) ──────────────────────────────────────────

// Phase 18: 퀴즈 완료 컨페티 (lazy load → game-confetti 청크)
const ConfettiEffect = lazy(() => import('@/components/game/effects/ConfettiEffect'))

// Phase 19: 게임 모드 컴포넌트 (lazy load → 각각 별도 청크)
const TimeAttackMode = lazy(() => import('@/components/game/quiz/TimeAttackMode'))
const SurvivalMode = lazy(() => import('@/components/game/quiz/SurvivalMode'))
const BossBattleMode = lazy(() => import('@/components/game/quiz/BossBattleMode'))
const MiniGameMode = lazy(() => import('@/components/game/quiz/MiniGameMode'))
const GameResult = lazy(() => import('@/components/game/quiz/GameResult'))

// ─── 뷰 타입 ────────────────────────────────────────────────────────────────

type QuizPageView =
  | 'modeSelect'
  | 'normal'
  | 'timeAttack'
  | 'survival'
  | 'bossBattle'
  | 'miniGame'
  | 'result'

// ─── 게임 모드 로딩 스피너 ──────────────────────────────────────────────────

function GameModeLoading() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center space-y-3">
        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-white/60 text-sm">게임 모드 로딩 중...</p>
      </div>
    </div>
  )
}

// ─── 문제 셔플 유틸 ──────────────────────────────────────────────────────────

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

// ─── 메인 컴포넌트 ─────────────────────────────────────────────────────────

export default function QuizPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { isFunMode } = useFunMode()

  const [question, setQuestion] = useState<Question | null | undefined>(undefined) // undefined=로딩중, null=없음
  const [isBookmarked, setIsBookmarked] = useState(false)

  // Phase 19: 게임 모드 상태
  const [view, setView] = useState<QuizPageView>('modeSelect')
  const [gameQuestions, setGameQuestions] = useState<Question[]>([])
  const [gameResult, setGameResult] = useState<GameSessionResult | null>(null)
  const [isPersonalBest, setIsPersonalBest] = useState(false)
  const [selectedMode, setSelectedMode] = useState<GameMode | 'normal' | null>(null)

  // 게이미피케이션 오버레이 상태
  const [levelUpInfo, setLevelUpInfo] = useState<{ newLevel: number } | null>(null)
  const [unlockedBadge, setUnlockedBadge] = useState<BadgeDefinition | null>(null)

  // Phase 18: 퀴즈 정답 시 컨페티 트리거 상태
  const [showConfetti, setShowConfetti] = useState(false)

  const studentId = user?.email ?? ''

  // 문제 로드 (기존: 단일 문제)
  useEffect(() => {
    const questionId = Number(id)
    if (!id || isNaN(questionId)) {
      setQuestion(null)
      return
    }

    db.questions.get(questionId).then((q) => {
      setQuestion(q ?? null)
    })
  }, [id])

  // 게임 모드용 문제 세트 로딩 (같은 과목/단원의 문제를 가져옴)
  useEffect(() => {
    if (!question || !isFunMode) return

    // 같은 과목의 문제를 최대 50개 로딩 (서바이벌용)
    const loadGameQuestions = async () => {
      let questions: Question[]

      if (question.subject) {
        questions = await db.questions
          .where('subject')
          .equals(question.subject)
          .toArray()
      } else {
        questions = await db.questions.toArray()
      }

      // 셔플해서 저장
      setGameQuestions(shuffleArray(questions).slice(0, 50))
    }

    loadGameQuestions()
  }, [question, isFunMode])

  // 북마크 초기 상태 로드
  useEffect(() => {
    if (!question || !user?.email) return

    getWrongNote(question.id, user.email).then((note) => {
      setIsBookmarked(note?.isBookmarked ?? false)
    })
  }, [question, user?.email])

  // 북마크 토글 핸들러
  async function handleBookmarkToggle() {
    if (!question || !user?.email) return
    const newBookmarked = await toggleBookmark(question.id, user.email, question)
    setIsBookmarked(newBookmarked)
  }

  // 게이미피케이션 결과 핸들러 — LevelUpOverlay/BadgeUnlockOverlay + 컨페티 트리거
  function handleGamificationResult(result: GamificationResult) {
    // Phase 18: 정답 시 컨페티 + quiz-complete VFX 이벤트
    if (result.xpAwarded > 0) {
      setShowConfetti(true)
      EventBus.emit('vfx:quiz-complete')
    }

    if (result.leveledUp) {
      setLevelUpInfo({ newLevel: result.newLevel })
    }
    if (result.unlockedBadges.length > 0) {
      // 첫 번째 뱃지만 표시 (레벨업이 있으면 레벨업 후에 뱃지 표시 — 3초 딜레이)
      const badgeDef = BADGE_DEFINITIONS.find(b => b.id === result.unlockedBadges[0])
      if (badgeDef) {
        if (result.leveledUp) {
          setTimeout(() => setUnlockedBadge(badgeDef), 3000)
        } else {
          setUnlockedBadge(badgeDef)
        }
      }
    }
  }

  // Phase 19: 모드 선택 핸들러
  const handleModeSelect = useCallback((mode: GameMode | 'normal') => {
    setSelectedMode(mode)

    if (mode === 'normal') {
      setView('normal')
      return
    }

    // 미니게임은 문제 불필요
    if (mode === 'miniGame') {
      setView('miniGame')
      return
    }

    // 문제가 충분한지 확인
    if (gameQuestions.length === 0) {
      // 문제가 아직 로딩 안 됐으면 대기
      setView(mode)
      return
    }

    setView(mode)
  }, [gameQuestions.length])

  // Phase 19: 게임 완료 핸들러
  const handleGameComplete = useCallback((result: GameSessionResult) => {
    setGameResult(result)
    // 신기록 여부는 GameResult 내부에서 처리 (saveGameRecord isPersonalBest)
    setIsPersonalBest(false) // 기본값 — 추후 getPersonalBest 비교 가능
    setView('result')
  }, [])

  // Phase 19: 다시 하기 핸들러 (같은 모드 재시작, 문제 재셔플)
  const handleRetry = useCallback(() => {
    setGameQuestions(prev => shuffleArray(prev))
    setGameResult(null)
    if (selectedMode && selectedMode !== 'normal') {
      setView(selectedMode)
    } else {
      setView('modeSelect')
    }
  }, [selectedMode])

  // Phase 19: 모드 선택으로 돌아가기
  const handleBackToModeSelect = useCallback(() => {
    setGameResult(null)
    setView('modeSelect')
  }, [])

  // 로딩 중 — Skeleton 카드 형태
  if (question === undefined) {
    return (
      <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32 rounded-full" />
          <Skeleton className="h-9 w-9 rounded-full" />
        </div>
        <Skeleton className="h-48 w-full rounded-2xl" />
        <div className="space-y-2.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-[52px] w-full rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>
    )
  }

  // 문제 없음 — 기출탭탭 스타일 빈 상태
  if (question === null) {
    return (
      <FadeIn className="p-4 md:p-6 max-w-3xl mx-auto">
        <AnimatedCard className="p-8 text-center space-y-4">
          <div className="text-5xl">🔍</div>
          <p className="text-lg font-semibold">문제를 찾을 수 없습니다</p>
          <p className="text-sm text-muted-foreground">존재하지 않거나 삭제된 문제입니다</p>
          <Button variant="outline" className="rounded-xl" onClick={() => navigate('/student/problems')}>
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            목록으로 돌아가기
          </Button>
        </AnimatedCard>
      </FadeIn>
    )
  }

  // ─── FunMode OFF: 기존 QuizPlayer 직접 렌더링 ──────────────────────────────
  if (!isFunMode) {
    return (
      <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-4">
        {/* 페이지 헤더: 과목/단원 뱃지 + 문제 풀기 타이틀 + 북마크 버튼 */}
        <FadeIn className="flex items-center justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              {question.subject && (
                <Badge className="rounded-full bg-primary/10 text-primary border-0 px-3 text-xs font-medium">
                  {question.subject}
                </Badge>
              )}
              {question.unit && (
                <Badge variant="outline" className="rounded-full px-3 text-xs">
                  {question.unit}
                </Badge>
              )}
            </div>
            <h1 className="text-lg font-semibold">문제 풀기</h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-xl"
            onClick={handleBookmarkToggle}
            aria-label={isBookmarked ? '북마크 해제' : '북마크 추가'}
          >
            <Bookmark
              className={isBookmarked ? 'fill-primary text-primary' : 'text-muted-foreground'}
            />
          </Button>
        </FadeIn>

        {/* 퀴즈 플레이어 */}
        <QuizPlayer
          question={question}
          studentId={studentId}
          onBack={() => navigate('/student/problems')}
          onGamificationResult={handleGamificationResult}
        />
      </div>
    )
  }

  // ─── FunMode ON: 게임 모드 분기 ──────────────────────────────────────────

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-4">
      {/* 모드 선택 화면 */}
      {view === 'modeSelect' && (
        <GameModeSelector
          onSelectMode={handleModeSelect}
          questions={gameQuestions}
        />
      )}

      {/* 일반 모드 (FunMode ON이지만 일반 모드 선택) */}
      {view === 'normal' && (
        <>
          <FadeIn className="flex items-center justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 flex-wrap">
                {question.subject && (
                  <Badge className="rounded-full bg-primary/10 text-primary border-0 px-3 text-xs font-medium">
                    {question.subject}
                  </Badge>
                )}
                {question.unit && (
                  <Badge variant="outline" className="rounded-full px-3 text-xs">
                    {question.unit}
                  </Badge>
                )}
              </div>
              <h1 className="text-lg font-semibold">문제 풀기</h1>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-xl"
              onClick={handleBookmarkToggle}
              aria-label={isBookmarked ? '북마크 해제' : '북마크 추가'}
            >
              <Bookmark
                className={isBookmarked ? 'fill-primary text-primary' : 'text-muted-foreground'}
              />
            </Button>
          </FadeIn>

          <QuizPlayer
            question={question}
            studentId={studentId}
            onBack={handleBackToModeSelect}
            onGamificationResult={handleGamificationResult}
          />
        </>
      )}

      {/* 타임어택 모드 */}
      {view === 'timeAttack' && (
        <Suspense fallback={<GameModeLoading />}>
          <TimeAttackMode
            questions={gameQuestions}
            studentId={studentId}
            onComplete={handleGameComplete}
            onBack={handleBackToModeSelect}
          />
        </Suspense>
      )}

      {/* 서바이벌 모드 */}
      {view === 'survival' && (
        <Suspense fallback={<GameModeLoading />}>
          <SurvivalMode
            questions={gameQuestions}
            studentId={studentId}
            onComplete={handleGameComplete}
            onBack={handleBackToModeSelect}
          />
        </Suspense>
      )}

      {/* 보스배틀 모드 */}
      {view === 'bossBattle' && (
        <Suspense fallback={<GameModeLoading />}>
          <BossBattleMode
            questions={gameQuestions}
            studentId={studentId}
            onComplete={handleGameComplete}
            onBack={handleBackToModeSelect}
          />
        </Suspense>
      )}

      {/* 미니게임 모드 */}
      {view === 'miniGame' && (
        <Suspense fallback={<GameModeLoading />}>
          <MiniGameMode
            studentId={studentId}
            onComplete={handleGameComplete}
            onBack={handleBackToModeSelect}
          />
        </Suspense>
      )}

      {/* 결과 화면 */}
      {view === 'result' && gameResult && (
        <Suspense fallback={<GameModeLoading />}>
          <GameResult
            mode={gameResult.mode}
            correctCount={gameResult.correctCount}
            totalQuestions={gameResult.totalQuestions}
            score={gameResult.score}
            xpEarned={gameResult.xpEarned}
            timeElapsed={gameResult.timeElapsed}
            isPersonalBest={isPersonalBest}
            metadata={gameResult.metadata}
            onRetry={handleRetry}
            onModeSelect={handleBackToModeSelect}
            onHome={() => navigate('/student')}
          />
        </Suspense>
      )}

      {/* FunMode 게이미피케이션 오버레이 (모든 뷰에서 표시) */}
      <Suspense fallback={null}>
        <ConfettiEffect fire={showConfetti} />
      </Suspense>

      <LevelUpOverlay
        newLevel={levelUpInfo?.newLevel ?? 1}
        visible={levelUpInfo !== null}
        onDone={() => setLevelUpInfo(null)}
      />
      <BadgeUnlockOverlay
        badge={unlockedBadge}
        visible={unlockedBadge !== null}
        onDone={() => setUnlockedBadge(null)}
      />
    </div>
  )
}
