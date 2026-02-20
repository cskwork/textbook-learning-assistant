# Phase 7: 강사 관리 포털 — Research

**Researched:** 2026-02-20
**Domain:** IndexedDB (Dexie) 그룹/과제 관리, 모의 학생 데이터, 강사 포털 UI
**Confidence:** HIGH (Dexie 패턴 — 기존 코드베이스 직접 확인), MEDIUM (모의 학생 데이터 구조), HIGH (React 컴포넌트 패턴)

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| INST-01 | 강사가 학생 그룹(반)을 생성·관리할 수 있다 | Dexie version(5) groups 테이블 + group.service.ts CRUD. groups: 그룹 이름, inviteCode, 강사 ID. INST-01 UI: 그룹 생성/목록/상세 페이지 |
| INST-02 | 강사가 학생을 그룹에 초대(초대 코드)할 수 있다 | 초대 코드(6자리 랜덤 문자열) IndexedDB 저장. 학생이 코드 입력 → groupMembers에 추가. POC: 같은 브라우저 내에서 로컬 처리 |
| INST-03 | 강사가 DIY 문제집으로 과제를 출제하여 그룹에 배정할 수 있다 | Dexie assignments 테이블 (groupId, workbookId, dueDate?). 강사가 기존 Workbook을 선택 → 그룹에 배정. 기존 workbook.service.ts 재사용 |
| INST-04 | 강사가 그룹 학생들의 학습 리포트를 조회할 수 있다 | POC: 모의 학생 데이터(mockStudents)를 같은 브라우저에 시드. analytics.service.ts 함수를 각 studentId에 적용하여 집계. recharts 차트 재사용 |
| INST-05 | 강사가 학생별 취약 유형 분석 결과를 볼 수 있다 | getWeakCategories(studentId) 함수 재사용. 학생별 취약 유형 목록 표시. 기존 analytics.service.ts 직접 활용 |
</phase_requirements>

---

## Summary

Phase 7은 POC 아키텍처(Dexie IndexedDB + 프론트엔드 전용)에서 강사 관리 포털을 구현한다. 실제 다중 사용자 시스템이 없으므로 핵심 도전은 모의(mock) 학생 데이터를 같은 브라우저에서 다루는 것이다.

**아키텍처 결정 (Additional Context에서 확정):** Dexie version(5)로 세 테이블을 추가한다 — `groups`(그룹 정보 + 초대 코드), `groupMembers`(그룹-학생 다대다), `assignments`(그룹 과제). 모의 학생 데이터는 기존 quizAttempts/wrongNotes 테이블에 mock studentId(email)로 직접 시드하여 기존 analytics.service.ts를 수정 없이 재사용한다.

초대 코드는 6자리 대문자 영숫자 문자열로 IndexedDB에 저장된다. 학생이 코드를 입력하면 같은 브라우저의 groups 테이블에서 조회하여 groupMembers에 추가한다. 강사 리포트 뷰는 groupMembers 목록을 iterate하여 각 studentId에 대해 기존 analytics.service.ts 함수를 호출한다. 학생이 없으면 모의 데이터 시드 버튼을 제공한다.

**Primary recommendation:** Dexie version(5) 신규 테이블 3개 + 기존 analytics.service.ts/workbook.service.ts 재사용 + 모의 학생 데이터 시드 함수. 새 라이브러리 설치 없음.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Dexie | ^4.3.0 (이미 설치) | version(5) 스키마 확장 + groups/groupMembers/assignments CRUD | 기존 프로젝트 표준 IndexedDB 레이어 |
| dexie-react-hooks | ^4.2.0 (이미 설치) | useLiveQuery로 그룹/과제 목록 실시간 반응 | 이미 사용 중 |
| recharts | 2.15.x (이미 설치) | 그룹 분석 차트 재사용 | 이미 Phase 5에서 사용 중 |
| shadcn/ui | (이미 설치) | Card, Button, Input, Select, Badge, Table | 이미 사용 중 |
| lucide-react | ^0.511.0 (이미 설치) | Users, ClipboardList, BarChart2, PlusCircle 아이콘 | 이미 사용 중 |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| (없음) | - | Phase 7은 신규 npm 패키지 설치 불필요 | 기존 스택 완전 재사용 |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Dexie 동일 테이블에 mock studentId | 별도 mockData.ts JSON | Dexie에 시드하면 analytics.service.ts를 수정 없이 재사용 가능; JSON은 서비스 함수를 다시 만들어야 함 |
| 6자리 초대 코드 | UUID | 6자리가 교육 앱 UX에 적합 (학생이 입력하기 쉬움) |
| recharts 재사용 | 새 차트 라이브러리 | recharts 이미 설치됨, 강사 리포트도 동일 차트 타입 사용 |

