# Architecture Research

**Domain:** 교육 퀴즈/시험 플랫폼 (수학 기출문제 학습 웹앱, PWA)
**Researched:** 2026-02-19
**Confidence:** HIGH (핵심 컴포넌트 경계), MEDIUM (BKT/DKT 통합 세부사항)

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER (PWA)                            │
├──────────────┬──────────────┬──────────────┬───────────────────────┤
│  학생 앱      │  강사 관리    │  오답노트     │  문제집 생성기         │
│  (Student)   │  (Teacher    │  (Error      │  (DIY Worksheet       │
│              │   Admin)     │   Notebook)  │   Generator)          │
└──────┬───────┴──────┬───────┴──────┬───────┴───────┬───────────────┘
       │              │              │               │
       │     Service Worker (오프라인 캐싱 / PWA)      │
       │              │              │               │
├──────▼──────────────▼──────────────▼───────────────▼───────────────┤
│                    API GATEWAY / Express.js                          │
│              JWT 인증 미들웨어 + RBAC 권한 제어                        │
├─────────────┬───────────────┬──────────────┬────────────────────────┤
│  Auth       │  Question     │  Quiz        │  Analytics /           │
│  Service    │  Bank Service │  Engine      │  AI Recommend          │
│             │               │  Service     │  Service               │
├─────────────┴───────────────┴──────────────┴────────────────────────┤
│                        DATA LAYER                                    │
│  ┌─────────────┐  ┌──────────┐  ┌─────────────┐  ┌──────────────┐  │
│  │ PostgreSQL  │  │  Redis   │  │  File Store │  │  ML Model    │  │
│  │ (메인 DB)   │  │  (캐시)  │  │  (미디어)   │  │  (BKT/DKT)   │  │
│  └─────────────┘  └──────────┘  └─────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| **Student App** | 문제 풀이 UI, 오답노트 열람, 대시보드, 추천 문제 수령 | React SPA + KaTeX 수식 렌더링 |
| **Teacher Admin** | 문제 등록/수정, 학생 관리, 반 성과 모니터링, 리포트 열람 | React + RBAC 보호 라우트 |
| **DIY Worksheet Generator** | 조건(과목/단원/난이도/문항수) 선택 → 문제 필터링 → PDF/화면 출력 | React + 백엔드 질의 API |
| **Service Worker** | 정적 자산 사전 캐싱, 오프라인 시 문제 풀이 지원, 백그라운드 동기화 | Workbox (cache-first 전략) |
| **API Gateway** | JWT 검증, RBAC 미들웨어, 라우팅, 요청 로깅 | Express.js + middleware 체인 |
| **Auth Service** | 회원가입/로그인, JWT 발급·갱신, 역할(student/teacher/admin) 관리 | bcrypt + JWT + refresh token |
| **Question Bank Service** | 문제 CRUD, 태깅(과목/단원/유형/난이도), 검색·필터링 | Express 라우터 + PostgreSQL |
| **Quiz Engine Service** | 세션 생성, 문항 배출, 답안 수신, 자동 채점, 오답 기록 | 상태머신 패턴 (풀이 세션) |
| **Analytics / AI Recommend Service** | 학습 이력 집계, BKT/DKT 상태 추정, 추천 문제 산출, 리포트 생성 | Node.js 서비스 or Python 마이크로서비스 |
| **PostgreSQL** | 모든 영구 데이터(사용자, 문제, 풀이 이력, 오답노트) 저장 | Sequelize ORM or Prisma |
| **Redis** | 세션/JWT 블랙리스트, 빠른 추천 캐싱, 풀이 세션 임시 상태 | ioredis |

---

## Recommended Project Structure

