/**
 * 루트 레이아웃 라우트 — 보호 라우트
 *
 * 인증 + 온보딩 완료 상태를 확인하고 적절히 리디렉트한다:
 * - 비인증 → /login
 * - 인증 + 온보딩 미완료 → /onboarding
 * - 인증 + 온보딩 완료 + 역할 없음 → /login (비정상 상태)
 * - 인증 + 온보딩 완료 → AppShell 렌더링 (역할별 메뉴)
 */

import { Navigate } from 'react-router'
import { Home, BookOpen, BookOpenCheck, Users, BookMarked, BarChart2, User, CalendarDays } from 'lucide-react'
import AppShell from '@/components/layout/AppShell'
import { useAuth } from '@/contexts/AuthContext'
import type { NavItem } from '@/components/layout/BottomNav'

// 학생 메뉴 항목 — 문제집+오답노트를 '학습자료' 탭으로 통합
const studentNavItems: NavItem[] = [
  { path: '/student', label: '홈', icon: Home },
  { path: '/student/problems', label: '문제풀기', icon: BookOpenCheck },
  { path: '/student/workbooks', label: '학습자료', icon: BookMarked },
  { path: '/student/analytics', label: '분석', icon: BarChart2 },
  { path: '/student/planner', label: '플래너', icon: CalendarDays },
]

// 강사 메뉴 항목
const instructorNavItems: NavItem[] = [
  { path: '/instructor', label: '홈', icon: Home },
  { path: '/instructor/problems', label: '문제관리', icon: BookOpen },
  { path: '/instructor/groups', label: '반관리', icon: Users },
  { path: '/instructor/profile', label: '마이페이지', icon: User },
]

import { PageTransition } from '@/components/layout/PageTransition'

export default function Layout() {
  const { user, isLoading, logout } = useAuth()

  // isLoading은 AuthContext의 스피너에서 처리되므로 여기서는 도달하지 않음
  // (AuthContext가 isLoading 중 전체 화면 스피너를 렌더링)
  if (isLoading) {
    return null
  }

  // 비인증 사용자 → /login으로 리디렉트
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // 온보딩 미완료 → /onboarding으로 리디렉트
  if (!user.isOnboarded) {
    return <Navigate to="/onboarding" replace />
  }

  // 역할에 따라 메뉴 항목 선택
  const navItems = user.role === 'student' ? studentNavItems : instructorNavItems

  const profilePath = user.role === 'student' ? '/student/profile' : '/instructor/profile'

  return (
    <AppShell navItems={navItems} onLogout={logout} profilePath={profilePath}>
      <PageTransition />
    </AppShell>
  )
}
