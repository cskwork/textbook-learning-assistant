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
        <header className={cn(
          'fixed top-0 inset-x-0 z-50',
          // BottomNav/Sidebar와 일관된 블러 패턴
          'bg-white/90 dark:bg-card/85 backdrop-blur-2xl',
          'border-b border-border/20',
          'h-14 flex items-center px-4',
        )}>
          {/* 돌아가기 버튼: min-h-[44px] min-w-[44px] 터치 타겟 보장 (LYOT-02) */}
          <button
            onClick={() => navigate(-1)}
            className={cn(
              'flex items-center gap-1.5 text-sm font-semibold',
              'text-muted-foreground hover:text-foreground transition-colors',
              'rounded-lg px-2 -ml-2',
              'min-h-[44px] min-w-[44px]',
              'hover:bg-muted/50',
            )}
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
          // 블러 강화 — BottomNav/Sidebar와 일관된 패턴
          'bg-white/90 dark:bg-card/85 backdrop-blur-2xl',
          // 더 미묘한 하단 구분선
          'border-b border-border/20',
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

          {/* 우측 아이콘 버튼 — w-10 h-10으로 터치 타겟 확보 (LYOT-02) */}
          <div className="flex items-center gap-1">
            {profilePath && (
              <button
                onClick={() => navigate(profilePath)}
                className={cn(
                  'flex items-center justify-center',
                  // w-10 h-10 (기존 w-9 h-9 → 40px 터치 타겟)
                  'w-10 h-10 rounded-xl',
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
                  // w-10 h-10 (기존 w-9 h-9 → 40px 터치 타겟)
                  'w-10 h-10 rounded-xl',
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
      {/* flex-1 flex flex-col min-h-0 구조로 스크롤 영역 올바르게 작동 보장 */}
      <main className={cn(
        "flex-1 flex flex-col min-h-0",
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