**Installation:**
```bash
# 신규 패키지 설치 없음 — 기존 스택 완전 재사용
```

---

## Architecture Patterns

### Dexie version(5) 스키마 확장

기존 버전 체인(1→2→3→4)을 유지하고 version(5)를 추가한다. **절대 기존 version 수정 금지.**

```typescript
// apps/web/src/lib/db.ts 추가 인터페이스
export interface Group {
  id: number
  instructorId: string   // instructor email
  name: string           // 반 이름 (예: "2025 수능반 A")
  inviteCode: string     // 6자리 대문자 영숫자 (예: "AB1C2D")
  createdAt: number      // Date.now()
}

export interface GroupMember {
  id: number
  groupId: number        // Group.id
  studentId: string      // student email
  joinedAt: number       // Date.now()
}

export interface Assignment {
  id: number
  groupId: number        // Group.id
  workbookId: number     // Workbook.id
  title: string          // 과제 제목 (workbook.title 복사 또는 커스텀)
  assignedAt: number     // Date.now()
  dueDate?: number       // 마감일 (선택, Date.now() 기준 ms)
}
```

```typescript
// version(5): 강사 관리 포털 (groups, groupMembers, assignments)
// ⚠️ 기존 version(1)~(4) 절대 수정하지 말 것
db.version(5).stores({
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
```

**인덱스 설계 근거:**
- `&inviteCode` — 초대 코드는 유니크, 학생 코드 입력 시 빠른 조회
- `[groupId+studentId]` 복합 인덱스 — 중복 멤버십 방지 (같은 학생이 같은 그룹에 두 번 가입 방지)

### 초대 코드 생성 패턴

```typescript
// 6자리 대문자 영숫자 코드 생성 (Math.random 기반, POC 충분)
function generateInviteCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}
```

**중복 확인:** `db.groups.where('inviteCode').equals(code).count()` → 0이면 사용 가능.

### 모의 학생 데이터 시드 패턴

POC에서 강사 리포트에 보여줄 데이터를 만들기 위해 모의 학생 데이터를 동일 브라우저 IndexedDB에 시드한다. 기존 analytics.service.ts는 studentId(email)만 받으므로 mock email로 quizAttempts를 추가하면 된다.

```typescript
// apps/web/src/services/group.service.ts

export const MOCK_STUDENTS = [
  { email: 'mock.student1@demo.com', name: '김민준' },
  { email: 'mock.student2@demo.com', name: '이서연' },
  { email: 'mock.student3@demo.com', name: '박지호' },
]

export async function seedMockStudentData(): Promise<void> {
  const questions = await db.questions.toArray()
  if (questions.length === 0) return  // 문제 없으면 시드 불가

  for (const student of MOCK_STUDENTS) {
    // 이미 시드됐으면 건너뜀
    const existing = await db.quizAttempts.where('studentId').equals(student.email).count()
    if (existing > 0) continue

    // 각 학생에게 랜덤 시도 20~40개 생성
    const count = 20 + Math.floor(Math.random() * 20)
    const now = Date.now()
    const attempts = Array.from({ length: count }, (_, i) => {
      const q = questions[Math.floor(Math.random() * questions.length)]
      return {
        questionId: q.id,
        studentId: student.email,
        userAnswer: Math.random() > 0.4 ? q.answer : '999',
        isCorrect: Math.random() > 0.4,
        timeSpent: 30 + Math.floor(Math.random() * 120),
        attemptedAt: now - Math.floor(Math.random() * 7 * 86400000),
        attemptCount: 1,
      }
    })
    await db.quizAttempts.bulkAdd(attempts as QuizAttempt[])
  }
}
```

### 강사 그룹 서비스 함수 패턴

