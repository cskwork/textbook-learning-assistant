# Phase 8: 마이페이지 + 앱 설정 - Research

**Researched:** 2026-02-21
**Domain:** 프로필 편집, 인증 관리, 다크모드, KaTeX 글꼴 크기, 계정 삭제 (POC/localStorage 기반)
**Confidence:** HIGH

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| MYPAGE-01 | 사용자가 이름과 프로필 아바타를 편집하면 즉시 앱 전체에 반영된다 | User 인터페이스 확장 + AuthContext setUser 호출 + localStorage 저장 |
| MYPAGE-02 | 비밀번호를 변경하면 기존 비밀번호 확인 후 새 비밀번호로 로그인할 수 있다 | auth.ts에 changePassword 함수 추가 — mock 구현 (비밀번호 저장 포함) |
| MYPAGE-03 | 다크모드 전환 시 모든 페이지가 일관된 다크 테마로 표시되고 새로고침 후에도 유지된다 | Tailwind v4 @custom-variant dark + .dark 클래스 + localStorage |
| MYPAGE-04 | 수식 글꼴 크기를 조절하면 KaTeX 렌더링 문제에 즉시 반영되고 설정이 저장된다 | CSS custom property --katex-font-size + document.documentElement.style.setProperty |
| MYPAGE-05 | 계정 삭제 시 확인 절차를 거치며, 삭제 후 모든 사용자 데이터가 제거되고 로그인 화면으로 이동한다 | Dexie db.delete() 또는 테이블별 clear() + localStorage 키 전부 제거 |
</phase_requirements>

---

## Summary

Phase 8은 백엔드 없는 POC 구조(localStorage + Dexie IndexedDB) 위에서 마이페이지와 앱 설정을 구현한다. 핵심 도전은 5개 영역으로 나뉜다: (1) User 타입 확장 및 프로필 반영, (2) mock auth 비밀번호 변경, (3) Tailwind v4 다크모드 class 전략, (4) KaTeX CSS custom property 기반 글꼴 크기 제어, (5) 완전 계정 삭제.

이 Phase에서 새 npm 패키지를 설치할 필요가 없다. 모든 기능은 기존 스택(React 19, Tailwind v4, Dexie 4, localStorage)으로 구현 가능하다. Dexie version(6) 마이그레이션이 필요하지 않을 가능성이 높다 — `userSettings` 테이블에 새 컬럼(name, avatarEmoji, katexFontSize, isDarkMode)을 추가하는 방식이라 version bump가 필요하지만 기존 version(5) 데이터 마이그레이션은 단순하다.

**Primary recommendation:** `UserSetting` 인터페이스를 확장하고, `SettingsContext` 또는 `AuthContext` 확장으로 전역 상태를 공유하며, 다크모드는 `document.documentElement.classList.toggle('dark', isDark)`를 최상단 useEffect에서 호출하는 패턴을 사용한다.

---

## Standard Stack

### Core (신규 설치 없음, 기존 스택 활용)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Dexie 4 | ^4.3.0 (설치됨) | UserSetting 확장 — name, avatarEmoji, katexFontSize, isDarkMode 필드 추가 | 기존 프로젝트 DB |
| React 19 | ^19.1.0 (설치됨) | SettingsContext — 전역 설정 상태 + 업데이트 함수 | 기존 프레임워크 |
| Tailwind v4 | ^4.1.10 (설치됨) | .dark 클래스 기반 다크모드 (index.css에 이미 .dark {} 정의됨) | CSS-first 방식 |
| shadcn/ui | ^3.8.5 (설치됨) | Dialog (확인 모달), Switch (다크모드 토글), Slider (글꼴 크기) | 기존 UI 라이브러리 |
| lucide-react | ^0.511.0 (설치됨) | User, Moon, Sun, Trash2, Lock, Settings 아이콘 | 기존 아이콘 |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| react-hook-form + zod | 설치됨 | 프로필 편집 폼, 비밀번호 변경 폼 검증 | 폼 입력 유효성 검사 |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| SettingsContext 신규 생성 | AuthContext 확장 | AuthContext는 이미 user 상태를 들고 있어 name/avatar를 user 확장으로 처리 가능; 단 settings(isDarkMode, katexFontSize)는 별도 컨텍스트가 더 깔끔 |
| UserSetting Dexie 확장 | localStorage only | Dexie에 이미 userSettings 테이블 존재 — 일관성 유지 위해 Dexie 확장 권장 |
| Slider 컴포넌트 (shadcn) | HTML input[type=range] | shadcn Slider가 접근성/스타일 더 좋음; shadcn add slider로 추가 필요 |