```
project-root/
├── client/                         # React PWA 프론트엔드
│   ├── public/
│   │   ├── manifest.json           # PWA 매니페스트
│   │   └── icons/
│   ├── src/
│   │   ├── app/                    # 라우팅, 글로벌 설정
│   │   │   ├── router.tsx
│   │   │   └── store.ts            # Zustand / Redux 스토어
│   │   ├── features/               # 도메인별 기능 모듈
│   │   │   ├── auth/               # 로그인, 회원가입
│   │   │   ├── quiz/               # 문제 풀이 엔진 UI
│   │   │   ├── error-notebook/     # 오답노트
│   │   │   ├── dashboard/          # 학습 리포트
│   │   │   ├── worksheet/          # DIY 문제집 생성기
│   │   │   └── admin/              # 강사 관리 페이지
│   │   ├── components/             # 공통 컴포넌트
│   │   │   └── MathRenderer.tsx    # KaTeX 래퍼
│   │   ├── hooks/                  # 공통 커스텀 훅
│   │   ├── services/               # API 클라이언트 (axios)
│   │   └── sw/                     # Service Worker (Workbox)
│   └── vite.config.ts
│
├── server/                         # Node.js + Express 백엔드
│   ├── src/
│   │   ├── app.ts                  # Express 앱 설정
│   │   ├── middleware/
│   │   │   ├── auth.ts             # JWT 검증
│   │   │   └── rbac.ts             # 역할 기반 권한 제어
│   │   ├── modules/                # 기능 도메인별 모듈
│   │   │   ├── auth/
│   │   │   │   ├── auth.router.ts
│   │   │   │   ├── auth.service.ts
│   │   │   │   └── auth.controller.ts
│   │   │   ├── questions/          # 문제 뱅크
│   │   │   │   ├── questions.router.ts
│   │   │   │   ├── questions.service.ts
│   │   │   │   └── questions.controller.ts
│   │   │   ├── quiz/               # 풀이 엔진 (세션 관리)
│   │   │   ├── error-notebook/     # 오답 기록 CRUD
│   │   │   ├── analytics/          # 리포트, KT 추정
│   │   │   └── worksheet/          # 문제집 생성
│   │   ├── db/
│   │   │   ├── schema.sql          # 마이그레이션 정의
│   │   │   └── models/             # Prisma 스키마 or Sequelize 모델
│   │   └── config/
│   │       └── env.ts
│   └── package.json
│
└── ml/                             # (선택적) Python ML 서비스
    ├── kt_model/                   # BKT / DKT 모델
    │   ├── bkt.py
    │   └── dkt.py
    ├── api.py                      # FastAPI 엔드포인트
    └── requirements.txt
```

### Structure Rationale

- **features/ (클라이언트):** 각 기능이 자체 컴포넌트/훅/서비스를 캡슐화. 강사 관리와 학생 기능을 명확히 분리.
- **modules/ (서버):** 라우터–컨트롤러–서비스 3계층 패턴. 각 도메인(문제, 퀴즈, 분석)이 독립 모듈. 단독 테스트 용이.
- **ml/ (분리):** BKT/DKT는 Node.js에서 직접 구현하거나 Python FastAPI 마이크로서비스로 분리. 초기에는 Node.js 내 라이브러리 사용 권장, 이후 고도화 시 분리.

---

## Architectural Patterns

### Pattern 1: Feature-Sliced 라우터–컨트롤러–서비스

**What:** 각 도메인 기능을 router(경로 정의) → controller(요청/응답 처리) → service(비즈니스 로직) → db(데이터 접근)의 4계층으로 분리.

**When to use:** 문제 뱅크, 퀴즈 엔진, 오답노트 등 CRUD 중심 기능 전체.

**Trade-offs:** 소규모 기능에는 과도하지만, 팀 규모가 커지면 명확한 경계를 제공. 이 프로젝트 규모에서는 적합.

**Example:**
```typescript
// questions.router.ts
router.get('/', authMiddleware, rbac(['student','teacher','admin']), questionsController.list);
router.post('/', authMiddleware, rbac(['teacher','admin']), questionsController.create);

// questions.controller.ts
async list(req, res) {
  const { subject, unit, type, difficulty, page } = req.query;
  const result = await questionsService.findMany({ subject, unit, type, difficulty, page });
  res.json(result);
}

// questions.service.ts
async findMany(filters) {
  return db.question.findMany({ where: filters, include: { tags: true } });
}
```

### Pattern 2: RBAC 미들웨어 체인 (JWT + 역할 분리)

