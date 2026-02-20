import rateLimit from 'express-rate-limit';

/**
 * 로그인 엔드포인트 rate limiter
 * 15분 윈도우 내 최대 5회 시도 허용
 * 초과 시 429 에러 반환
 */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 5, // 최대 5회
  standardHeaders: true, // RateLimit-* 헤더 포함
  legacyHeaders: false, // X-RateLimit-* 헤더 비활성화
  message: { error: '로그인 시도가 너무 많습니다. 15분 후 다시 시도하세요' },
  skipSuccessfulRequests: false, // 성공한 요청도 카운트
});
