import { Router, IRouter } from 'express';
import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../db/index.js';
import { users, refreshTokens } from '../db/schema.js';
import {
  generateTokens,
  verifyRefreshToken,
  setTokenCookies,
  clearTokenCookies,
  authenticateToken,
} from '../middleware/auth.js';
import { loginLimiter } from '../middleware/rateLimit.js';

export const authRouter: IRouter = Router();

// ─── 유효성 검사 스키마 ───────────────────────────────────────────────────────

const registerSchema = z.object({
  email: z.string().email('올바른 이메일 형식이 아닙니다'),
  password: z.string().min(8, '비밀번호는 8자 이상이어야 합니다'),
});

const loginSchema = z.object({
  email: z.string().email('올바른 이메일 형식이 아닙니다'),
  password: z.string().min(1, '비밀번호를 입력하세요'),
});

const onboardingSchema = z.object({
  role: z.enum(['student', 'instructor'], {
    errorMap: () => ({ message: '역할은 student 또는 instructor 이어야 합니다' }),
  }),
});

// ─── POST /api/auth/register (AUTH-01) ───────────────────────────────────────

authRouter.post('/register', async (req, res) => {
  const { email, password } = registerSchema.parse(req.body);

  // 이미 가입된 이메일 확인
  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existing) {
    res.status(409).json({ error: '이미 가입된 이메일입니다' });
    return;
  }

  // 비밀번호 해싱
  const passwordHash = await bcrypt.hash(password, 10);

  // 사용자 생성
  const [newUser] = await db
    .insert(users)
    .values({ email, passwordHash, role: null, isOnboarded: false })
    .returning({ id: users.id, email: users.email, role: users.role, isOnboarded: users.isOnboarded });

  // 토큰 발급 및 쿠키 설정
  const { accessToken, refreshToken, refreshExpiresAt } = generateTokens({
    userId: newUser.id,
    email: newUser.email,
    role: newUser.role ?? null,
  });

  await db.insert(refreshTokens).values({
    userId: newUser.id,
    token: refreshToken,
    expiresAt: refreshExpiresAt,
  });

  setTokenCookies(res, accessToken, refreshToken);

  res.status(201).json({
    user: {
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
      isOnboarded: newUser.isOnboarded,
    },
  });
});

// ─── POST /api/auth/login (AUTH-02) ──────────────────────────────────────────

authRouter.post('/login', loginLimiter, async (req, res) => {
  const { email, password } = loginSchema.parse(req.body);

  // 사용자 조회
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!user) {
    // 사용자 열거 방지 — 통일된 에러 메시지 반환
    res.status(401).json({ error: '이메일 또는 비밀번호가 올바르지 않습니다' });
    return;
  }

  // 비밀번호 검증
  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    res.status(401).json({ error: '이메일 또는 비밀번호가 올바르지 않습니다' });
    return;
  }

  // 토큰 발급 및 쿠키 설정
  const { accessToken, refreshToken, refreshExpiresAt } = generateTokens({
    userId: user.id,
    email: user.email,
    role: user.role ?? null,
  });

  await db.insert(refreshTokens).values({
    userId: user.id,
    token: refreshToken,
    expiresAt: refreshExpiresAt,
  });

  setTokenCookies(res, accessToken, refreshToken);

  res.json({
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      isOnboarded: user.isOnboarded,
    },
  });
});

// ─── POST /api/auth/refresh (AUTH-03) ────────────────────────────────────────