**What:** JWT 토큰에 역할(role: student | teacher | admin)을 포함하고, 미들웨어에서 역할에 따라 엔드포인트 접근을 제어.

**When to use:** 학생 vs 강사 vs 관리자가 다른 데이터와 기능에 접근해야 하는 모든 API 엔드포인트.

**Trade-offs:** JWT 페이로드에 최소한의 역할 정보만 담는다. 세밀한 권한(예: 특정 반만 관리)은 DB 조회 필요.

**Example:**
```typescript
// rbac.ts
export const rbac = (allowedRoles: string[]) => (req, res, next) => {
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ message: '권한이 없습니다.' });
  }
  next();
};

// auth.ts — JWT 검증
export const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: '인증이 필요합니다.' });
  req.user = jwt.verify(token, process.env.JWT_SECRET);
  next();
};
```

### Pattern 3: 퀴즈 세션 상태머신

**What:** 퀴즈 풀이 세션을 상태머신으로 관리. 상태: `idle → started → in_progress → submitted → graded`. Redis에 세션 임시 상태, PostgreSQL에 최종 결과 영구 저장.

**When to use:** 시험 세션 시작, 문항 순서 관리, 타이머, 중간 이탈 복원.

**Trade-offs:** Redis를 추가하면 복잡도 상승. 초기 MVP에서는 PostgreSQL만으로 단순화 가능 (세션당 created_at으로 타임아웃 처리).

**Example:**
```typescript
// quiz.service.ts
async startSession(userId: string, config: QuizConfig) {
  const questions = await this.selectQuestions(config);  // 난이도·단원 필터
  const session = await db.quizSession.create({
    data: { userId, status: 'in_progress', questions: { connect: questions.map(q => ({id: q.id})) } }
  });
  return session;
}

async submitAnswer(sessionId: string, questionId: string, answer: string) {
  const question = await db.question.findUnique({ where: { id: questionId } });
  const isCorrect = question.correctAnswer === answer;
  await db.quizAnswer.create({
    data: { sessionId, questionId, answer, isCorrect }
  });
  if (!isCorrect) {
    await db.errorNote.upsert({  // 오답노트 자동 등록
      where: { userId_questionId: { userId: session.userId, questionId } },
      update: { incorrectCount: { increment: 1 } },
      create: { userId: session.userId, questionId, incorrectCount: 1 }
    });
  }
  return { isCorrect };
}
```

### Pattern 4: Knowledge Tracing 분리 서비스

**What:** BKT/DKT 로직을 별도의 서비스 함수(또는 Python 마이크로서비스)로 분리. Node.js Analytics Service가 풀이 이력을 조회하여 KT 서비스를 호출하고, 결과(지식 상태 p_know)를 DB에 저장.

**When to use:** AI 추천 기능 전체.

**Trade-offs:** BKT는 순수 JS로 구현 가능(간단한 은닉 마르코프 모델). DKT는 PyTorch/TensorFlow 의존 → Python 서비스 분리 필요. MVP에서는 BKT만 우선 구현 권장.

```
풀이 이력 → Analytics Service → BKT 업데이트 → knowledge_state 테이블 업데이트
                                              ↓
                                   추천 API 호출 시 p_know 낮은 개념 조회
                                   → 관련 문제 필터링 → 추천 목록 반환
```

---

## Data Flow

### Request Flow (문제 풀이)

```
[학생: 문제 풀기 버튼 클릭]
        ↓
[React Quiz Feature]
        ↓ POST /api/quiz/sessions
[API Gateway — JWT 검증, RBAC]
        ↓
[Quiz Engine Service — 세션 생성, 문항 선택]
        ↓ DB 질의
[PostgreSQL — 문제 뱅크 필터링 (단원, 난이도)]
        ↓
[세션 ID + 첫 문제 반환]
        ↓
[학생: 답안 제출] → POST /api/quiz/sessions/:id/answers
        ↓
[Quiz Engine Service — 채점, 오답노트 자동 저장]
        ↓
[Analytics Service — 풀이 이벤트 기록 → BKT 상태 갱신]
        ↓
[다음 문제 or 완료 결과 반환]
```