**Installation (필요한 경우에만):**
```bash
# Slider 컴포넌트가 없으면:
pnpm dlx shadcn@latest add slider --cwd apps/web
# Dialog 컴포넌트가 없으면:
pnpm dlx shadcn@latest add dialog --cwd apps/web
# Switch 컴포넌트가 없으면:
pnpm dlx shadcn@latest add switch --cwd apps/web
```

---

## Architecture Patterns

### Recommended Project Structure

```
apps/web/src/
├── contexts/
│   ├── AuthContext.tsx          # 기존 — User 타입에 name?, avatarEmoji? 추가
│   └── SettingsContext.tsx      # 신규 — isDarkMode, katexFontSize, updateSettings
├── services/
│   └── settings.service.ts     # 신규 — Dexie userSettings CRUD (name, avatar, dark, katex)
├── routes/
│   ├── student/
│   │   └── profile/
│   │       └── index.tsx        # 기존 라우트 (ComingSoonPage → 실제 구현으로 교체)
│   └── instructor/
│       └── profile/
│           └── index.tsx        # 기존 라우트 (ComingSoonPage → 실제 구현으로 교체)
├── components/
│   └── profile/
│       ├── ProfileEditForm.tsx  # 이름 + 아바타 편집 폼
│       ├── PasswordChangeForm.tsx # 비밀번호 변경 폼
│       └── AvatarDisplay.tsx   # 이모지 또는 이니셜 아바타 (파일 업로드 없음)
└── lib/
    ├── auth.ts                  # changePassword 함수 추가
    └── db.ts                    # version(6) — UserSetting에 name, avatarEmoji, katexFontSize, isDarkMode 추가
```

### Pattern 1: 다크모드 — class 기반 토글 + localStorage 유지

**What:** Tailwind v4는 이미 `@custom-variant dark (&:is(.dark *));`가 index.css에 선언되어 있고, `.dark {}` CSS 블록도 존재한다. `document.documentElement.classList.toggle('dark', isDark)`로 즉시 전환된다.

**When to use:** 앱 최상단 초기화(main.tsx 또는 SettingsContext mount)에서 localStorage 값을 읽어 초기 적용. 이후 사용자 토글 시 동일 패턴 사용.

**Example:**
```typescript
// Source: Tailwind v4 공식 문서 (Context7 검증)
// SettingsContext.tsx 초기화 로직
useEffect(() => {
  const saved = localStorage.getItem('app:isDarkMode')
  const isDark = saved === 'true'
  document.documentElement.classList.toggle('dark', isDark)
  setIsDarkMode(isDark)
}, [])

function toggleDarkMode(enabled: boolean) {
  document.documentElement.classList.toggle('dark', enabled)
  localStorage.setItem('app:isDarkMode', String(enabled))
  setIsDarkMode(enabled)
  // Dexie userSettings도 업데이트 (비동기)
  saveSettings({ isDarkMode: enabled })
}
```

**중요:** index.css의 `@custom-variant dark (&:is(.dark *));` 선언이 이미 존재하므로 CSS 수정 불필요. `<html>` 태그에 `dark` 클래스를 추가/제거하는 방식으로 동작.

**초기화 flicker 방지:** `main.tsx` 또는 `index.html` `<script>` 태그에서 페이지 렌더 전에 dark 클래스를 동기적으로 적용해야 flicker가 없다.

```html
<!-- index.html <head>에 추가 — 렌더 전 동기 실행 -->
<script>
  if (localStorage.getItem('app:isDarkMode') === 'true') {
    document.documentElement.classList.add('dark')
  }
</script>
```

### Pattern 2: KaTeX 글꼴 크기 — CSS Custom Property

**What:** KaTeX가 렌더링하는 `.katex` 클래스는 `font-size`를 상속받는다. CSS custom property `--katex-font-size`를 `document.documentElement`에 설정하고, index.css에서 `.katex` 클래스에 적용한다.

