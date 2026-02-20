import { Request, Response, NextFunction } from 'express';

// Express 5 글로벌 에러 핸들러 — 반드시 4개 파라미터 필요
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(
  err: Error & { status?: number; statusCode?: number },
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const statusCode = err.status ?? err.statusCode ?? 500;

  const isDevelopment = process.env.NODE_ENV === 'development';

  res.status(statusCode).json({
    error: err.message || '서버 내부 오류가 발생했습니다',
    ...(isDevelopment && { stack: err.stack }),
  });
}
