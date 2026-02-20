import type { ReactNode } from 'react'
import { Outlet } from 'react-router'
import BottomNav from './BottomNav'
import Sidebar from './Sidebar'
import type { NavItem } from './BottomNav'

interface AppShellProps {
  children?: ReactNode
  // 역할별 동적 메뉴 항목 (Phase 01-04에서 user.role 기반으로 주입)
  navItems?: NavItem[]
  onLogout?: () => void
}

/**
 * 반응형 앱 셸 컴포넌트
 *
 * 레이아웃 전략 (태블릿 우선):
 * - base/md (~1023px): 모바일 + 태블릿 — 하단 탭바, 메인에 하단 패딩 (pb-16)
 * - lg (1024px+): 데스크톱 — 사이드바, 메인에 좌측 패딩 (pl-64), 하단 패딩 없음
 *
 * 역할별 확장 포인트:
 * - navItems prop으로 사용자 역할에 따른 메뉴를 주입할 수 있음
 * - Phase 01-04 AuthContext 연결 후 user.role 기반으로 동적 메뉴 렌더링
 */
export default function AppShell({ children, navItems, onLogout }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* 데스크톱: 좌측 사이드바 */}
      <Sidebar items={navItems} onLogout={onLogout} />

      {/* 메인 콘텐츠 영역
          - 모바일/태블릿: 하단 탭바 높이(h-16 = 4rem = 64px)만큼 패딩
          - 데스크톱: 사이드바 너비(w-64 = 16rem = 256px)만큼 좌측 패딩
      */}
      <main className="pb-16 lg:pb-0 lg:pl-64">
        {children ?? <Outlet />}
      </main>

      {/* 모바일/태블릿: 하단 탭바 */}
      <BottomNav items={navItems} />
    </div>
  )
}