**Example:**
```css
/* index.css에 추가 */
.katex {
  font-size: var(--katex-font-size, 1em);
}
```

```typescript
// settings.service.ts 또는 SettingsContext
function setKatexFontSize(size: number) {
  // size: 0.8 ~ 1.5 범위 (rem 단위)
  document.documentElement.style.setProperty('--katex-font-size', `${size}em`)
  localStorage.setItem('app:katexFontSize', String(size))
}
```

**LatexPreview 수정 불필요:** CSS 상속으로 자동 적용된다. `dangerouslySetInnerHTML`로 삽입된 KaTeX HTML도 `.katex` 클래스를 가지므로 CSS 변수가 즉시 반영된다.

### Pattern 3: 프로필 편집 — User 타입 확장 + mock auth 저장

**What:** 기존 `User` 인터페이스에 `name?: string`, `avatarEmoji?: string`을 추가. `auth.ts`에 `updateProfile` 함수 추가.

**Example:**
```typescript
// lib/auth.ts 확장
export interface User {
  id: number
  email: string
  role: 'student' | 'instructor' | null
  isOnboarded: boolean
  name?: string        // 신규
  avatarEmoji?: string // 신규 — 이모지 아바타 (예: "🐧", "📚")
}

export async function updateProfile(
  updates: Pick<User, 'name' | 'avatarEmoji'>
): Promise<User> {
  const raw = localStorage.getItem(CURRENT_USER_KEY)
  if (!raw) throw { error: '로그인이 필요합니다', statusCode: 401 }
  const current: User = JSON.parse(raw)
  const updated: User = { ...current, ...updates }
  const users = getUsers().map((u) => (u.id === updated.id ? updated : u))
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updated))
  return updated
}
```

**AuthContext 확장:** `updateProfile` 함수를 AuthContext에 추가해 `user` 상태를 즉시 업데이트 → BottomNav, Sidebar, Header에 반영.

### Pattern 4: 비밀번호 변경 — mock auth (localStorage 평문 저장)

**POC 한계 인식:** 실제 프로덕션에서는 bcrypt 해싱이 필요하지만, 이 프로젝트는 POC로 auth.ts가 이미 비밀번호를 검증 없이 저장한다 (register에서 `_password` 파라미터로 미사용). 비밀번호 변경 기능을 올바르게 구현하려면 auth.ts에 비밀번호 저장 로직을 추가해야 한다.

**현재 auth.ts 상태 분석:**
```typescript
// 현재 register()에서 비밀번호를 저장하지 않음 (_password 미사용)
export async function register(email: string, _password: string): Promise<User>
// 현재 login()에서 비밀번호 검증 안 함
export async function login(email: string, _password: string): Promise<User>
```

**비밀번호 변경 구현 방향:**
- `mock:users` localStorage 키에 저장되는 User 객체에 `passwordHash` 필드(평문, POC) 추가
- `changePassword(currentPassword, newPassword)` 함수: 현재 비밀번호 확인 후 새 비밀번호 저장
- `register`와 `login`도 비밀번호 저장/검증 로직 추가 (하위 호환: 기존 유저는 any password 허용)

```typescript
// auth.ts 확장
interface StoredUser extends User {
  password?: string // POC 평문 저장
}

export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<void> {
  const raw = localStorage.getItem(CURRENT_USER_KEY)
  if (!raw) throw { error: '로그인이 필요합니다', statusCode: 401 }
  const current: StoredUser = JSON.parse(raw)
  const users: StoredUser[] = JSON.parse(localStorage.getItem(USERS_KEY) ?? '[]')
  const stored = users.find((u) => u.id === current.id)

  // 기존 비밀번호 확인 (없으면 통과 — 레거시 유저 호환)
  if (stored?.password && stored.password !== currentPassword) {
    throw { error: '현재 비밀번호가 올바르지 않습니다', statusCode: 400 }
  }

  const updated = users.map((u) =>
    u.id === current.id ? { ...u, password: newPassword } : u
  )
  localStorage.setItem(USERS_KEY, JSON.stringify(updated))
}
```

### Pattern 5: 계정 삭제 — 완전 데이터 제거

**What:** 사용자의 모든 Dexie 데이터 + localStorage 데이터를 제거하고 로그인 화면으로 이동.

