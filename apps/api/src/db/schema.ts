import {
  pgTable,
  pgEnum,
  integer,
  varchar,
  text,
  timestamp,
  boolean,
} from 'drizzle-orm/pg-core';

// 사용자 역할 enum — 온보딩 완료 후 학생 또는 강사로 설정됨
export const userRoleEnum = pgEnum('user_role', ['student', 'instructor']);

// 사용자 테이블
export const users = pgTable('users', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  // null = 온보딩 미완료 (가입 직후 상태)
  role: userRoleEnum('role'),
  isOnboarded: boolean('is_onboarded').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// 리프레시 토큰 테이블 — DB 저장으로 로그아웃 시 무효화 가능
export const refreshTokens = pgTable('refresh_tokens', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// 타입 추론용 export
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type RefreshToken = typeof refreshTokens.$inferSelect;
export type NewRefreshToken = typeof refreshTokens.$inferInsert;
