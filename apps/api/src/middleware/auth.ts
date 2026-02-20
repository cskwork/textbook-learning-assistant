import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

// Express Request 타입 확장 — req.user 타입 정의
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: number;
        email: string;
        role: 'student' | 'instructor' | null;
      };
    }
  }
}

// JWT 페이로드 타입
interface AccessTokenPayload {
  userId: number;
  email: string;
  role: 'student' | 'instructor' | null;
}

interface RefreshTokenPayload {
  userId: number;
  tokenType: 'refresh';
}

// JWT 시크릿 — 환경변수에서 로드
const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET ?? 'dev-access-secret';
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET ?? 'dev-refresh-secret';

// 토큰 만료 시간
const ACCESS_TOKEN_EXPIRES_IN = '15m';
const REFRESH_TOKEN_EXPIRES_IN = '7d';
const ACCESS_MAX_AGE_MS = 15 * 60 * 1000; // 15분
const REFRESH_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7일

/**
 * JWT 토큰 쌍 생성
 * - access token: 15분 만료, userId/email/role 포함
 * - refresh token: 7일 만료, userId/tokenType 포함
 */
export function generateTokens(payload: AccessTokenPayload): {
  accessToken: string;
  refreshToken: string;
  refreshExpiresAt: Date;
} {
  const accessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
  });

  const refreshToken = jwt.sign(
    { userId: payload.userId, tokenType: 'refresh' } satisfies RefreshTokenPayload,
    REFRESH_TOKEN_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRES_IN },
  );

  const refreshExpiresAt = new Date(Date.now() + REFRESH_MAX_AGE_MS);

  return { accessToken, refreshToken, refreshExpiresAt };
}

/**
 * Refresh token 검증 — 페이로드 반환
 */
export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(token, REFRESH_TOKEN_SECRET) as RefreshTokenPayload;
}

/**
 * httpOnly 쿠키로 access/refresh 토큰 설정
 * 개발: secure=false, sameSite=lax (localhost CORS 대응)
 * 프로덕션: secure=true, sameSite=strict
 */
export function setTokenCookies(
  res: Response,
  accessToken: string,
  refreshToken: string,
): void {
  const isProduction = process.env.NODE_ENV === 'production';

  const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: (isProduction ? 'strict' : 'lax') as 'strict' | 'lax',
    path: '/',
  };

  res.cookie('accessToken', accessToken, {
    ...cookieOptions,
    maxAge: ACCESS_MAX_AGE_MS,
  });

  res.cookie('refreshToken', refreshToken, {
    ...cookieOptions,
    maxAge: REFRESH_MAX_AGE_MS,
  });
}

/**
 * 쿠키에서 access/refresh 토큰 삭제
 */
export function clearTokenCookies(res: Response): void {
  res.clearCookie('accessToken', { path: '/' });
  res.clearCookie('refreshToken', { path: '/' });
}

/**
 * JWT 인증 미들웨어
 * req.cookies.accessToken에서 JWT를 추출하고 검증
 * 성공 시 decoded payload를 req.user에 할당
 */
export function authenticateToken(req: Request, res: Response, next: NextFunction): void {
  const token = req.cookies?.accessToken as string | undefined;

  if (!token) {
    res.status(401).json({ error: '인증이 필요합니다' });
    return;
  }

  try {
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET) as AccessTokenPayload;
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };
    next();
  } catch {
    res.status(401).json({ error: '인증이 필요합니다' });
  }
}

/**
 * 역할 기반 접근 제어(RBAC) 미들웨어 팩토리
 * 허용된 역할 배열을 받아 미들웨어 반환
 * 온보딩 미완료(role === null) 상태도 처리
 */
export function authorize(allowedRoles: Array<'student' | 'instructor'>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = req.user;

    if (!user) {
      res.status(401).json({ error: '인증이 필요합니다' });
      return;
    }

    if (user.role === null || !allowedRoles.includes(user.role)) {
      res.status(403).json({ error: '권한이 없습니다' });
      return;
    }

    next();
  };
}
