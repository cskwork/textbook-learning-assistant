import { useState } from 'react'
import { NavLink } from 'react-router'
import { Home, BookOpen, BarChart2, User, LogOut, GraduationCap, Monitor } from 'lucide-react'
import { cn } from '@/lib/utils'
import { isDesktopApp } from '@/lib/platform'
import { DesktopDownloadDialog } from '@/components/desktop/DesktopDownloadDialog'
import { FunModeToggleButton } from './FunModeToggleButton'
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
  const [showDownload, setShowDownload] = useState(false)
  const showDesktopButton = !isDesktopApp()

  return (
    <aside
      className={cn(
        'hidden lg:flex',
        'fixed left-0 inset-y-0 z-50',
        'w-64 flex-col',
        // 솔리드 배경 — Phase 3 리파인먼트
        'bg-white dark:bg-card',
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
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        {/* 학습 섹션 */}
        <p className="px-3 pb-2 text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-wider">학습</p>
        <div className="space-y-0.5">
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
                    ? 'bg-primary/10 text-primary font-bold shadow-sm border-l-3 border-primary'
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
                </>
              )}
            </NavLink>
          )
        })}
        </div>
      </nav>

      {/* ── 하단 액션 ── */}
      <div className="px-3 py-4 border-t border-border/40 space-y-1">
        {/* 게임 모드 토글 — 데스크톱 앱 버튼 바로 위 고정 */}
        <FunModeToggleButton variant="sidebar" />

        {/* 데스크톱 앱 다운로드 버튼 (웹에서만 표시) */}
        {showDesktopButton && (
          <button
            onClick={() => setShowDownload(true)}
            className={cn(
              'group flex items-center gap-3 px-3 py-2.5 rounded-xl w-full',
              'text-sm font-medium transition-all duration-200',
              'text-muted-foreground hover:bg-primary/8 hover:text-primary',
            )}
            type="button"
          >
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
              <Monitor className="w-[18px] h-[18px]" />
            </div>
            <span>데스크톱 앱</span>
          </button>
        )}
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

      {/* 데스크톱 다운로드 다이얼로그 */}
      <DesktopDownloadDialog open={showDownload} onOpenChange={setShowDownload} />
    </aside>
  )
}
