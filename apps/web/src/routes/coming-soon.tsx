/**
 * 준비 중 페이지
 */

import { Construction, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router'

export default function ComingSoonPage() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center animate-fade-up stagger-1">
      <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center mb-5">
        <Construction className="w-8 h-8 text-amber-500" />
      </div>
      <h1 className="text-xl font-extrabold text-foreground mb-2 tracking-tight">준비 중입니다</h1>
      <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
        이 기능은 현재 개발 중입니다.<br />곧 만나볼 수 있어요!
      </p>
      <button
        onClick={() => navigate(-1)}
        className="mt-6 flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline underline-offset-4 decoration-2"
      >
        <ArrowLeft className="w-4 h-4" />
        돌아가기
      </button>
    </div>
  )
}
