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
        // 블러 강화 — BottomNav 기출탭탭 스타일
        'bg-white/90 dark:bg-card/85 backdrop-blur-2xl',
        // 더 미묘한 상단 구분선
        'border-t border-border/30',
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
                'text-[10px] transition-all duration-300 ease-out',
                'min-w-0 px-1',
                isActive
                  ? 'text-primary font-bold'
                  : 'text-muted-foreground/50 font-semibold hover:text-muted-foreground/70',
              )
            }
          >
            {({ isActive }) => (
              <>
                {/* 상단 인디케이터 바 — 더 넓고 둥글게 */}
                <span
                  className={cn(
                    'absolute top-0 left-1/2 -translate-x-1/2 h-[3px] rounded-b-full transition-all duration-300',
                    isActive ? 'w-10 bg-primary' : 'w-0 bg-transparent',
                  )}
                />

                {/* 아이콘 컨테이너 — rounded-xl + primary/12 배경 */}
                <div className={cn(
                  'w-9 h-7 rounded-xl flex items-center justify-center transition-all duration-300',
                  isActive && 'bg-primary/12',
                )}>
                  <Icon
                    className={cn(
                      'shrink-0 transition-all duration-300',
                      // 활성 시 w-5 h-5, 비활성 시 w-[19px] h-[19px]
                      isActive ? 'w-5 h-5 text-primary' : 'w-[19px] h-[19px] text-muted-foreground/60',
                    )}
                  />
                </div>

                <span className={cn(
                  'truncate tracking-wide transition-all duration-300',
                  isActive && 'text-primary',
                )}>
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        )
      })}
    </nav>
  )
}
