// apps/web/src/routes/student/quiz/index.tsx
// 퀴즈 플레이어 페이지 — useParams(:id) + QuizPlayer + 북마크 + 기출탭탭 스타일
// Phase 16: 게이미피케이션 오버레이 (FunMode 시 LevelUpOverlay + BadgeUnlockOverlay)
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router'
import { Bookmark, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { QuizPlayer } from '@/components/quiz/QuizPlayer'
import { FadeIn } from '@/components/motion/FadeIn'
import { AnimatedCard } from '@/components/motion/AnimatedCard'
import { useAuth } from '@/contexts/AuthContext'
import { useFunMode } from '@/hooks/useFunMode'
import { db, type Question } from '@/lib/db'
import { getWrongNote, toggleBookmark } from '@/services/wrongNote.service'
import { LevelUpOverlay, BadgeUnlockOverlay } from '@/components/gamification'
import { BADGE_DEFINITIONS, type BadgeDefinition } from '@/lib/gamification/badge-definitions'
import type { GamificationResult } from '@/components/quiz/QuizPlayer'

export default function QuizPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { isFunMode } = useFunMode()

  const [question, setQuestion] = useState<Question | null | undefined>(undefined) // undefined=로딩중, null=없음
  const [isBookmarked, setIsBookmarked] = useState(false)

  // 게이미피케이션 오버레이 상태
  const [levelUpInfo, setLevelUpInfo] = useState<{ newLevel: number } | null>(null)
  const [unlockedBadge, setUnlockedBadge] = useState<BadgeDefinition | null>(null)

  // 문제 로드
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

  // 게이미피케이션 결과 핸들러 — LevelUpOverlay/BadgeUnlockOverlay 트리거
  function handleGamificationResult(result: GamificationResult) {
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
        studentId={user?.email ?? ''}
        onBack={() => navigate('/student/problems')}
        onGamificationResult={handleGamificationResult}
      />

      {/* FunMode 게이미피케이션 오버레이 */}
      {isFunMode && (
        <>
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
        </>
      )}
    </div>
  )
}
