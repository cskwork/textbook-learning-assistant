import type { ReactNode } from 'react'
import { Outlet, useLocation } from 'react-router'
import { LogOut, GraduationCap, ArrowLeft, User } from 'lucide-react'
import { useNavigate } from 'react-router'
import { cn } from '@/lib/utils'
import BottomNav from './BottomNav'
import Sidebar from './Sidebar'
import type { NavItem } from './BottomNav'

interface AppShellProps {
  children?: ReactNode
  navItems?: NavItem[]
  onLogout?: () => void
  profilePath?: string
}

export default function AppShell({ children, navItems, onLogout, profilePath }: AppShellProps) {
  const location = useLocation()
  const navigate = useNavigate()

  const isFocusMode = location.pathname.includes('/quiz') || location.pathname.includes('/play') || location.pathname.includes('/problems/')

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* ── FOCUS MODE 헤더 ── */}
      {isFocusMode && (
        <header className="fixed top-0 inset-x-0 z-50 bg-white/80 dark:bg-card/80 backdrop-blur-xl border-b border-border/30 h-14 flex items-center px-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors rounded-lg px-2 py-1.5 -ml-2 hover:bg-muted/50"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>돌아가기</span>
          </button>
        </header>
      )}

      {/* ── STANDARD MODE ── */}
      {!isFocusMode && <Sidebar items={navItems} onLogout={onLogout} />}

      {!isFocusMode && (
        <header className={cn(
          'fixed top-0 inset-x-0 z-40',
          'bg-white/80 dark:bg-card/80 backdrop-blur-xl',
          'border-b border-border/30',
          'flex items-center justify-between',
          'h-14 px-4',
          'lg:hidden',
        )}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl cta-gradient flex items-center justify-center shadow-sm shadow-primary/15 shrink-0">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <p className="text-sm font-extrabold text-foreground tracking-tight">기출 학습 도우미</p>
          </div>

          <div className="flex items-center gap-1">
            {profilePath && (
              <button
                onClick={() => navigate(profilePath)}
                className={cn(
                  'flex items-center justify-center',
                  'w-9 h-9 rounded-xl',
                  'text-muted-foreground/60 hover:text-primary hover:bg-primary/8',
                  'transition-all duration-200',
                )}
                type="button"
                aria-label="마이페이지"
              >
                <User className="w-4 h-4" />
              </button>
            )}
            {onLogout && (
              <button
                onClick={onLogout}
                className={cn(
                  'flex items-center justify-center',
                  'w-9 h-9 rounded-xl',
                  'text-muted-foreground/60 hover:text-destructive hover:bg-destructive/8',
                  'transition-all duration-200',
                )}
                type="button"
                aria-label="로그아웃"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </header>
      )}

      {/* ── 메인 콘텐츠 ── */}
      <main className={cn(
        "flex-1 flex flex-col",
        isFocusMode
          ? "pt-14 pb-0 lg:pl-0"
          : "pt-14 pb-16 lg:pt-0 lg:pb-0 lg:pl-64"
      )}>
        {children ?? <Outlet />}
      </main>

      {!isFocusMode && <BottomNav items={navItems} />}
    </div>
  )
}
