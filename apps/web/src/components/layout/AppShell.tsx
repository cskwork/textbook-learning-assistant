import type { ReactNode } from 'react'
import { Outlet, useLocation } from 'react-router'
import { LogOut, GraduationCap, ArrowLeft, User } from 'lucide-react'
import { useNavigate } from 'react-router'
import { cn } from '@/lib/utils'
import BottomNav from './BottomNav'
import Sidebar from './Sidebar'
import type { NavItem } from './BottomNav'
import { FunModeToggleButton } from './FunModeToggleButton'
import { useFunMode } from '@/hooks/useFunMode'
import { useGamification } from '@/hooks/useGamification'
import { useAuth } from '@/contexts/AuthContext'
import { XPBar } from '@/components/gamification'

interface AppShellProps {
  children?: ReactNode
  navItems?: NavItem[]
  onLogout?: () => void
  profilePath?: string
}

export default function AppShell({ children, navItems, onLogout, profilePath }: AppShellProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { isFunMode } = useFunMode()
  const { user } = useAuth()
  const { profile, xpProgress, xpForNextLevel } = useGamification(user?.email)

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
            {/* 반전 모드 토글 버튼 (v3.0) */}
            <FunModeToggleButton />
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

      {/* ── FunMode XP 바 — 헤더 바로 아래 (standard mode 전용) ── */}
      {/* z-39: 헤더(z-40) 바로 아래, 스크롤 시 헤더 밑에 위치 */}
      {isFunMode && !isFocusMode && profile && (
        <div className={cn(
          'fixed z-[39]',
          'top-14 inset-x-0',
          // 데스크톱(lg)에서는 사이드바(64) 오른쪽에 배치
          'lg:top-0 lg:left-64',
          'px-4 py-1 bg-background/80 backdrop-blur-sm border-b border-border/10',
        )}>
          <XPBar
            progress={xpProgress}
            level={profile.level}
            currentXPInLevel={Math.round(xpProgress * xpForNextLevel)}
            xpForNextLevel={xpForNextLevel}
          />
        </div>
      )}

      {/* ── 메인 콘텐츠 ── */}
      {/* flex-1 flex flex-col min-h-0 구조로 스크롤 영역 올바르게 작동 보장 */}
      <main className={cn(
        "flex-1 flex flex-col min-h-0",
        isFocusMode
          ? "pt-14 pb-0 lg:pl-0"
          : isFunMode
            // FunMode ON: XPBar 높이(~40px) 만큼 추가 패딩
            ? "pt-[calc(3.5rem+2.5rem)] pb-16 lg:pt-10 lg:pb-0 lg:pl-64"
            // FunMode OFF: 기존 패딩 유지
            : "pt-14 pb-16 lg:pt-0 lg:pb-0 lg:pl-64"
      )}>
        {children ?? <Outlet />}
      </main>

      {!isFocusMode && <BottomNav items={navItems} />}
    </div>
  )
}