기존 서비스(workbook.service.ts) 패턴을 따른다 — 순수 async 함수, db 직접 접근, 반환값 명시.

```typescript
// apps/web/src/services/group.service.ts

// 그룹 생성
export async function createGroup(instructorId: string, name: string): Promise<number>

// 강사의 그룹 목록
export async function listGroups(instructorId: string): Promise<Group[]>

// 그룹 단일 조회
export async function getGroup(groupId: number): Promise<Group | undefined>

// 그룹 삭제
export async function deleteGroup(groupId: number): Promise<void>

// 초대 코드로 그룹 조회
export async function findGroupByInviteCode(code: string): Promise<Group | undefined>

// 학생을 그룹에 추가 (중복 방지)
export async function joinGroup(groupId: number, studentId: string): Promise<void>

// 그룹 멤버 목록
export async function listGroupMembers(groupId: number): Promise<GroupMember[]>

// 과제 배정
export async function assignWorkbook(params: {
  groupId: number
  workbookId: number
  title: string
  dueDate?: number
}): Promise<number>

// 그룹 과제 목록
export async function listAssignments(groupId: number): Promise<Assignment[]>
```

### 강사 리포트 집계 패턴

기존 analytics.service.ts를 그대로 호출한다 — 각 멤버의 studentId에 대해.

```typescript
// GroupReportPage에서
const members = await listGroupMembers(groupId)
const reports = await Promise.all(
  members.map(async (m) => ({
    studentId: m.studentId,
    studentName: MOCK_STUDENTS.find(s => s.email === m.studentId)?.name ?? m.studentId,
    overall: await getOverallStats(m.studentId),
    weakCategories: await getWeakCategories(m.studentId),
  }))
)
```

### 라우트 구조

기존 instructor 라우트를 확장한다:

```
/instructor                          → InstructorHomePage (업데이트: 실데이터)
/instructor/groups                   → 그룹 목록 (GroupListPage) — 신규
/instructor/groups/new               → 그룹 생성 폼 (GroupNewPage) — 신규
/instructor/groups/:id               → 그룹 상세 (GroupDetailPage: 멤버 + 과제) — 신규
/instructor/groups/:id/report        → 그룹 학습 리포트 (GroupReportPage) — 신규
/instructor/groups/:id/assign        → 과제 출제 폼 (AssignWorkbookPage) — 신규
/student/join-group                  → 초대 코드 입력 페이지 (JoinGroupPage) — 신규 (학생용)
```

**_layout.tsx 강사 네비게이션 업데이트:**
현재 `instructorNavItems`에 `/instructor/students`(ComingSoon)가 있으므로 `/instructor/groups`로 교체한다.

```typescript
const instructorNavItems: NavItem[] = [
  { path: '/instructor', label: '홈', icon: Home },
  { path: '/instructor/problems', label: '문제관리', icon: BookOpen },
  { path: '/instructor/groups', label: '반관리', icon: Users },  // students → groups
  { path: '/instructor/profile', label: '마이페이지', icon: User },
]
```

### Anti-Patterns to Avoid

- **GroupMember 중복 삽입 금지:** `[groupId+studentId]` 복합 인덱스 + 삽입 전 count() 확인으로 방지
- **mock 학생 데이터를 별도 JSON으로 관리 금지:** Dexie에 시드해야 analytics.service.ts 재사용 가능
- **새 차트 컴포넌트 만들지 말 것:** 기존 AccuracyBarChart, WeakTypeRadarChart 직접 재사용
- **인증 확인 없이 그룹 접근 금지:** `group.instructorId !== user.email` 체크 필수

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| 실시간 목록 업데이트 | 수동 상태 관리 + 재fetch | `useLiveQuery(db.groups.where('instructorId')...)` | Dexie 변경 감지 자동화 |
| 과제 통계 집계 | 새 집계 함수 | `getOverallStats`, `getCategoryAccuracy` (analytics.service.ts) | Phase 5에서 이미 구현됨 |
| 차트 컴포넌트 | 강사용 새 차트 | `AccuracyBarChart`, `WeakTypeRadarChart` (Phase 5 컴포넌트) | 동일 데이터 구조, 재사용 가능 |

