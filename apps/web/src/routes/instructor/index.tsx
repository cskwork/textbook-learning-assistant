/**
 * 강사 홈 페이지
 *
 * Phase 1 플레이스홀더 — 관리 패널 스켈레톤
 * Phase 2 이상에서 실제 데이터로 채워질 예정
 */

import { Users, BookOpen, BarChart2, PlusCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'

export default function InstructorHomePage() {
  const { user } = useAuth()

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
        <Button className="shrink-0" disabled>
          <PlusCircle className="w-4 h-4 mr-2" />
          문제 출제
        </Button>
      </div>

      {/* 요약 통계 카드 그리드 */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">등록 학생 수</span>
            </div>
            <div className="h-6 bg-muted rounded animate-pulse" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">출제한 문제</span>
            </div>
            <div className="h-6 bg-muted rounded animate-pulse" />
          </CardContent>
        </Card>

        <Card className="col-span-2 md:col-span-1">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <BarChart2 className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">평균 정답률</span>
            </div>
            <div className="h-6 bg-muted rounded animate-pulse" />
          </CardContent>
        </Card>
      </div>

      {/* 최근 활동 섹션 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">최근 학생 활동</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
          <p className="text-xs text-muted-foreground text-center mt-4">
            Phase 2에서 실제 학생 관리 기능이 추가됩니다
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
