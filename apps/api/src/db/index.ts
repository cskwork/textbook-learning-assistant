import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema.js';

// Drizzle v1 간결 연결 방식 — node-postgres 어댑터 사용
export const db = drizzle(process.env.DATABASE_URL!, { schema });

// 스키마 재수출 (다른 모듈에서 편리하게 임포트 가능)
export { schema };