**Example:**
```typescript
// account.service.ts 또는 auth.ts에 추가
export async function deleteAccount(userId: string, userEmail: string): Promise<void> {
  // 1. Dexie 테이블에서 해당 유저 데이터 삭제
  await Promise.all([
    db.quizAttempts.where('studentId').equals(userEmail).delete(),
    db.quizSessions.where('studentId').equals(userEmail).delete(),
    db.wrongNotes.where('studentId').equals(userEmail).delete(),
    db.workbooks.where('studentId').equals(userEmail).delete(),
    db.userSettings.where('userId').equals(userEmail).delete(),
    db.groups.where('instructorId').equals(userEmail).delete(),
    db.groupMembers.where('studentId').equals(userEmail).delete(),
  ])

  // 2. localStorage에서 유저 계정 제거
  const users: User[] = JSON.parse(localStorage.getItem(USERS_KEY) ?? '[]')
  const filtered = users.filter((u) => u.email !== userEmail)
  localStorage.setItem(USERS_KEY, JSON.stringify(filtered))

  // 3. 세션 제거
  localStorage.removeItem(CURRENT_USER_KEY)

  // 4. 앱 설정 키 제거
  localStorage.removeItem('app:isDarkMode')
  localStorage.removeItem('app:katexFontSize')
}
```

**라우팅:** 삭제 완료 후 `logout()` 호출 또는 `navigate('/login')`으로 이동.

### Pattern 6: 마이페이지 라우트 — 공통 구조

**현재 상태:** `main.tsx`에 `/student/profile`과 `/instructor/profile`이 `<ComingSoonPage />`로 등록되어 있음. Phase 8에서 이를 실제 페이지 컴포넌트로 교체한다.

**탭바 통합:** `_layout.tsx`의 `studentNavItems`에 `/student/profile` 항목이 없고 (05-04에서 '분석' 탭으로 교체됨), `instructorNavItems`에는 `마이페이지` 탭이 있다. 학생 탭바에 마이페이지를 추가하면 탭이 6개가 된다 — 대신 기존 진입점(탭바 내 링크 또는 헤더 아이콘)을 활용하거나, 분석 탭을 마이페이지로 이동시키고 분석은 학생 홈에서 링크로 유지하는 방안을 검토해야 한다.

**권장 접근:** 학생 탭바는 현재 5탭(홈/문제풀기/오답노트/문제집/분석)으로 꽉 찼다. 마이페이지는 탭바 진입이 아닌 **헤더의 사용자 아바타 클릭** 또는 **각 홈 페이지 내 "내 정보" 카드**로 진입하는 방식을 추천한다.

### Anti-Patterns to Avoid

- **`db.delete()` 전체 DB 삭제 금지:** 계정 삭제 시 `db.delete()`를 호출하면 다른 사용자 데이터도 모두 삭제된다 (POC에서 여러 계정이 한 브라우저를 공유). 반드시 `where('field').equals(userEmail).delete()` 방식으로 특정 유저 데이터만 제거해야 한다.
- **다크모드를 Dexie만으로 관리:** Dexie는 비동기이므로 초기 렌더 시 다크모드 적용이 늦어 flicker가 발생한다. localStorage를 동기 소스로 사용하고 Dexie는 backup으로 사용.
- **KaTeX를 컴포넌트 props로 제어:** 모든 LatexPreview 컴포넌트에 fontsize prop을 추가하는 것은 과도한 prop drilling이다. CSS custom property가 훨씬 간결.
- **avatarEmoji 파일 업로드:** POC에서 이미지 업로드는 필요 없다. 미리 정의된 이모지 팔레트(예: 10~20개) 또는 이니셜 기반 색상 아바타로 충분하다.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| 다크모드 CSS 변수 | 수동 CSS 변수 전환 | Tailwind .dark 클래스 (이미 구현됨) | index.css에 이미 .dark {} 전체 테마가 정의되어 있음 |
| 확인 모달 | 커스텀 confirm dialog | shadcn Dialog 컴포넌트 | 접근성(포커스 트랩, ESC 처리) 자동 처리 |
| 아바타 파일 업로드 | base64 이미지 저장 | 이모지 선택 UI | POC에서 불필요, 이미지는 Dexie에 크기 부담 |
| 비밀번호 해싱 | 직접 crypto API | 그냥 평문 저장 (POC 명시적 한계) | POC이므로 bcrypt 없이 OK; 프로덕션 전환 시 교체 필요 |

