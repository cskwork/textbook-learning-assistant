import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// 임시 홈 페이지 — AppShell 렌더링 확인용
export default function HomePage() {
  return (
    <div className="p-4 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-primary">수학 기출 학습 도우미</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Phase 1: 기반 인프라 + 인증 구축 중
          </p>
          <Button>시작하기</Button>
          <Button variant="outline" className="ml-2">자세히 보기</Button>
        </CardContent>
      </Card>
    </div>
  )
}
