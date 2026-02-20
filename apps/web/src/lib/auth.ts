/**
 * 인증 API 호출 함수 모음
 *
 * api.ts의 fetch wrapper를 사용하며,
 * AuthContext에서 이 함수들을 통해 인증 상태를 관리한다.
 */

import { api } from './api'

// 사용자 타입 (서버 응답 형식)
export interface User {
  id: number
  email: string
  role: 'student' | 'instructor' | null
  isOnboarded: boolean
}

interface AuthResponse {
  user: User
}

/**
 * 회원가입
 * POST /api/auth/register
 */
export async function register(email: string, password: string): Promise<User> {
  const res = await api.post<AuthResponse>('/api/auth/register', { email, password })
  return res.user
}

/**
 * 로그인
 * POST /api/auth/login
 */
export async function login(email: string, password: string): Promise<User> {
  const res = await api.post<AuthResponse>('/api/auth/login', { email, password })
  return res.user
}

/**
 * 로그아웃
 * POST /api/auth/logout
 */
export async function logout(): Promise<void> {
  await api.post('/api/auth/logout')
}

/**
 * 현재 인증된 사용자 정보 조회 (세션 확인용)
 * GET /api/auth/me
 */
export async function getMe(): Promise<User> {
  const res = await api.get<AuthResponse>('/api/auth/me')
  return res.user
}

/**
 * 역할 설정 (온보딩)
 * PATCH /api/auth/onboarding
 */
export async function setRole(role: 'student' | 'instructor'): Promise<User> {
  const res = await api.patch<AuthResponse>('/api/auth/onboarding', { role })
  return res.user
}

/**
 * 토큰 갱신
 * POST /api/auth/refresh
 */
export async function refreshToken(): Promise<User> {
  const res = await api.post<AuthResponse>('/api/auth/refresh')
  return res.user
}