**Key insight:** 이 Phase는 신규 라이브러리가 거의 필요 없다. 기존 스택의 조합만으로 5개 요구사항 모두 구현 가능하다.

---

## Common Pitfalls

### Pitfall 1: 다크모드 초기 flicker (FOUC)

**What goes wrong:** 앱이 렌더될 때 React가 마운트되기 전에는 .dark 클래스가 없어서 흰 화면이 잠깐 보인다.
**Why it happens:** React useEffect는 마운트 후 실행되므로, 렌더 전 localStorage를 읽지 못한다.
**How to avoid:** `index.html`의 `<head>`에 인라인 `<script>` 태그를 추가해 동기적으로 .dark 클래스를 적용한다.
```html
<script>
  if (localStorage.getItem('app:isDarkMode') === 'true') {
    document.documentElement.classList.add('dark')
  }
</script>
```
**Warning signs:** 다크모드 설정 후 새로고침 시 1~2프레임 흰 화면.

### Pitfall 2: Dexie version(6) 마이그레이션 — 기존 userSettings 호환

**What goes wrong:** UserSetting에 새 필드(name, avatarEmoji, katexFontSize, isDarkMode)를 추가할 때 version(6)으로 올려야 하는데, 기존 유저의 userSettings 레코드에는 새 필드가 없다.
**Why it happens:** IndexedDB는 스키마 변경 시 기존 레코드를 자동으로 업데이트하지 않는다.
**How to avoid:** 새 필드를 모두 optional(`?`)로 선언하고, 읽을 때 기본값으로 폴백한다. upgrade() 함수에서 명시적 마이그레이션은 불필요 (optional 필드이므로).

```typescript
// db.ts version(6) — 새 인덱스가 없으면 stores()만 동일하게 선언해도 됨
db.version(6).stores({
  // 인덱스 변경 없으면 기존 stores 그대로 복사
  questions: '++id, subject, unit, questionCategory, difficulty, createdAt, createdBy',
  // ... 나머지 동일 ...
  userSettings: '++id, &userId',
  // ...
})
// upgrade() 불필요 — 새 필드가 모두 optional이므로
```

**Warning signs:** `db.open() failed: VersionError` — version 번호를 빠뜨리거나 stores() 정의가 이전 버전과 충돌할 때.

### Pitfall 3: AuthContext user 상태 동기화 누락

**What goes wrong:** 프로필 수정 후 localStorage에는 반영되지만 React 상태(AuthContext.user)에는 반영되지 않아 BottomNav/헤더의 아바타가 업데이트되지 않는다.
**Why it happens:** `updateProfile`이 localStorage만 업데이트하고 React state setUser를 호출하지 않음.
**How to avoid:** `AuthContext`에 `updateProfile` 함수를 추가하고 내부에서 `setUser(updated)`를 호출.

```typescript
// AuthContext 확장 패턴 (auth.ts의 updateProfile과 연동)
async function updateProfile(updates: Pick<User, 'name' | 'avatarEmoji'>): Promise<User> {
  const u = await apiUpdateProfile(updates)
  setUser(u) // React state 즉시 업데이트
  return u
}
```

### Pitfall 4: index.css .dark 클래스와 @custom-variant 충돌

**What goes wrong:** `@custom-variant dark (&:is(.dark *));` 선언이 있는데 `html.dark` 방식이 아니라 `html[data-theme=dark]` 방식을 사용하면 Tailwind dark: 유틸리티가 적용되지 않는다.
**Why it happens:** 현재 index.css의 custom variant는 `.dark` 클래스를 기준으로 함.
**How to avoid:** 반드시 `document.documentElement.classList.toggle('dark', isDark)` 사용. data-theme 방식 사용 금지.

### Pitfall 5: 계정 삭제 시 다른 사용자 데이터 손상

**What goes wrong:** `db.questions.clear()` 등으로 전체 테이블을 지우면 강사가 등록한 문제까지 삭제된다.
**Why it happens:** POC에서 여러 사용자가 같은 IndexedDB를 공유.
**How to avoid:** questions 테이블은 삭제하지 않는다 (공유 데이터). 개인 데이터(quizAttempts, wrongNotes, workbooks, userSettings, groups, groupMembers)만 `where('studentId/instructorId/userId').equals(email).delete()` 방식으로 삭제.