### AI 추천 Data Flow

```
[학생: 추천 문제 요청] → GET /api/recommendations
        ↓
[Analytics Service]
        ↓ knowledge_state 테이블 조회 (p_know per concept)
[PostgreSQL — 학습 상태]
        ↓ p_know < 0.8인 개념 추출
[BKT 엔진 — 취약 개념 식별]
        ↓ 해당 개념의 미풀이 or 오답 문제 질의
[PostgreSQL — Question Bank]
        ↓
[추천 문제 목록 반환 (5~10문제)]
        ↓
[React Dashboard / Quiz Feature에 표시]
```

### DIY 문제집 생성 Flow

```
[강사/학생: 조건 설정 (과목, 단원, 난이도, 유형, 문항수)]
        ↓ POST /api/worksheets/generate
[Worksheet Service — 조건 유효성 검증]
        ↓ 조건 기반 DB 질의
[PostgreSQL — 랜덤 샘플링 + 필터 (TABLESAMPLE or ORDER BY RANDOM())]
        ↓
[문제 목록 + 메타데이터 조합]
        ↓
[JSON 반환 → 클라이언트 KaTeX 렌더링 → 화면 출력 or PDF 생성]
```

### State Management (클라이언트)

```
[Zustand / Redux Store]
        ↓ (subscribe)
[React Components] ←→ [Actions] → [API 호출] → [서버 응답]
                                                      ↓
                              [Store 업데이트] → [UI 리렌더링]

오프라인 상태:
[Service Worker] → [캐시된 문제 제공] → [답안 IndexedDB 임시 저장]
        ↓ (온라인 복귀)
[Background Sync] → [서버에 답안 전송]
```

### Key Data Flows

1. **오답노트 자동 등록:** 채점 직후 서비스 레이어에서 오답 감지 → `error_notes` 테이블 upsert (동일 문제 재오답 시 count 증가). 별도 사용자 액션 불필요.
2. **BKT 상태 갱신:** 퀴즈 세션 완료 시 Analytics Service가 비동기로 `knowledge_state` 갱신. 실시간 추천은 다음 로그인 시 반영해도 무방 (MVP 단계).
3. **KaTeX 렌더링:** 문제 텍스트에 `$...$` 또는 `$$...$$` 구문 포함. 클라이언트에서 `react-katex` 또는 `katex.renderToString()`으로 서버사이드 사전 렌더링 가능.

---

## Database Schema (핵심 엔티티)

```sql
-- 사용자 (학생/강사/관리자)
users (id, email, password_hash, role ENUM('student','teacher','admin'),
       name, created_at)

-- 문제 뱅크
questions (id, title, content_latex TEXT, answer TEXT,
           type ENUM('multiple_choice','short_answer'),
           subject VARCHAR, unit VARCHAR, concept_tag VARCHAR,
           difficulty SMALLINT(1-5), source VARCHAR,
           options JSONB,             -- 객관식 선택지
           explanation_latex TEXT,    -- 풀이 설명
           created_by UUID, created_at)

-- 퀴즈 세션
quiz_sessions (id, user_id, status ENUM('in_progress','completed'),
               config JSONB,          -- 출제 조건
               started_at, ended_at)

-- 문항별 답안
quiz_answers (id, session_id, question_id, user_answer TEXT,
              is_correct BOOLEAN, time_spent_sec INT, answered_at)

-- 오답노트
error_notes (id, user_id, question_id, incorrect_count INT,
             last_incorrect_at, memo TEXT,
             UNIQUE(user_id, question_id))

-- 지식 상태 (BKT/DKT)
knowledge_states (id, user_id, concept_tag VARCHAR,
                  p_know FLOAT DEFAULT 0.2,  -- 습득 확률
                  attempt_count INT,
                  updated_at,
                  UNIQUE(user_id, concept_tag))

-- DIY 문제집 저장
worksheets (id, creator_id, title, config JSONB,
            question_ids UUID[], created_at)

-- 강사-학생 관계
teacher_students (teacher_id UUID, student_id UUID, group_name VARCHAR,
                  PRIMARY KEY (teacher_id, student_id))
```

