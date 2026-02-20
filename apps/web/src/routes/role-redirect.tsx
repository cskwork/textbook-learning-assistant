/**
 * 역할 기반 루트 리디렉트
 *
 * / 경로에 접근한 인증된 사용자를 역할에 따라 적절한 홈으로 이동시킨다.
 * - role === 'student' → /student
 * - role === 'instructor' → /instructor
 * - 역할 없음 (비정상) → /onboarding
 *
 * 이 컴포넌트는 _layout.tsx 내에서 렌더링되므로
 * 인증 + 온보딩 완료가 보장된 상태다.
 */

import { Navigate } from 'react-router'
import { useAuth } from '@/contexts/AuthContext'

export default function RoleRedirect() {
  const { user } = useAuth()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (user.role === 'student') {
    return <Navigate to="/student" replace />
  }

  if (user.role === 'instructor') {
    return <Navigate to="/instructor" replace />
  }

  // 역할이 없는 경우 (온보딩 미완료, 비정상 상태)
  return <Navigate to="/onboarding" replace />
}