---

## Code Examples

### 다크모드 토글 — React Context 패턴

```typescript
// contexts/SettingsContext.tsx
// Source: Tailwind v4 공식 문서 패턴 (Context7 검증)
import { createContext, useContext, useEffect, useState } from 'react'

interface SettingsContextValue {
  isDarkMode: boolean
  katexFontSize: number // 0.8 ~ 1.5
  toggleDarkMode: (enabled: boolean) => void
  setKatexFontSize: (size: number) => void
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [katexFontSize, setKatexFontSizeState] = useState(1.0)

  // 초기화 — localStorage에서 복원
  useEffect(() => {
    const dark = localStorage.getItem('app:isDarkMode') === 'true'
    const fontSize = parseFloat(localStorage.getItem('app:katexFontSize') ?? '1.0')
    setIsDarkMode(dark)
    setKatexFontSizeState(fontSize)
    // dark 클래스는 index.html script에서 이미 적용됨, 여기서는 상태만 sync
    document.documentElement.classList.toggle('dark', dark)
    document.documentElement.style.setProperty('--katex-font-size', `${fontSize}em`)
  }, [])

  function toggleDarkMode(enabled: boolean) {
    document.documentElement.classList.toggle('dark', enabled)
    localStorage.setItem('app:isDarkMode', String(enabled))
    setIsDarkMode(enabled)
  }

  function setKatexFontSize(size: number) {
    document.documentElement.style.setProperty('--katex-font-size', `${size}em`)
    localStorage.setItem('app:katexFontSize', String(size))
    setKatexFontSizeState(size)
  }

  return (
    <SettingsContext.Provider value={{ isDarkMode, katexFontSize, toggleDarkMode, setKatexFontSize }}>
      {children}
    </SettingsContext.Provider>
  )
}
```

### Dexie version(6) 확장 — UserSetting 필드 추가

```typescript
// lib/db.ts 수정
export interface UserSetting {
  id: number
  userId: string
  dailyGoal: number
  isDiagnosisCompleted: boolean
  // Phase 8 신규 필드 (모두 optional — 마이그레이션 불필요)
  displayName?: string      // 사용자 표시 이름
  avatarEmoji?: string      // 이모지 아바타 (예: "🐧")
  isDarkMode?: boolean      // 다크모드 설정
  katexFontSize?: number    // KaTeX 글꼴 크기 (0.8~1.5)
}

// version(6) — stores 선언 (변경 없어도 version bump 필요)
db.version(6).stores({
  questions: '++id, subject, unit, questionCategory, difficulty, createdAt, createdBy',
  quizSessions: '++id, questionId, studentId, startedAt',
  quizAttempts: '++id, questionId, studentId, sessionId, attemptedAt, isCorrect',
  wrongNotes: '++id, questionId, studentId, [questionId+studentId], unit, questionCategory, lastWrongAt',
  workbooks: '++id, studentId, createdAt',
  userSettings: '++id, &userId',
  groups: '++id, instructorId, &inviteCode',
  groupMembers: '++id, groupId, studentId, [groupId+studentId]',
  assignments: '++id, groupId, workbookId',
})
// upgrade() 생략 가능 — optional 필드이므로 기존 레코드와 호환
```

### 아바타 이니셜 컴포넌트