---

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0–1,000 사용자 | 단일 Node.js 프로세스 + PostgreSQL 단일 인스턴스. Redis 선택적. BKT를 Node.js 인라인 함수로 구현. |
| 1,000–50,000 사용자 | Redis 캐싱 추가 (추천 결과, JWT 블랙리스트). PostgreSQL 인덱스 최적화 (subject, concept_tag, user_id). PM2 클러스터 모드. |
| 50,000+ 사용자 | DKT를 Python 마이크로서비스로 분리. PostgreSQL 읽기 복제본 추가. CDN으로 정적 자산 분리. 문제 뱅크 쿼리에 Materialized View 도입. |

### Scaling Priorities

1. **첫 번째 병목: PostgreSQL 쿼리 성능** — `concept_tag`, `user_id + concept_tag` (복합 인덱스), `question.subject + difficulty` 인덱스를 MVP에서 미리 생성. `knowledge_states` 테이블은 사용자 수 × 개념 수로 빠르게 증가.
2. **두 번째 병목: BKT/DKT 연산** — 동기 처리 시 API 응답 지연. 세션 완료 후 백그라운드 큐(BullMQ + Redis)로 비동기 처리 권장.

---

## Anti-Patterns

### Anti-Pattern 1: 클라이언트에서 채점 처리

**What people do:** 정답을 API 응답에 포함시켜 클라이언트에서 비교 채점.

**Why it's wrong:** 정답 노출. 개발자 도구로 모든 정답 확인 가능. 시험 무결성 붕괴.

**Do this instead:** 채점은 반드시 서버 Quiz Engine Service에서 수행. 클라이언트는 `is_correct: boolean`만 수신.

### Anti-Pattern 2: 단일 `users` 테이블에 역할별 데이터 혼재

**What people do:** `users` 테이블에 `teacher_class`, `student_grade` 등 역할 특화 컬럼을 추가.

**Why it's wrong:** 역할 추가 시마다 스키마 변경 필요. NULL 컬럼 범람. 강사/학생 분리 쿼리 복잡.

**Do this instead:** `users` 테이블은 공통 필드만. `teacher_students` 관계 테이블로 역할 관계 표현.

### Anti-Pattern 3: 매 요청마다 BKT 재계산

**What people do:** 추천 API 호출 시마다 전체 풀이 이력으로 BKT 상태를 재계산.

**Why it's wrong:** 풀이 이력이 수천 건이면 응답 지연 심각. O(n) 연산이 매 요청마다 발생.

**Do this instead:** `knowledge_states` 테이블에 누적 상태 저장. 문제 풀이 완료 시에만 점진적 업데이트(BKT는 이전 `p_know` + 새 답안 1건으로 업데이트 가능).

### Anti-Pattern 4: LaTeX를 DB에 HTML로 변환 저장

**What people do:** 문제 등록 시 LaTeX → HTML로 변환 후 저장. 클라이언트는 HTML 직접 렌더링.

**Why it's wrong:** KaTeX 버전 변경 시 모든 문제 재변환 필요. 원본 LaTeX 손실. 편집 불가.

**Do this instead:** DB에는 원본 LaTeX 저장 (`content_latex`). 렌더링은 클라이언트 KaTeX가 담당. 서버사이드 렌더링이 필요하면 `katex.renderToString()`으로 요청 시 렌더링.