authRouter.post('/refresh', async (req, res) => {
  const token = req.cookies?.refreshToken as string | undefined;

  if (!token) {
    clearTokenCookies(res);
    res.status(401).json({ error: '인증이 필요합니다' });
    return;
  }

  // refresh token JWT 검증
  let payload: { userId: number; tokenType: string };
  try {
    payload = verifyRefreshToken(token);
  } catch {
    clearTokenCookies(res);
    res.status(401).json({ error: '유효하지 않은 인증 토큰입니다' });
    return;
  }

  // DB에서 refresh token 존재 여부 확인
  const [storedToken] = await db
    .select()
    .from(refreshTokens)
    .where(eq(refreshTokens.token, token))
    .limit(1);

  if (!storedToken || storedToken.expiresAt < new Date()) {
    clearTokenCookies(res);
    res.status(401).json({ error: '만료된 인증 토큰입니다' });
    return;
  }

  // 사용자 조회 (최신 정보)
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, payload.userId))
    .limit(1);

  if (!user) {
    clearTokenCookies(res);
    res.status(401).json({ error: '사용자를 찾을 수 없습니다' });
    return;
  }

  // 기존 refresh token 삭제 (토큰 로테이션)
  await db.delete(refreshTokens).where(eq(refreshTokens.token, token));

  // 새 토큰 쌍 발급
  const { accessToken, refreshToken: newRefreshToken, refreshExpiresAt } = generateTokens({
    userId: user.id,
    email: user.email,
    role: user.role ?? null,
  });

  await db.insert(refreshTokens).values({
    userId: user.id,
    token: newRefreshToken,
    expiresAt: refreshExpiresAt,
  });

  setTokenCookies(res, accessToken, newRefreshToken);

  res.json({
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      isOnboarded: user.isOnboarded,
    },
  });
});

// ─── POST /api/auth/logout (AUTH-04) ─────────────────────────────────────────

authRouter.post('/logout', async (req, res) => {
  const token = req.cookies?.refreshToken as string | undefined;

  if (token) {
    // 해당 기기 refresh token만 삭제 (단일 기기 로그아웃)
    await db.delete(refreshTokens).where(eq(refreshTokens.token, token));
  }

  clearTokenCookies(res);

  res.json({ message: '로그아웃 되었습니다' });
});

// ─── PATCH /api/auth/onboarding (AUTH-05) ────────────────────────────────────

authRouter.patch('/onboarding', authenticateToken, async (req, res) => {
  const { role } = onboardingSchema.parse(req.body);
  const userId = req.user!.userId;

  // 이미 온보딩 완료된 사용자 확인
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) {
    res.status(404).json({ error: '사용자를 찾을 수 없습니다' });
    return;
  }

  if (user.isOnboarded) {
    res.status(400).json({ error: '이미 역할이 설정되었습니다' });
    return;
  }

  // 역할 업데이트
  const [updatedUser] = await db
    .update(users)
    .set({ role, isOnboarded: true, updatedAt: new Date() })
    .where(eq(users.id, userId))
    .returning({ id: users.id, email: users.email, role: users.role, isOnboarded: users.isOnboarded });

  // 업데이트된 role이 포함된 새 토큰 발급
  const { accessToken, refreshToken, refreshExpiresAt } = generateTokens({
    userId: updatedUser.id,
    email: updatedUser.email,
    role: updatedUser.role ?? null,
  });

  // 기존 refresh token 교체
  const oldToken = req.cookies?.refreshToken as string | undefined;
  if (oldToken) {
    await db.delete(refreshTokens).where(eq(refreshTokens.token, oldToken));
  }

  await db.insert(refreshTokens).values({
    userId: updatedUser.id,
    token: refreshToken,
    expiresAt: refreshExpiresAt,
  });

  setTokenCookies(res, accessToken, refreshToken);

  res.json({
    user: {
      id: updatedUser.id,
      email: updatedUser.email,
      role: updatedUser.role,
      isOnboarded: updatedUser.isOnboarded,
    },
  });
});

// ─── GET /api/auth/me (AUTH-03) ──────────────────────────────────────────────

authRouter.get('/me', authenticateToken, async (req, res) => {
  const userId = req.user!.userId;

  // DB에서 최신 사용자 정보 조회
  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      role: users.role,
      isOnboarded: users.isOnboarded,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) {
    res.status(404).json({ error: '사용자를 찾을 수 없습니다' });
    return;
  }

  res.json({ user });
});
