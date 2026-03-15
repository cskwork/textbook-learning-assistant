import { NavLink } from 'react-router'
import { Home, BookOpen, BarChart2, User } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface NavItem {
  path: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

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

export default function BottomNav({
  items = defaultNavItems,
  className,
}: BottomNavProps) {
  return (
    <nav
      className={cn(
        'fixed bottom-0 inset-x-0 z-50',
        // 솔리드 배경 — Phase 3 리파인먼트
        'bg-white dark:bg-card',
        // 상단 구분선
        'border-t border-border/50',
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
                'relative flex flex-col items-center justify-center flex-1 gap-0.5',
                // 최소 터치 타겟 48px (LYOT-02)
                'min-h-[48px]',
                'text-[11px] transition-all duration-300 ease-out',
                'min-w-0 px-1',
                isActive
                  ? 'text-primary font-bold'
                  : 'text-muted-foreground/50 font-semibold hover:text-muted-foreground/70',
              )
            }
          >
            {({ isActive }) => (
              <>
                {/* pill 인디케이터 — 활성 시 아이콘+라벨 감싸기 */}
                <div className={cn(
                  'flex flex-col items-center gap-0.5 px-3 py-1 rounded-2xl transition-all duration-300',
                  isActive && 'bg-primary/10',
                )}>
                  <Icon
                    className={cn(
                      'shrink-0 transition-all duration-300',
                      isActive ? 'w-6 h-6 text-primary' : 'w-5 h-5 text-muted-foreground/60',
                    )}
                  />
                  <span className={cn(
                    'truncate tracking-wide transition-all duration-300',
                    isActive && 'text-primary',
                  )}>
                    {item.label}
                  </span>
                </div>
              </>
            )}
          </NavLink>
        )
      })}
    </nav>
  )
}
