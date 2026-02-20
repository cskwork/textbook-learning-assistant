/**
 * 학생 홈 페이지
 *
 * Phase 1 플레이스홀더 — 학습 현황 대시보드 스켈레톤
 * Phase 2 이상에서 실제 데이터로 채워질 예정
 */

import { BookOpenCheck, TrendingUp, Target, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'

export default function StudentHomePage() {
  const { user } = useAuth()

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      {/* 환영 메시지 */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">안녕하세요!</h1>
        <p className="text-muted-foreground mt-1">
          {user?.email} 님의 학습 현황입니다.
        </p>
      </div>

      {/* 요약 통계 카드 그리드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <BookOpenCheck className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">오늘 푼 문제</span>
            </div>
            <div className="h-6 bg-muted rounded animate-pulse" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">정답률</span>
            </div>
            <div className="h-6 bg-muted rounded animate-pulse" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">연속 학습</span>
            </div>
            <div className="h-6 bg-muted rounded animate-pulse" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">학습 시간</span>
            </div>
            <div className="h-6 bg-muted rounded animate-pulse" />
          </CardContent>
        </Card>
      </div>

      {/* 추천 문제 섹션 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">AI 추천 문제</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
          <p className="text-xs text-muted-foreground text-center mt-4">
            Phase 2에서 실제 문제 추천 기능이 추가됩니다
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