```typescript
// components/profile/AvatarDisplay.tsx
interface AvatarDisplayProps {
  email: string
  name?: string
  avatarEmoji?: string
  size?: 'sm' | 'md' | 'lg'
}

export function AvatarDisplay({ email, name, avatarEmoji, size = 'md' }: AvatarDisplayProps) {
  const sizeClasses = { sm: 'w-8 h-8 text-sm', md: 'w-10 h-10 text-base', lg: 'w-16 h-16 text-2xl' }

  if (avatarEmoji) {
    return (
      <div className={`${sizeClasses[size]} rounded-full bg-primary/10 flex items-center justify-center`}>
        {avatarEmoji}
      </div>
    )
  }

  // 이니셜 기반 아바타
  const initials = (name ?? email).slice(0, 2).toUpperCase()
  return (
    <div className={`${sizeClasses[size]} rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold`}>
      {initials}
    </div>
  )
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| tailwind.config.js darkMode: 'class' | @custom-variant dark CSS-first | Tailwind v4 | config 파일 없음, index.css에서 선언 |
| window.confirm() 계정 삭제 확인 | shadcn Dialog (AlertDialog) | shadcn/ui 도입 | 접근성 개선, 커스텀 스타일 가능 |

**Deprecated/outdated:**
- `tailwind.config.js`: Tailwind v4에서 CSS-first 방식으로 전환. 이 프로젝트에 tailwind.config.js 없음 (정상).
- `prefers-color-scheme` 미디어쿼리 방식: 사용자 수동 토글이 필요하므로 class 기반이 필요.

---

## Open Questions

1. **학생 탭바 — 마이페이지 진입점**
   - What we know: 학생 탭바는 5개로 꽉 참. `/student/profile`은 ComingSoon으로 등록만 됨.
   - What's unclear: 탭바를 6개로 늘릴지 vs 헤더 아이콘 vs 홈 카드 진입으로 할지.
   - Recommendation: 헤더 상단의 아바타/이름 영역을 클릭 가능하게 만들어 진입. 또는 학생 홈에 "내 정보" 카드 추가. 탭바 변경은 최소화.

2. **UserSetting 저장 vs localStorage only**
   - What we know: isDarkMode, katexFontSize는 앱 초기화 시 동기적으로 필요하므로 localStorage가 필수 소스.
   - What's unclear: Dexie userSettings에도 저장해야 하는가.
   - Recommendation: localStorage를 primary source로, Dexie userSettings를 optional backup으로. settings.service.ts에서 두 곳 모두 업데이트.

3. **이모지 팔레트 범위**
   - What we know: avatarEmoji는 자유 입력 or 선택.
   - What's unclear: 이모지 selector UI 복잡도.
   - Recommendation: 20개 미리 정의된 이모지 그리드 선택 UI. 자유 입력은 구현 복잡도만 높임.

---

## Sources

### Primary (HIGH confidence)
- `/tailwindlabs/tailwindcss.com` (Context7) — dark mode: class 기반 `.dark` 선언, `@custom-variant dark`, localStorage 패턴, `document.documentElement.classList.toggle`
- `/websites/dexie` (Context7) — `Version.upgrade()`, optional 필드 추가 패턴
- 직접 코드 분석: `apps/web/src/index.css` — `.dark {}` 블록 존재 확인, `@custom-variant dark (&:is(.dark *))` 선언 확인
- 직접 코드 분석: `apps/web/src/lib/auth.ts` — User 인터페이스, USERS_KEY, CURRENT_USER_KEY 확인
- 직접 코드 분석: `apps/web/src/lib/db.ts` — Dexie version(5), UserSetting 인터페이스 확인
- 직접 코드 분석: `apps/web/src/routes/_layout.tsx` — 탭바 구조, ComingSoon 라우트 확인
- 직접 코드 분석: `apps/web/src/components/questions/LatexPreview.tsx` — `.katex-display` 클래스, CSS 상속 방식 확인

### Secondary (MEDIUM confidence)
- KaTeX 공식 문서 패턴 (Context7 미수록) — `.katex` 클래스에 CSS custom property 적용은 KaTeX HTML 출력 구조상 표준 패턴
- Tailwind v4 공식 블로그 — `@custom-variant` 지원 확인

### Tertiary (LOW confidence)
- 없음 — 모든 주요 결정사항이 코드베이스 직접 분석 또는 Context7로 검증됨

---

## Metadata

**Confidence breakdown:**
- Standard Stack: HIGH — 신규 패키지 없음, 기존 스택 전부 사용
- Architecture: HIGH — 코드베이스 전체 분석 후 기존 패턴과 일관된 구조 권장
- Dark Mode: HIGH — index.css에 .dark 블록 이미 존재, Context7 검증 완료
- KaTeX Font Size: MEDIUM — CSS custom property 패턴은 타당하나 KaTeX 내부 구조 변경 가능성 LOW
- Password Change: HIGH — auth.ts 직접 분석, POC 한계 명확히 문서화
- Account Deletion: HIGH — Dexie where().delete() 패턴 검증, 테이블별 삭제 방식 필요

**Research date:** 2026-02-21
**Valid until:** 2026-03-21 (Tailwind v4 / Dexie 4 안정 버전, 30일 유효)