---

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| KaTeX | 클라이언트 번들 내장 (npm install katex) | 서버사이드 렌더링도 지원. react-katex 래퍼 컴포넌트 사용. |
| Workbox (Service Worker) | Vite PWA Plugin (`vite-plugin-pwa`) | cache-first for 정적 자산, network-first for API. 오프라인 답안은 IndexedDB + Background Sync. |
| PDF 생성 | 서버사이드 puppeteer or 클라이언트 window.print() | 문제집 PDF: 서버에서 HTML 렌더링 후 Puppeteer로 PDF 변환 권장. 클라이언트 print는 수식 렌더링 깨질 수 있음. |
| Redis | ioredis (Node.js) | JWT 블랙리스트, 추천 결과 캐시(TTL: 1시간), BullMQ 작업 큐. |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Client ↔ API Gateway | REST + JSON over HTTPS | 모든 API에 Authorization: Bearer {JWT} 헤더 필수. |
| Quiz Engine ↔ Analytics | 동일 프로세스 내 서비스 호출 (MVP) → 이후 이벤트 기반으로 분리 가능 | 세션 완료 이벤트 → BKT 업데이트. MVP에서는 함수 호출로 단순화. |
| Node.js ↔ Python ML | HTTP REST (FastAPI) | DKT 도입 시. Node.js가 `/kt/update`, `/kt/recommend` 호출. Python이 모델 추론 후 JSON 반환. |
| API Gateway ↔ PostgreSQL | Prisma ORM or Sequelize | Connection pooling (max 10–20) 설정 필수. |

---

## Build Order (의존성 기반 구현 순서)

이 순서는 Phase 구조에 직접 반영되어야 합니다:

```
1. 데이터베이스 스키마 + Auth (기반 인프라)
   users, JWT, RBAC — 모든 기능의 전제조건

2. 문제 뱅크 CRUD (핵심 데이터)
   questions 테이블, 태깅 시스템, KaTeX 렌더링
   → 없으면 퀴즈·추천·오답노트 모두 불가

3. 퀴즈 엔진 (핵심 UX)
   세션 관리, 채점, 오답 자동 기록
   → 풀이 이력이 쌓여야 Analytics 가능

4. 오답노트 + 기본 대시보드 (MVP 완성)
   error_notes CRUD, 간단한 풀이 통계

5. PWA 지원 (오프라인)
   Service Worker, 캐싱 전략, manifest.json

6. Analytics + BKT 추천 (AI 기능)
   knowledge_states, BKT 구현, 추천 API
   → 풀이 이력(Phase 3) 이후 구현 가능

7. DIY 문제집 생성기
   조건 기반 질의 + PDF 출력

8. 강사 관리 페이지 (어드민)
   teacher_students, 반 성과 모니터링, 보고서
```

---

## Sources

- [QuizQuest: Gamified Learning Platform Architecture Deep Dive (Medium, 2025)](https://medium.com/@iamvarunkumar23/quizquest-a-gamified-learning-platform-architectural-deep-dive-and-research-008ea1ef4362)
- [Deep Knowledge Tracing and Cognitive Load Estimation — Scientific Reports (2025)](https://www.nature.com/articles/s41598-025-10497-x)
- [Practical Evaluation of DKT Models for Learning Platforms — EDM 2025](https://educationaldatamining.org/EDM2025/proceedings/2025.EDM.industry-papers.46/index.html)
- [Tracing Minds: Knowledge Tracing Models in Educational Platform (Medium, 2025)](https://medium.com/@alriffaud/tracing-minds-a-comprehensive-journey-through-knowledge-tracing-models-in-an-educational-platform-d734cd8577af)
- [Best Practices for Scalable, Secure React + Node.js Apps (FullStack, 2025)](https://www.fullstack.com/labs/resources/blog/best-practices-for-scalable-secure-react-node-js-apps-in-2025)
- [Implementing RBAC in Node.js and React (Medium)](https://medium.com/@ignatovich.dm/implementing-role-based-access-control-rbac-in-node-js-and-react-c3d89af6f945)
- [KaTeX — Official Documentation](https://katex.org/)
- [Progressive Web Apps — MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [PWA Caching Strategies — web.dev](https://web.dev/learn/pwa/)
- [Microservices Architecture for AI Applications (Medium, 2025)](https://medium.com/@meeran03/microservices-architecture-for-ai-applications-scalable-patterns-and-2025-trends-5ac273eac232)
- [AI-Driven Adaptive Learning System Design — ACM 2025](https://dl.acm.org/doi/10.1145/3732801.3732811)

---
*Architecture research for: 수학 기출문제 학습 웹앱 (Math Exam Learning PWA)*
*Researched: 2026-02-19*
