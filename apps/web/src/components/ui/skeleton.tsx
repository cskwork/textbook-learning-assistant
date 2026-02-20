import { cn } from '@/lib/utils'

/**
 * shimmer 애니메이션 로딩 스켈레톤 컴포넌트
 *
 * shadcn skeleton 패턴 기반에 skeleton-shimmer 애니메이션 강화.
 * index.css에 @keyframes skeleton-shimmer 정의 필요.
 */
function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('skeleton-shimmer rounded-xl', className)}
      {...props}
    />
  )
}

export { Skeleton }
