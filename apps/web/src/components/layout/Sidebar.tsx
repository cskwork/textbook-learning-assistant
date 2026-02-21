import { NavLink } from 'react-router'
import { Home, BookOpen, BarChart2, User, LogOut, GraduationCap } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { NavItem } from './BottomNav'

const defaultNavItems: NavItem[] = [
  { path: '/', label: '홈', icon: Home },
  { path: '/problems', label: '문제', icon: BookOpen },
  { path: '/progress', label: '성적', icon: BarChart2 },
  { path: '/profile', label: '내 정보', icon: User },
]

interface SidebarProps {
  items?: NavItem[]
  className?: string
  onLogout?: () => void
}

export default function Sidebar({
  items = defaultNavItems,
  className,
  onLogout,
}: SidebarProps) {
  return (
    <aside
      className={cn(
        'hidden lg:flex',
        'fixed left-0 inset-y-0 z-50',
        'w-64 flex-col',
        // 블러 강화 — 기출탭탭 스타일
        'bg-white/90 dark:bg-card/70 backdrop-blur-2xl',
        'border-r border-border/50',
        className,
      )}
      aria-label="사이드바 네비게이션"
    >
      {/* ── 앱 로고 ── */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-border/30">
        {/* 로고 아이콘 w-10 h-10 rounded-xl (기존 w-9 h-9) */}
        <div className="w-10 h-10 rounded-xl cta-gradient flex items-center justify-center shadow-md shadow-primary/15 shrink-0">
          <GraduationCap className="w-5 h-5 text-white" />
        </div>
        <div className="min-w-0">
          {/* 앱 이름 text-base font-extrabold (기존 text-sm) */}
          <p className="text-base font-extrabold text-foreground truncate tracking-tight">기출 학습 도우미</p>
          {/* 서브 텍스트 더 연하게 */}
          <p className="text-xs text-muted-foreground/60 truncate">수학 기출문제 학습</p>
        </div>
      </div>

      {/* ── 네비게이션 ── */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {items.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end
              className={({ isActive }) =>
                cn(
                  'group flex items-center gap-3 px-3 py-3 rounded-xl',
                  'text-sm transition-all duration-200 ease-out',
                  isActive
                    ? 'bg-primary/10 text-primary font-bold shadow-sm'
                    : 'text-muted-foreground font-medium hover:bg-muted/50 hover:text-foreground',
                )
              }
            >
              {({ isActive }) => (
                <>
                  {/* 아이콘 배경 rounded-xl (기존 rounded-lg) */}
                  <div className={cn(
                    'w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200',
                    isActive
                      ? 'bg-primary/15'
                      : 'bg-transparent group-hover:bg-muted',
                  )}>
                    <Icon
                      className={cn(
                        'w-[18px] h-[18px] transition-all duration-200',
                        isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground',
                      )}
                    />
                  </div>
                  <span className="truncate">{item.label}</span>
                  {/* 활성 도트 인디케이터 w-2 h-2 (기존 w-1.5 h-1.5) */}
                  {isActive && (
                    <div className="ml-auto w-2 h-2 rounded-full bg-primary" />
                  )}
                </>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* ── 로그아웃 ── */}
      <div className="px-3 py-4 border-t border-border/40">
        <button
          onClick={onLogout}
          className={cn(
            'group flex items-center gap-3 px-3 py-2.5 rounded-xl w-full',
            'text-sm font-medium transition-all duration-200',
            'text-muted-foreground hover:bg-destructive/8 hover:text-destructive',
          )}
          type="button"
        >
          <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-destructive/10 transition-colors">
            <LogOut className="w-[18px] h-[18px]" />
          </div>
          <span>로그아웃</span>
        </button>
      </div>

    </aside>
  )
}
