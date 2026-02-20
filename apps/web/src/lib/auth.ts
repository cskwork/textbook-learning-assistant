// apps/web/src/lib/auth.ts
// POC mock 인증 — localStorage 기반 (백엔드 없는 Vercel 배포용)

const USERS_KEY = 'mock:users'
const CURRENT_USER_KEY = 'mock:current_user'

export interface User {
  id: number
  email: string
  role: 'student' | 'instructor' | null
  isOnboarded: boolean
  name?: string         // 사용자 표시 이름 (optional — 기존 유저 호환)
  avatarEmoji?: string  // 이모지 아바타 (optional — 기존 유저 호환)
}

// 내부 저장용 — 비밀번호 포함 (POC 평문 저장)
interface StoredUser extends User {
  password?: string
}

function getUsers(): StoredUser[] {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) ?? '[]')
  } catch {
    return []
  }
}

export async function register(email: string, password: string): Promise<User> {
  const users = getUsers()
  if (users.find((u) => u.email === email)) {
    throw { error: '이미 사용 중인 이메일입니다', statusCode: 409 }
  }
  const newUser: User = { id: Date.now(), email, role: null, isOnboarded: false }
  const storedUser: StoredUser = { ...newUser, password }
  localStorage.setItem(USERS_KEY, JSON.stringify([...users, storedUser]))
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser))
  return newUser
}

export async function login(email: string, password: string): Promise<User> {
  const users = getUsers()
  const stored = users.find((u) => u.email === email)
  if (!stored) throw { error: '이메일 또는 비밀번호가 올바르지 않습니다', statusCode: 401 }
  // 비밀번호 검증 — 기존 유저(password 없음)는 하위 호환으로 통과
  if (stored.password && stored.password !== password) {
    throw { error: '이메일 또는 비밀번호가 올바르지 않습니다', statusCode: 401 }
  }
  // StoredUser에서 password 제거 후 User로 저장
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password: _pw, ...user } = stored
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
  const users = getUsers().map((u) => (u.id === updated.id ? { ...u, ...updated } : u))
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updated))
  return updated
}

export async function refreshToken(): Promise<User> {
  // mock: refresh는 getMe()와 동일
  return getMe()
}

/**
 * 프로필 업데이트 — name, avatarEmoji 변경
 * USERS_KEY와 CURRENT_USER_KEY 양쪽 localStorage 업데이트
 */
export async function updateProfile(updates: Pick<User, 'name' | 'avatarEmoji'>): Promise<User> {
  const raw = localStorage.getItem(CURRENT_USER_KEY)
  if (!raw) throw { error: '로그인이 필요합니다', statusCode: 401 }
  const current: User = JSON.parse(raw)
  const updated: User = { ...current, ...updates }
  const users = getUsers().map((u) => (u.id === updated.id ? { ...u, ...updates } : u))
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updated))
  return updated
}

/**
 * 비밀번호 변경
 * 기존 비밀번호 확인 후 새 비밀번호로 업데이트 (POC 평문 저장)
 */
export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  const raw = localStorage.getItem(CURRENT_USER_KEY)
  if (!raw) throw { error: '로그인이 필요합니다', statusCode: 401 }
  const current: User = JSON.parse(raw)

  const users = getUsers()
  const storedUser = users.find((u) => u.id === current.id)
  if (!storedUser) throw { error: '사용자를 찾을 수 없습니다', statusCode: 404 }

  // 기존 비밀번호 확인 — 기존 유저(password 없음)는 하위 호환으로 통과
  if (storedUser.password && storedUser.password !== currentPassword) {
    throw { error: '현재 비밀번호가 올바르지 않습니다', statusCode: 400 }
  }

  // 새 비밀번호 검증: 8자 이상
  if (newPassword.length < 8) {
    throw { error: '비밀번호는 8자 이상이어야 합니다', statusCode: 400 }
  }

  const updatedUsers = users.map((u) => (u.id === current.id ? { ...u, password: newPassword } : u))
  localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers))
}

/**
 * 계정 삭제
 * Dexie 테이블과 localStorage에서 해당 유저 데이터를 완전 삭제
 */
export async function deleteAccount(): Promise<void> {
  const raw = localStorage.getItem(CURRENT_USER_KEY)
  if (!raw) throw { error: '로그인이 필요합니다', statusCode: 401 }
  const current: User = JSON.parse(raw)
  const email = current.email

  // Dexie 테이블에서 해당 유저 데이터 삭제
  const { db } = await import('./db')
  await Promise.all([
    db.quizAttempts.where('studentId').equals(email).delete(),
    db.quizSessions.where('studentId').equals(email).delete(),
    db.wrongNotes.where('studentId').equals(email).delete(),
    db.workbooks.where('studentId').equals(email).delete(),
    db.userSettings.where('userId').equals(email).delete(),
    db.groups.where('instructorId').equals(email).delete(),
    db.groupMembers.where('studentId').equals(email).delete(),
  ])

  // localStorage에서 해당 유저 제거
  const users = getUsers().filter((u) => u.id !== current.id)
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
  localStorage.removeItem(CURRENT_USER_KEY)
  localStorage.removeItem('app:isDarkMode')
  localStorage.removeItem('app:katexFontSize')
}
