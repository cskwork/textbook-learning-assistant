import { NavLink } from 'react-router'
import { Home, BookOpen, BarChart2, User } from 'lucide-react'
import { cn } from '@/lib/utils'

// 네비게이션 탭 항목 타입
export interface NavItem {
  path: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

// 기본 네비게이션 항목 (역할별로 동적으로 교체 가능)
const defaultNavItems: NavItem[] = [
  { path: '/', label: '홈', icon: Home },
  { path: '/problems', label: '문제', icon: BookOpen },
  { path: '/progress', label: '성적', icon: BarChart2 },
  { path: '/profile', label: '내 정보', icon: User },
]

interface BottomNavProps {
  items?: NavItem[]
  className?: string
}

// 모바일/태블릿 하단 탭바 — lg: 이상에서 숨김 (lg:hidden)
export default function BottomNav({
  items = defaultNavItems,
  className,
}: BottomNavProps) {
  return (
      <nav
        className={cn(
          'fixed bottom-0 inset-x-0 z-50',
          'bg-background/85 backdrop-blur-md border-t border-border',
          'flex items-stretch',
          'h-16',
          'lg:hidden mb-safe',
          className,
        )}
        aria-label="하단 탭바 네비게이션"
      >
        {items.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end
              className={({ isActive }) =>
                cn(
                  'relative flex flex-col items-center justify-center flex-1 gap-1',
                  'text-xs font-medium transition-all duration-300 ease-out',
                  'min-w-0 px-1',
                  isActive
                    ? 'text-primary transform -translate-y-0.5'
                    : 'text-muted-foreground hover:text-foreground',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={cn(
                      'w-5 h-5 shrink-0 transition-transform duration-300',
                      isActive ? 'text-primary scale-110 drop-shadow-sm' : 'text-muted-foreground',
                    )}
                  />
                  <span className={cn('truncate', isActive && 'font-semibold tracking-wide')}>{item.label}</span>
                  {isActive && (
                    <span className="absolute -top-px left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-b-full shadow-[0_0_8px_rgba(var(--primary),0.6)]" />
                  )}
              </>
            )}
          </NavLink>
        )
      })}
    </nav>
  )
}
