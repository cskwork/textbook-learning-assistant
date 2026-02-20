import type { ReactNode } from 'react'
import { Outlet, useLocation } from 'react-router'
import { LogOut, GraduationCap, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router'
import { cn } from '@/lib/utils'
import BottomNav from './BottomNav'
import Sidebar from './Sidebar'
import type { NavItem } from './BottomNav'

interface AppShellProps {
  children?: ReactNode
  navItems?: NavItem[]
  onLogout?: () => void
}

export default function AppShell({ children, navItems, onLogout }: AppShellProps) {
  const location = useLocation()
  const navigate = useNavigate()
  
  // Check if current route demands Focus Mode
  const isFocusMode = location.pathname.includes('/quiz') || location.pathname.includes('/play') || location.pathname.includes('/problems/')

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* -------------------- FOCUS MODE -------------------- */}
      {isFocusMode && (
        <header className="fixed top-0 inset-x-0 z-50 bg-background/90 backdrop-blur-md border-b border-border/40 h-14 flex items-center px-4">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>돌아가기</span>
          </button>
        </header>
      )}

      {/* ------------------ STANDARD MODE ------------------- */}
      {!isFocusMode && <Sidebar items={navItems} onLogout={onLogout} />}

      {!isFocusMode && (
        <header className={cn(
          'fixed top-0 inset-x-0 z-40',
          'bg-background/80 backdrop-blur-md border-b border-border',
          'flex items-center justify-between',
          'h-14 px-4',
          'lg:hidden',
        )}>
          {/* 앱 로고 */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shrink-0">
              <GraduationCap className="w-4 h-4 text-primary-foreground" />
            </div>
            <p className="text-sm font-bold text-foreground">기출 학습 도우미</p>
          </div>

          {/* 로그아웃 버튼 */}
          {onLogout && (
            <button
              onClick={onLogout}
              className={cn(
                'flex items-center justify-center',
                'w-9 h-9 rounded-lg',
                'text-muted-foreground hover:text-destructive hover:bg-accent',
                'transition-colors',
              )}
              type="button"
              aria-label="로그아웃"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </header>
      )}

      {/* 메인 콘텐츠 영역 */}
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
