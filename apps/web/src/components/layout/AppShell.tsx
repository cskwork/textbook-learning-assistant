import type { ReactNode } from 'react'
import { Outlet } from 'react-router'
import { LogOut, GraduationCap } from 'lucide-react'
import { cn } from '@/lib/utils'
import BottomNav from './BottomNav'
import Sidebar from './Sidebar'
import type { NavItem } from './BottomNav'

interface AppShellProps {
  children?: ReactNode
  // 역할별 동적 메뉴 항목
  navItems?: NavItem[]
  onLogout?: () => void
}

/**
 * 반응형 앱 셸 컴포넌트
 *
 * 레이아웃 전략 (태블릿 우선):
 * - base/md (~1023px): 모바일 + 태블릿 — 하단 탭바 + 상단 헤더(로그아웃)
 * - lg (1024px+): 데스크톱 — 사이드바(로그아웃 포함), 메인에 좌측 패딩 (pl-64)
 *
 * 로그아웃 접근:
 * - 모바일/태블릿: 상단 헤더 우측 로그아웃 아이콘 버튼
 * - 데스크톱: 사이드바 하단 로그아웃 버튼
 */
export default function AppShell({ children, navItems, onLogout }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* 데스크톱: 좌측 사이드바 (hidden lg:flex) */}
      <Sidebar items={navItems} onLogout={onLogout} />

      {/* 모바일/태블릿: 상단 헤더 (lg:hidden) */}
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

      {/* 메인 콘텐츠 영역
          - 모바일/태블릿: 상단 헤더(h-14) + 하단 탭바(h-16) 패딩
          - 데스크톱: 사이드바 너비(w-64)만큼 좌측 패딩
      */}
      <main className="pt-14 pb-16 lg:pt-0 lg:pb-0 lg:pl-64">
        {children ?? <Outlet />}
      </main>

      {/* 모바일/태블릿: 하단 탭바 (lg:hidden) */}
      <BottomNav items={navItems} />
    </div>
  )
}
