/**
 * AvatarDisplay — 이모지 또는 이니셜 기반 아바타 표시 컴포넌트
 *
 * - avatarEmoji가 있으면 이모지를 둥근 원 안에 표시 (bg-primary/10)
 * - 없으면 name(또는 email)의 첫 2글자를 이니셜로 표시 (bg-primary, text-primary-foreground)
 */

import { cn } from '@/lib/utils'

type AvatarSize = 'sm' | 'md' | 'lg'

interface AvatarDisplayProps {
  email: string
  name?: string
  avatarEmoji?: string
  size?: AvatarSize
  className?: string
}

const sizeClasses: Record<AvatarSize, string> = {
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-16 h-16 text-2xl',
}

/**
 * 이니셜 추출 — name 또는 email에서 앞 2글자 반환
 */
function getInitials(name?: string, email?: string): string {
  const source = name || email || '?'
  return source.slice(0, 2).toUpperCase()
}

export function AvatarDisplay({ email, name, avatarEmoji, size = 'md', className }: AvatarDisplayProps) {
  const sizeClass = sizeClasses[size]

  if (avatarEmoji) {
    return (
      <div
        className={cn(
          'rounded-full flex items-center justify-center bg-primary/10 select-none flex-shrink-0',
          sizeClass,
          className,
        )}
        aria-label={`아바타: ${avatarEmoji}`}
      >
        {avatarEmoji}
      </div>
    )
  }

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center bg-primary text-primary-foreground font-semibold select-none flex-shrink-0',
        sizeClass,
        className,
      )}
      aria-label={`이니셜 아바타: ${getInitials(name, email)}`}
    >
      {getInitials(name, email)}
    </div>
  )
}
