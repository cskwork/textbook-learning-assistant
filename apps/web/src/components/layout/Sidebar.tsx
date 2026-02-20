import { NavLink } from 'react-router'
import { Home, BookOpen, BarChart2, User, LogOut, GraduationCap } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { NavItem } from './BottomNav'

// 기본 네비게이션 항목 (BottomNav와 동일한 항목)
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

// 데스크톱 전용 사이드바 — hidden lg:flex, 모바일/태블릿에서 숨김
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
        'bg-sidebar border-r border-sidebar-border',
        className,
      )}
      aria-label="사이드바 네비게이션"
    >
      {/* 앱 로고 / 이름 영역 */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-sidebar-border">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
          <GraduationCap className="w-5 h-5 text-primary-foreground" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-sidebar-foreground truncate">기출 학습 도우미</p>
          <p className="text-xs text-muted-foreground truncate">수학 기출문제 학습</p>
        </div>
      </div>

      {/* 네비게이션 항목 */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {items.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg',
                  'text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-accent text-primary'
                    : 'text-sidebar-foreground hover:bg-accent hover:text-accent-foreground',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={cn(
                      'w-5 h-5 shrink-0',
                      isActive ? 'text-primary' : 'text-muted-foreground',
                    )}
                  />
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* 하단 로그아웃 버튼 자리 (Phase 01-03~04에서 연결) */}
      <div className="px-3 py-4 border-t border-sidebar-border">
        <button
          onClick={onLogout}
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg w-full',
            'text-sm font-medium transition-colors',
            'text-muted-foreground hover:bg-accent hover:text-destructive',
          )}
          type="button"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          <span>로그아웃</span>
        </button>
      </div>
    </aside>
  )
}
