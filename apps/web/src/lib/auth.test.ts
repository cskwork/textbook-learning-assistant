import { beforeEach, describe, expect, it } from 'vitest'
import { getMe, logout, setRole } from './auth'

function createStorageMock(): Storage {
  const store = new Map<string, string>()

  return {
    get length() {
      return store.size
    },
    clear() {
      store.clear()
    },
    getItem(key: string) {
      return store.has(key) ? store.get(key)! : null
    },
    key(index: number) {
      return Array.from(store.keys())[index] ?? null
    },
    removeItem(key: string) {
      store.delete(key)
    },
    setItem(key: string, value: string) {
      store.set(key, value)
    },
  }
}

beforeEach(() => {
  Object.defineProperty(globalThis, 'localStorage', {
    value: createStorageMock(),
    configurable: true,
    writable: true,
  })
})

describe('demo auth bypass', () => {
  it('세션이 없으면 역할 선택용 데모 세션을 자동 생성한다', async () => {
    const user = await getMe()

    expect(user.email).toBe('demo@textbook.local')
    expect(user.role).toBeNull()
    expect(user.isOnboarded).toBe(false)
  })

  it('로그아웃 후 다시 진입하면 역할 선택 초기 상태로 복구된다', async () => {
    await getMe()
    await setRole('student')
    await logout()

    const user = await getMe()

    expect(user.role).toBeNull()
    expect(user.isOnboarded).toBe(false)
  })
})
