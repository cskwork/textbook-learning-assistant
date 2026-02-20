// apps/web/src/services/group.service.ts
// 강사 그룹 관리 서비스 — groups/groupMembers/assignments CRUD + 모의 학생 데이터 시드
import { db, type Group, type GroupMember, type Assignment, type QuizAttempt } from '@/lib/db'

/** 6자리 대문자 영숫자 초대 코드 생성 */
function generateInviteCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

/** 모의 학생 데이터 — 그룹 리포트 테스트용 */
export const MOCK_STUDENTS = [
  { email: 'mock.student1@demo.com', name: '김민준' },
  { email: 'mock.student2@demo.com', name: '이서연' },
  { email: 'mock.student3@demo.com', name: '박지호' },
]

/**
 * 그룹 생성 — 유니크 초대 코드 자동 생성
 * 초대 코드 중복 시 재시도 (루프)
 */
export async function createGroup(instructorId: string, name: string): Promise<number> {
  let code: string
  do {
    code = generateInviteCode()
  } while ((await db.groups.where('inviteCode').equals(code).count()) > 0)

  return db.groups.add({
    instructorId,
    name,
    inviteCode: code,
    createdAt: Date.now(),
  } as Group)
}

/** 강사의 그룹 목록 — createdAt 역순 */
export async function listGroups(instructorId: string): Promise<Group[]> {
  const all = await db.groups.where('instructorId').equals(instructorId).toArray()
  return all.sort((a, b) => b.createdAt - a.createdAt)
}

/** 단일 그룹 조회 */
export async function getGroup(groupId: number): Promise<Group | undefined> {
  return db.groups.get(groupId)
}

/** 그룹 삭제 (멤버/과제 함께 삭제) */
export async function deleteGroup(groupId: number): Promise<void> {
  await db.groupMembers.where('groupId').equals(groupId).delete()
  await db.assignments.where('groupId').equals(groupId).delete()
  await db.groups.delete(groupId)
}

/** 초대 코드로 그룹 조회 — 대소문자 무관(입력값 toUpperCase 후 호출 필요) */
export async function findGroupByInviteCode(code: string): Promise<Group | undefined> {
  return db.groups.where('inviteCode').equals(code.toUpperCase()).first()
}

/**
 * 학생을 그룹에 추가 — 멱등 (이미 가입되면 무시)
 * [groupId+studentId] 복합 인덱스로 중복 확인
 */
export async function joinGroup(groupId: number, studentId: string): Promise<void> {
  const existing = await db.groupMembers
    .where('[groupId+studentId]')
    .equals([groupId, studentId])
    .count()
  if (existing > 0) return

  await db.groupMembers.add({
    groupId,
    studentId,
    joinedAt: Date.now(),
  } as GroupMember)
}

/** 그룹 멤버 목록 */
export async function listGroupMembers(groupId: number): Promise<GroupMember[]> {
  return db.groupMembers.where('groupId').equals(groupId).toArray()
}

/** 과제 배정 */
export async function assignWorkbook(params: {
  groupId: number
  workbookId: number
  title: string
  dueDate?: number
}): Promise<number> {
  return db.assignments.add({
    groupId: params.groupId,
    workbookId: params.workbookId,
    title: params.title,
    assignedAt: Date.now(),
    dueDate: params.dueDate,
  } as Assignment)
}

/** 그룹 과제 목록 — 최신 순 */
export async function listAssignments(groupId: number): Promise<Assignment[]> {
  const all = await db.assignments.where('groupId').equals(groupId).toArray()
  return all.sort((a, b) => b.assignedAt - a.assignedAt)
}

/** 과제 삭제 */
export async function deleteAssignment(assignmentId: number): Promise<void> {
  return db.assignments.delete(assignmentId)
}

/**
 * 모의 학생 데이터 시드 — 그룹 리포트 테스트용
 * - 문제가 없으면 시드 불가
 * - 이미 시드된 학생은 건너뜀 (멱등)
 * - 각 mock 학생을 groupId 그룹의 멤버로도 추가
 */
export async function seedMockStudentData(groupId: number): Promise<void> {
  const questions = await db.questions.toArray()
  if (questions.length === 0) return

  for (const student of MOCK_STUDENTS) {
    const existing = await db.quizAttempts
      .where('studentId')
      .equals(student.email)
      .count()

    if (existing === 0) {
      const count = 20 + Math.floor(Math.random() * 20)
      const now = Date.now()
      const attempts = Array.from({ length: count }, () => {
        const q = questions[Math.floor(Math.random() * questions.length)]
        const isCorrect = Math.random() > 0.4
        return {
          questionId: q.id,
          studentId: student.email,
          userAnswer: isCorrect ? q.answer : '999',
          isCorrect,
          timeSpent: 30 + Math.floor(Math.random() * 120),
          attemptedAt: now - Math.floor(Math.random() * 7 * 86400000),
          attemptCount: 1,
        } as Omit<QuizAttempt, 'id'>
      })
      await db.quizAttempts.bulkAdd(attempts as QuizAttempt[])
    }

    // 그룹 멤버로도 추가 (joinGroup 멱등)
    await joinGroup(groupId, student.email)
  }
}
