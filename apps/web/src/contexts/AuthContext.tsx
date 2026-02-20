/**
 * AuthContext — 전역 인증 상태 관리
 *
 * - user: 현재 인증된 사용자 (null이면 비로그인)
 * - isLoading: 초기 세션 복원 중 여부
 * - login: 이메일+비밀번호로 로그인
 * - logout: 로그아웃 후 /login으로 이동
 * - setRole: 온보딩에서 역할 설정
 *
 * 앱 마운트 시 getMe()를 호출해 기존 세션을 복원한다 (AUTH-03).
 */

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router'
import { getMe, login as apiLogin, logout as apiLogout, setRole as apiSetRole } from '@/lib/auth'
import type { User } from '@/lib/auth'

interface AuthContextValue {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<User>
  logout: () => Promise<void>
  setRole: (role: 'student' | 'instructor') => Promise<User>
}

const AuthContext = createContext<AuthContextValue | null>(null)

/**
 * useAuth 훅 — AuthContext 사용 진입점
 * AuthProvider 외부에서 호출하면 에러를 던진다.
 */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth는 AuthProvider 내부에서 사용해야 합니다')
  }
  return ctx
}

interface AuthProviderProps {
  children: ReactNode
}

/**
 * AuthProvider — 앱 최상단에 배치
 *
 * 마운트 시 /api/auth/me를 호출해 세션을 복원한다.
 * 401 응답은 "로그인 필요" 상태로 처리 (에러 아님).
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showSpinner, setShowSpinner] = useState(false)
  const navigate = useNavigate()
  const spinnerTimer = useRef<ReturnType<typeof setTimeout>>(null)

  // 앱 마운트 시 세션 복원
  useEffect(() => {
    // 200ms 이상 걸릴 때만 스피너 표시 (flicker 방지)
    spinnerTimer.current = setTimeout(() => setShowSpinner(true), 200)

    getMe()
      .then((u) => setUser(u))
      .catch(() => {
        // 401 등 — 비로그인 상태. 에러 아님
        setUser(null)
      })
      .finally(() => {
        if (spinnerTimer.current) clearTimeout(spinnerTimer.current)
        setIsLoading(false)
      })

    return () => {
      if (spinnerTimer.current) clearTimeout(spinnerTimer.current)
    }
  }, [])

  /**
   * 로그인
   * 성공 시 user를 업데이트하고 반환한다. 페이지 이동은 호출자(LoginPage)가 담당.
   */
  async function login(email: string, password: string): Promise<User> {
    const u = await apiLogin(email, password)
    setUser(u)
    return u
  }

  /**
   * 로그아웃
   * API 호출 후 user를 null로 설정하고 /login으로 이동한다.
   * API 호출이 실패해도 로컬 상태는 초기화한다 (graceful).
   */
  async function logout(): Promise<void> {
    try {
      await apiLogout()
    } catch {
      // 서버 로그아웃 실패해도 클라이언트는 로그아웃 처리
    }
    setUser(null)
    navigate('/login')
  }

  /**
   * 역할 설정 (온보딩)
   * 성공 시 user를 업데이트하고 반환한다. 페이지 이동은 호출자(OnboardingPage)가 담당.
   */
  async function setRole(role: 'student' | 'instructor'): Promise<User> {
    const u = await apiSetRole(role)
    setUser(u)
    return u
  }

  // 초기 로딩 중 — 200ms 미만이면 빈 화면, 이후 스피너 표시 (flicker 방지)
  if (isLoading) {
    if (!showSpinner) return null
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, setRole }}>
      {children}
    </AuthContext.Provider>
  )
}

// mock auth 에러 타입 가드 — 에러 메시지 추출에 사용
export function isApiError(err: unknown): err is { error: string; statusCode: number } {
  return (
    typeof err === 'object' &&
    err !== null &&
    'error' in err &&
    typeof (err as { error: string }).error === 'string'
  )
}