**Key insight:** Phase 7은 새 기능보다 기존 기능의 재조합이다. analytics.service.ts, workbook.service.ts, 차트 컴포넌트를 수정 없이 재사용하는 것이 핵심이다.

---

## Common Pitfalls

### Pitfall 1: Dexie 복합 인덱스 조회 구문 오류
**What goes wrong:** `[groupId+studentId]` 복합 인덱스 쿼리 시 구문 오류
**Why it happens:** Dexie 복합 인덱스는 `.where('[groupId+studentId]').equals([groupId, studentId])` 형식 필요
**How to avoid:** Phase 3 패턴 참조 — `wrongNotes` 테이블의 `[questionId+studentId]` 복합 인덱스 쿼리 방식 동일 적용
**Warning signs:** TypeScript 빌드 통과하지만 런타임에서 빈 결과 반환

### Pitfall 2: 모의 데이터 중복 시드
**What goes wrong:** seedMockStudentData()를 여러 번 호출하면 quizAttempts가 중복 추가됨
**Why it happens:** 멱등성 없이 단순 bulkAdd만 호출
**How to avoid:** 시드 전 `db.quizAttempts.where('studentId').equals(email).count() > 0`이면 건너뜀
**Warning signs:** 그룹 리포트에서 학생 통계가 비정상적으로 높음

### Pitfall 3: 강사 그룹 접근 권한 체크 누락
**What goes wrong:** 학생이 직접 URL 입력으로 강사 그룹 상세 페이지 접근 가능
**Why it happens:** 라우트 접근 제어만 있고 데이터 레이어 권한 체크 없음
**How to avoid:** groupService 함수에서 `group.instructorId !== user.email` 확인 후 null/throw 처리. UI는 `user.role !== 'instructor'`이면 리디렉트
**Warning signs:** `_layout.tsx`의 RBAC만 믿고 서비스 레이어 체크 생략

### Pitfall 4: 과제 배정 시 Workbook 소유권 미확인
**What goes wrong:** 강사가 다른 학생의 workbook을 과제로 배정
**Why it happens:** `db.workbooks`에서 studentId 필터 없이 전체 조회
**How to avoid:** `listWorkbooks(instructorId)` — 강사 자신이 만든 workbook만 과제로 선택 가능. 강사가 문제를 등록하면 workbook도 만들 수 있으므로 `instructorId`(email)로 필터링
**Warning signs:** 과제 선택 드롭다운에 다른 사용자 문제집이 나타남

### Pitfall 5: 초대 코드 대소문자 구분
**What goes wrong:** 학생이 소문자로 입력하면 코드 조회 실패
**Why it happens:** Dexie `where().equals()`는 대소문자 구분
**How to avoid:** 코드 입력 시 `.toUpperCase()` 변환 후 조회
**Warning signs:** 올바른 코드인데 "존재하지 않는 그룹" 에러

---

## Code Examples

### Group CRUD — Dexie 패턴

```typescript
// Source: 기존 workbook.service.ts 패턴 + db.ts version(5) 스키마

// 그룹 생성 (중복 코드 방지 포함)
export async function createGroup(instructorId: string, name: string): Promise<number> {
  let code: string
  do {
    code = generateInviteCode()
  } while (await db.groups.where('inviteCode').equals(code).count() > 0)

  return db.groups.add({
    instructorId,
    name,
    inviteCode: code,
    createdAt: Date.now(),
  } as Group)
}

// 초대 코드로 참여 (중복 방지)
export async function joinGroup(groupId: number, studentId: string): Promise<void> {
  const existing = await db.groupMembers
    .where('[groupId+studentId]')
    .equals([groupId, studentId])
    .count()
  if (existing > 0) return  // 이미 가입됨 (멱등)

  await db.groupMembers.add({
    groupId,
    studentId,
    joinedAt: Date.now(),
  } as GroupMember)
}
```

### useLiveQuery 그룹 목록

```typescript
// Source: Phase 3/4 패턴 (useLiveQuery 사용)
const groups = useLiveQuery(
  () => user ? db.groups.where('instructorId').equals(user.email).toArray() : [],
  [user?.email],
)
```

### 그룹 리포트 집계

