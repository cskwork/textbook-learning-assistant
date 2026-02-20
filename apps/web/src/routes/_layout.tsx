import { Outlet } from 'react-router'
import AppShell from '@/components/layout/AppShell'

/**
 * 루트 레이아웃 라우트
 *
 * 현재 단계: 인증 체크 없이 단순 레이아웃만 적용
 * Phase 01-04에서 AuthContext + 보호 라우트 로직 추가 예정
 */
export default function Layout() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  )
}
