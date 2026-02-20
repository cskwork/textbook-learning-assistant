import 'dotenv/config';
import express, { Express } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { errorHandler } from './middleware/errorHandler.js';
import { authRouter } from './routes/auth.js';

const app: Express = express();
const PORT = process.env.PORT ?? 3000;

// 미들웨어 체인
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
    credentials: true,
  }),
);
app.use(cookieParser());

// 헬스 체크 엔드포인트
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// 인증 라우트
app.use('/api/auth', authRouter);

// 글로벌 에러 핸들러 (라우트 등록 후 마지막에 위치)
app.use(errorHandler);

// 서버 시작
app.listen(PORT, () => {
  console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다 (NODE_ENV: ${process.env.NODE_ENV ?? 'development'})`);
});

export default app;
