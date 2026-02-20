/**
 * 준비 중 페이지
 *
 * 아직 구현되지 않은 기능에 접근할 때 표시되는 플레이스홀더 페이지.
 */

import { Construction } from 'lucide-react'

export default function ComingSoonPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
        <Construction className="w-8 h-8 text-primary" />
      </div>
      <h1 className="text-xl font-bold text-foreground mb-2">준비 중입니다</h1>
      <p className="text-sm text-muted-foreground max-w-xs">
        이 기능은 현재 개발 중입니다. 곧 만나볼 수 있어요!
      </p>
    </div>
  )
}
