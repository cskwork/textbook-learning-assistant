// apps/web/src/lib/auth.ts
// POC mock 인증 — localStorage 기반 (백엔드 없는 Vercel 배포용)

const USERS_KEY = 'mock:users'
const CURRENT_USER_KEY = 'mock:current_user'

export interface User {
  id: number
  email: string
  role: 'student' | 'instructor' | null
  isOnboarded: boolean
}

function getUsers(): User[] {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) ?? '[]')
  } catch {
    return []
  }
}

export async function register(email: string, _password: string): Promise<User> {
  const users = getUsers()
  if (users.find((u) => u.email === email)) {
    throw { error: '이미 사용 중인 이메일입니다', statusCode: 409 }
  }
  const newUser: User = { id: Date.now(), email, role: null, isOnboarded: false }
  localStorage.setItem(USERS_KEY, JSON.stringify([...users, newUser]))
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser))
  return newUser
}

export async function login(email: string, _password: string): Promise<User> {
  const users = getUsers()
  const user = users.find((u) => u.email === email)
  if (!user) throw { error: '이메일 또는 비밀번호가 올바르지 않습니다', statusCode: 401 }
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user))
  return user
}

export async function logout(): Promise<void> {
  localStorage.removeItem(CURRENT_USER_KEY)
}

export async function getMe(): Promise<User> {
  const raw = localStorage.getItem(CURRENT_USER_KEY)
  if (!raw) throw { error: '로그인이 필요합니다', statusCode: 401 }
  return JSON.parse(raw) as User
}

export async function setRole(role: 'student' | 'instructor'): Promise<User> {
  const raw = localStorage.getItem(CURRENT_USER_KEY)
  if (!raw) throw { error: '로그인이 필요합니다', statusCode: 401 }
  const current: User = JSON.parse(raw)
  const updated: User = { ...current, role, isOnboarded: true }
  const users = getUsers().map((u) => (u.id === updated.id ? updated : u))
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updated))
  return updated
}

export async function refreshToken(): Promise<User> {
  // mock: refresh는 getMe()와 동일
  return getMe()
}