```typescript
// Source: Phase 5 analytics.service.ts 재사용
import { getOverallStats, getWeakCategories } from '@/services/analytics.service'

const reports = await Promise.all(
  memberEmails.map(async (email) => ({
    email,
    name: MOCK_STUDENTS.find(s => s.email === email)?.name ?? email,
    overall: await getOverallStats(email),
    weakCategories: (await getWeakCategories(email)).slice(0, 3),
  }))
)
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Dexie 직접 EntityTable 타입 없음 | EntityTable<T, 'id'> 패턴 | Phase 2 | TypeScript 타입 안전 IndexedDB |
| version 축적 없이 단일 정의 | version(N).stores({...}) 체인 | Phase 2~5 | 브라우저 마이그레이션 경로 보존 |

**Deprecated/outdated:**
- `apps/web/src/routes/instructor/students` (ComingSoon): Phase 7에서 `/instructor/groups`로 교체됨

---

## Open Questions

1. **학생 탭바에 그룹 참여 메뉴 추가 여부**
   - What we know: 현재 학생 탭바는 5개(홈, 문제풀기, 오답노트, 문제집, 분석)로 꽉 찼음
   - What's unclear: 탭 추가 vs 홈 화면에 "그룹 참여" 버튼 배치
   - Recommendation: 홈 화면 또는 마이페이지(/student/profile) 내에 "그룹 참여" 섹션 배치. 탭바 변경 없음

2. **실제 학생이 그룹에 가입한 흔적이 없을 때 리포트**
   - What we know: groupMembers 테이블에 mock studentId를 직접 넣을 수 있음
   - What's unclear: 초대 코드로만 가입 vs 강사가 직접 mock 학생 추가
   - Recommendation: "모의 학생 데이터 시드" 버튼을 그룹 상세 페이지에 제공. 버튼 클릭 시 mock 학생 3명이 그룹에 가입되고 quizAttempts도 시드됨

3. **과제 배정 시 강사 workbook 없는 경우**
   - What we know: 강사가 workbook을 만들려면 student 역할이 필요한 구조 (workbook은 studentId 기준)
   - What's unclear: 강사가 workbook을 만들 수 있어야 하는가
   - Recommendation: POC에서는 `listWorkbooks(user.email)` — 강사 email로 저장된 workbook 조회. 강사가 workbook을 만들 수 있도록 `/student/workbooks/create`와 동일한 흐름을 강사 과제 배정 UI에서 제공하거나, 기존 workbook 목록에서 선택. 간단히 하려면: 강사가 workbook을 별도로 만들 수 있도록 `/instructor/groups/:id/assign`에서 WorkbookCreator 컴포넌트 임베드

---

## Sources

### Primary (HIGH confidence)
- `apps/web/src/lib/db.ts` — 기존 Dexie 스키마 패턴, EntityTable, 버전 체인 방식 직접 확인
- `apps/web/src/services/analytics.service.ts` — getOverallStats, getWeakCategories 재사용 가능 확인
- `apps/web/src/services/workbook.service.ts` — listWorkbooks(studentId) 패턴, getFilterOptions 패턴
- `apps/web/src/routes/_layout.tsx` — 강사 navItems 구조, 교체 대상 확인
- `apps/web/src/main.tsx` — 라우트 추가 위치 확인

### Secondary (MEDIUM confidence)
- Phase 5 recharts/shadcn 차트 컴포넌트 패턴 — AccuracyBarChart, WeakTypeRadarChart 재사용 가능성

### Tertiary (LOW confidence)
- 모의 학생 데이터 구조(이름/이메일) — 임의 설계, 실제 사용자 피드백 없음

---

## Metadata

**Confidence breakdown:**
- Standard Stack: HIGH — 기존 db.ts 직접 분석, 신규 설치 없음
- Architecture: HIGH — version(5) 패턴은 기존 v1~v4와 동일, Dexie EntityTable 검증됨
- Pitfalls: HIGH — 복합 인덱스 패턴(Phase 3 wrongNotes 동일), 대소문자 문제(일반 상식)
- 모의 데이터 시드: MEDIUM — POC 설계, 실제 다중 사용자 없는 특수한 구조

**Research date:** 2026-02-20
**Valid until:** 2026-03-20 (Dexie 4.x 안정, 변경 가능성 낮음)
