/**
 * 공개 라우트 가드
 *
 * 로그인/회원가입 페이지를 감싸는 래퍼.
 * 이미 인증된 사용자가 접근하면 적절한 페이지로 리디렉트한다:
 * - 온보딩 미완료 → /onboarding
 * - 온보딩 완료 → / (홈, 역할별 리디렉트)
 */

import { Navigate, Outlet } from 'react-router'
import { useAuth } from '@/contexts/AuthContext'

export default function PublicRoute() {
  const { user, isLoading } = useAuth()

  // isLoading 중 AuthContext 스피너가 표시되므로 여기서는 null 반환
  if (isLoading) {
    return null
  }

  // 인증된 사용자가 공개 라우트 접근 → 리디렉트
  if (user) {
    if (!user.isOnboarded) {
      return <Navigate to="/onboarding" replace />
    }
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
