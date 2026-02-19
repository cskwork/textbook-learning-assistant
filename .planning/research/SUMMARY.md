# Project Research Summary

**Project:** 수학 기출문제 학습 웹앱 (Math Exam Learning Assistant)
**Domain:** 교육 기술 (EdTech) — 고등학교 수학 기출문제 적응형 학습 PWA
**Researched:** 2026-02-19
**Confidence:** MEDIUM (스택 HIGH, 피처 MEDIUM, 아키텍처 HIGH, 함정 MEDIUM)

## Executive Summary

이 제품은 고등학교 수학 기출문제(수능/모의고사)를 기반으로 한 적응형 학습 PWA다. 경쟁사(기출탭탭, 수학대왕, 콴다, 오르조)는 모두 네이티브 앱으로 운영되며, 이 제품은 PWA 방식으로 앱스토어 없이 설치형 경험을 제공하는 유일한 포지셔닝이다. 핵심 차별점은 두 가지다: 교육 AI 표준 모델인 BKT 기반 취약유형 분석(경쟁사는 휴리스틱 기반)과 강사용 관리 포털(매쓰플랫이 B2B 시장을 검증했으나 학생용과 통합된 앱은 없음).

권장 구현 전략은 React 19 + Vite 7 + Tailwind v4 + shadcn/ui 조합의 PWA 프론트엔드와 Node.js(Express 5) + PostgreSQL 백엔드를 1단계로 확립하고, BKT를 Node.js 내 인라인 구현으로 v1에서 제공하되 v2에서 Python FastAPI 마이크로서비스로 고도화하는 점진적 접근이다. KaTeX는 MathJax 대비 10배 빠른 렌더링으로 모바일 PWA에서 수식 성능을 보장하는 필수 선택이다.

가장 중요한 리스크는 세 가지다. 첫째, 문제 태깅 스키마는 첫 문제 입력 전에 확장 가능한 형태로 확정해야 한다(나중에 재설계하면 전체 데이터 재작업). 둘째, 수능 기출문제는 텍스트+LaTeX로 직접 재입력해야 하며 PDF 스캔본 직접 사용은 저작권 위험이 있다. 셋째, BKT 콜드스타트 문제를 위해 온보딩 진단 퀴즈(5~10문제)를 MVP부터 함께 설계해야 한다.

## Key Findings

### 추천 스택

React 19 + Vite 7 + TypeScript 기반 프론트엔드와 Node.js 22 LTS + Express 5 + PostgreSQL 16 백엔드의 표준 웹 스택이 권장된다. 상태관리는 Zustand(클라이언트 UI 상태) + TanStack Query(서버 상태)의 조합으로 Redux 없이 충분히 처리 가능하다. Drizzle ORM은 Prisma 7 대비 번들 크기가 90% 작고 TypeScript 타입 추론이 즉각적으로 교육 앱 수준의 쿼리 복잡도에 적합하다.

**핵심 기술:**
- React 19 + Vite 7 + vite-plugin-pwa: PWA 개발 표준, HMR 속도 최고, Workbox 자동 통합
- KaTeX 0.16: MathJax 대비 10배 빠른 수식 렌더링, 모바일 PWA 필수
- shadcn/ui + Tailwind v4: Tailwind v4 네이티브, React 19 완전 호환(2025-02 업데이트)
- PostgreSQL + Drizzle ORM: 관계형 데이터(문제-단원-유형-학생-성적)에 최적, 번들 경량
- TanStack Query 5 + Zustand 5: 서버/클라이언트 상태 분리, 보일러플레이트 최소
- jose 6 + bcryptjs: ESM 완전 지원 JWT, Node.js 22 최적
- BKT (v1 Node.js 인라인, v2 Python FastAPI): 교육 AI 표준 모델, 단계적 고도화

**v1에서 제외할 기술:**
- Python FastAPI 마이크로서비스(v1은 Node.js 인라인 BKT로 대체)
- Redis(선택적, 초기 1,000명 이하 사용자 규모에서 불필요)
- MathJax, Moment.js, Prisma 7, Redux — 구체적인 이유로 각각 대체재 확정

### 기대 기능

표 1의 필수 기능들은 모두 v1에 포함되어야 한다. 경쟁사 분석에서 유일하게 PWA 기반 앱인 것이 명확한 차별점으로, 앱스토어 없이 설치형 경험을 제공하는 것이 중요하다.

**반드시 포함해야 하는 기능 (Table Stakes):**
- 문제 풀이 엔진 (객관식+단답형+KaTeX 수식 렌더링) — 수학 앱의 존재 이유
- 자동 채점 — 종이 문제집 대비 기본 가치
- 단원/유형/난이도 필터 — 목표 학습의 기반
- 오답노트 자동 수집 — 구현 비용 낮고 재방문 유인 높음
- 문제별 해설 — 채점 후 학습 완결
- 회원 인증 (이메일) — 이력 동기화 전제 조건
- 반응형 디자인 (태블릿/모바일/PC)

**경쟁 우위가 되는 기능 (Differentiators):**
- AI 취약유형 분석 (BKT) + 취약유형 리포트 대시보드 — v1 핵심 차별점
- DIY 문제집 구성 — 기출탭탭에서 핵심 UX로 검증됨
- 강사용 기본 관리 포털 — B2B 진입점 (학생 그룹 + 과제 출제)
- PWA 설치 + 오프라인 기본 지원

**v2+로 연기:**
- N회독 반복 학습 스케줄링 (오답 데이터 쌓인 후 의미 있음)
- DKT 모델 전환 (1,000+ 학생 데이터 필요)
- 문제 필기 노트 Canvas 기반 (PWA에서 PencilKit 미지원, 복잡도 높음)
- 결제/프리미엄 구독 (v1 완전 무료로 사용자 확보 후)
- 학습 플래너/자동 스케줄링

**의도적으로 제외할 기능 (Anti-Features):**
- 실시간 1:1 질문 답변 채팅 (튜터 공급망 필요, 제품 성격 변질)
- 게이미피케이션 과잉 (뽑기/리그) — 학습 동기 외재적 보상으로 대체
- 서술형 문제 AI 채점 (GPT 채점 정확도 불안정, 교육 오채점 리스크)
- 소셜 피드/커뮤니티 (콜드스타트 비용 막대)

### 아키텍처 접근

React PWA 클라이언트 + Express.js API Gateway + PostgreSQL 데이터 레이어의 표준 3계층 구조를 권장한다. 서버는 Feature-Sliced 모듈 구조(router → controller → service → db 4계층)로 도메인별 독립성을 유지한다. 클라이언트는 features/ 디렉토리 기반 도메인 분리로 학생 앱 / 강사 관리 / 오답노트 / 문제집 생성기를 명확히 구분한다.

**주요 컴포넌트:**
1. **Student App (React SPA)** — 문제 풀이 UI, 오답노트, 대시보드, 추천 수령
2. **Teacher Admin (RBAC 보호 라우트)** — 문제 등록, 학생 관리, 반 성과 모니터링
3. **Quiz Engine Service** — 퀴즈 세션 상태머신 (idle→started→submitted→graded), 자동 채점, 오답 자동 등록
4. **Analytics / BKT Service** — 풀이 이력 집계, knowledge_states 테이블 점진적 업데이트, 추천 산출
5. **DIY Worksheet Generator** — 조건 기반 문제 필터링, PDF 출력
6. **Service Worker (Workbox)** — 정적 자산 사전 캐싱, 오프라인 문제 풀기, Background Sync

**핵심 패턴:**
- 채점은 반드시 서버에서 처리 (클라이언트 채점 절대 금지 — 정답 노출)
- BKT 상태는 매 요청마다 재계산하지 않고 knowledge_states 테이블에 누적 저장 후 증분 업데이트
- LaTeX는 DB에 원본 저장, 렌더링은 클라이언트 KaTeX가 담당 (HTML 변환 저장 금지)
- users 테이블은 공통 필드만, 역할 특화 데이터는 teacher_students 관계 테이블로 분리

### 중요 함정

1. **KaTeX SSR 하이드레이션 불일치** — 이 프로젝트는 Vite SPA이므로 Next.js SSR 문제는 적용되지 않음. 그러나 KaTeX는 클라이언트 전용으로 렌더링하고, 수식 컨테이너에 최소 높이를 CSS로 미리 지정해 CLS를 방지해야 함. Phase 1에서 POC 필수.

2. **문제 태깅 스키마 설계 실패** — 첫 문제 입력 전 확장 가능한 스키마 확정 필수. 권장 구조: `{subject, grade, unit, topic, concept[], difficulty, question_type, estimated_time, solution_method[], source_exam, year}`. 나중에 재설계하면 전체 문제+학습기록 재작업 필요.

3. **수능 기출문제 저작권 미처리** — 수학 기출문제는 텍스트+LaTeX로 직접 재입력해야 함. PDF 스캔본 직접 사용 금지. 도형/그래프는 SVG로 재제작. 유료화 전 KICE 사전 허가 문의 필요.

4. **BKT 콜드스타트** — 신규 학생에게 의미 있는 BKT 추천은 최소 30개 이상 응답 필요. 온보딩 진단 퀴즈(5~10문제)를 MVP부터 함께 구현하고, 초기에는 정답률 기반 휴리스틱 추천을 fallback으로 제공.

5. **PWA 오프라인 동기화 충돌** — 오프라인 응답에 `device_id + timestamp + sequence_number` 기록 필수. 이벤트 소싱 방식으로 모든 응답 이벤트 누적 저장, 서버에서 재계산. iOS Safari IndexedDB 할당량(50MB) 고려 필요.

## Implications for Roadmap

아키텍처 연구의 Build Order와 기능 의존성 그래프를 결합하면 다음 8단계 Phase 구조가 도출된다.

### Phase 1: 기반 인프라 + 데이터 모델링
**Rationale:** 모든 기능의 전제조건. users, JWT, RBAC 없이는 학생/강사 분리가 불가능하고, 태깅 스키마 없이 문제 입력이 불가능하다. 이 단계에서 설계 결정이 전체 프로젝트 비용을 결정함.
**Delivers:** 인증/인가 시스템, DB 스키마 확정(Drizzle 마이그레이션), KaTeX 렌더링 POC, 개발 환경 완성
**Addresses:** 회원 인증 기능, 반응형 기반 레이아웃
**Avoids:** 문제 태깅 스키마 실패(Pitfall 3), KaTeX CLS 문제(Pitfall 1), 강사/학생 권한 부실(Pitfall 7)
**Research Flag:** 표준 패턴. `/gsd:research-phase` 불필요. JWT+RBAC 패턴은 잘 문서화됨.

### Phase 2: 문제 뱅크 + KaTeX 렌더링 엔진
**Rationale:** 퀴즈 엔진, 추천, 오답노트 모두 문제 데이터에 의존한다. 태깅 시스템의 품질이 DIY 문제집과 BKT 추천의 정확도를 직접 결정함.
**Delivers:** 문제 CRUD API, 태깅 시스템, KaTeX 렌더링 컴포넌트, 강사용 문제 입력 UI, 단원/유형/난이도 필터
**Addresses:** 수식 렌더링, 문제별 해설, 단원/유형/난이도 필터 기능
**Avoids:** LaTeX HTML 변환 저장 안티패턴(Architecture), 모바일 수식 레이아웃 깨짐(Pitfall 6), 문제 이미지 LCP 저하(Pitfall 8)
**Research Flag:** KaTeX 모바일 최적화 패턴 확인 권장. 그래프/도형 SVG 재제작 워크플로우 설계 필요.

### Phase 3: 퀴즈 엔진 + 자동 채점 + 오답노트
**Rationale:** 핵심 UX. 풀이 이력이 쌓여야 Analytics(Phase 5)가 가능하다. 자동 채점과 오답노트는 구현 비용이 낮으면서 사용자 가치가 높음.
**Delivers:** 퀴즈 세션 상태머신, 자동 채점(서버사이드), 오답 자동 등록, 문제 타이머, 북마크
**Addresses:** 문제 풀이 엔진, 자동 채점, 오답노트, 학습 이력 저장
**Avoids:** 클라이언트 채점 안티패턴(Architecture Pitfall 1), 점수 조작 보안 이슈(Security)
**Research Flag:** 표준 패턴. 퀴즈 세션 상태머신은 잘 정의된 패턴.

### Phase 4: DIY 문제집 생성기
**Rationale:** 기출탭탭에서 검증된 핵심 차별점 UX. 퀴즈 엔진(Phase 3)과 문제 뱅크(Phase 2)가 완성된 후에만 구현 가능.
**Delivers:** 조건 기반 문제 필터링 API, 문제집 생성 UI, PDF 출력(Puppeteer), 저장 및 공유
**Addresses:** DIY 문제집 기능
**Avoids:** TABLESAMPLE 기반 랜덤 샘플링 성능(대용량 질의 시 플래너 참고)
**Research Flag:** Puppeteer PDF 생성 + KaTeX 렌더링 조합 검증 필요. `/gsd:research-phase` 권장.

### Phase 5: Analytics + BKT 취약유형 분석
**Rationale:** 풀이 이력(Phase 3)이 충분히 쌓인 후 구현 가능. BKT는 Node.js 인라인으로 v1에서 제공하고 Python 마이크로서비스는 v2로 연기. 온보딩 진단 퀴즈를 이 단계에서 함께 구현.
**Delivers:** knowledge_states 테이블 관리, BKT 증분 업데이트, 취약유형 리포트 대시보드, 문제 추천 API, 온보딩 진단 퀴즈
**Addresses:** AI 취약유형 분석, 취약유형 리포트 대시보드, AI 맞춤 문제 추천 기본
**Avoids:** BKT 콜드스타트(Pitfall 2), BKT 파라미터 비현실적 수렴(Pitfall 9), 매 요청 재계산 안티패턴(Architecture Anti-Pattern 3)
**Research Flag:** BKT 파라미터 바운딩(P(Slip)<0.3, P(Guess)<0.3) 구현 패턴 검증 필요. `/gsd:research-phase` 강력 권장.

### Phase 6: PWA 오프라인 지원
**Rationale:** 앱스토어 없는 설치형 경험이 핵심 차별점. 퀴즈 엔진과 데이터 모델이 안정된 후 Service Worker와 동기화 프로토콜을 설계해야 데이터 정합성을 보장할 수 있음.
**Delivers:** Service Worker(Workbox), manifest.json, 오프라인 문제 풀기, IndexedDB 응답 임시 저장, Background Sync, PWA 설치 배너
**Addresses:** PWA 오프라인 기본 지원
**Avoids:** 오프라인 동기화 충돌(Pitfall 5), iOS Safari IndexedDB 할당량 초과
**Research Flag:** Background Sync API 브라우저 호환성 + IndexedDB 할당량 전략 검증 필요. `/gsd:research-phase` 권장.

### Phase 7: 강사 관리 포털
**Rationale:** 강사 포털은 학생 데이터를 소비하는 역할이므로, 학생 기능(Phase 1~6)이 완성된 후에 구현해야 의미 있는 기능을 제공할 수 있음. B2B 진입점으로 사업적으로 중요하나 학생 경험이 선행되어야 함.
**Delivers:** 학생 그룹 관리, 과제 출제 및 배정, 반별 성과 모니터링, 강사용 리포트
**Addresses:** 강사용 기본 관리 기능
**Avoids:** 역할별 데이터 혼재 안티패턴(Architecture Anti-Pattern 2), 클래스 필터 없는 강사 조회(Security)
**Research Flag:** 표준 RBAC 패턴. 단, 클래스별 RLS(Row Level Security) 설계 검토 필요.

### Phase Ordering Rationale

- **의존성 순서:** 인증(P1) → 문제 데이터(P2) → 풀이(P3) → 분석(P5)의 흐름이 필수적. 각 단계가 다음 단계의 데이터 소스를 생성한다.
- **저위험 우선:** Phase 3(퀴즈 엔진)은 기술적 불확실성이 낮고 사용자 가치가 높아 초기에 배치.
- **AI 기능 후반:** BKT는 풀이 데이터 없이 의미가 없으므로 Phase 5로 배치. v1 콜드스타트 전략(온보딩 진단)도 함께 구현.
- **PWA 후반:** 핵심 기능이 안정된 후 오프라인 레이어를 추가하면 동기화 충돌 리스크를 최소화.
- **강사 포털 마지막:** 학생 데이터 없이는 빈 껍데기이므로 전체 학생 기능 완성 후 구현.

### Research Flags

**깊은 리서치가 필요한 Phase:**
- **Phase 4 (DIY 문제집):** Puppeteer + KaTeX 서버사이드 렌더링 조합, PDF 생성 성능 검증
- **Phase 5 (BKT 분석):** BKT EM 알고리즘 파라미터 바운딩 구현, 콜드스타트 전략, knowledge_states 스키마 최적화
- **Phase 6 (PWA 오프라인):** Background Sync API 브라우저 지원 현황, IndexedDB Dexie.js 마이그레이션 전략, iOS Safari 제약

**표준 패턴 (리서치 생략 가능):**
- **Phase 1 (인프라):** JWT + bcrypt + RBAC는 Express.js 생태계의 표준 패턴
- **Phase 2 (문제 뱅크):** CRUD API + Drizzle ORM은 잘 문서화됨
- **Phase 3 (퀴즈 엔진):** 상태머신 패턴과 서버사이드 채점은 표준 접근

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | npm 실시간 버전 확인, 공식 호환성 문서 교차 검증. React 19 + shadcn/ui 2025-02 업데이트 확인됨 |
| Features | MEDIUM | 5개 경쟁사 App Store + 공식 사이트 분석. 실제 사용자 인터뷰 없음. 콴다 불만 리뷰는 단일 소스(LOW) |
| Architecture | HIGH | 교육 플랫폼 아키텍처 다수 사례 참조. BKT/DKT 논문 기반. 퀴즈 엔진 패턴 검증됨 |
| Pitfalls | MEDIUM | 학술 논문(EDM 2024/2025, ACM) + 실무 블로그 교차 검증. 일부 항목은 단일 소스 |

**전체 신뢰도:** MEDIUM-HIGH

### 해결이 필요한 Gap

- **문제 데이터 확보 전략:** 수능/모의고사 기출문제를 LaTeX로 재입력하는 작업량이 방대함. 초기 문제 수와 입력 워크플로우를 요구사항 단계에서 구체화해야 함. (예: 관리자 입력 UI의 우선순위, 외부 기여자 모델 여부)
- **BKT 파라미터 초기값:** 한국 고등학생 수학 기출문제에 대한 BKT 파라미터 사전 추정값이 없음. 글로벌 연구 파라미터를 시작점으로 사용하고 실제 데이터로 조정하는 전략 필요.
- **오프라인 캐시 범위:** 어느 문제들을 오프라인으로 캐시할지(전체 vs 최근 풀이 목록 vs 강사 배정 문제집) 결정이 필요함. UX 요구사항과 iOS 50MB 제약 간 균형.
- **강사 모집 전략:** v1 강사 포털이 의미 있으려면 실제 강사 사용자가 필요함. 초기 베타 테스터 모집 계획이 개발 일정에 영향을 줄 수 있음.

## Sources

### Primary (HIGH confidence)
- npm 레지스트리 실시간 조회 (2026-02-19) — React 19.2.4, Vite 7.3.1, Express 5.2.1, KaTeX 0.16.28, Drizzle ORM 0.45.1, shadcn/ui, TanStack Query 5.90.21 버전 확인
- [Tailwind CSS v4.0 공식 릴리즈](https://tailwindcss.com/blog/tailwindcss-v4) — Vite 플러그인 지원, CSS-first 설정 확인
- [shadcn/ui Tailwind v4 Changelog](https://ui.shadcn.com/docs/changelog/2025-02-tailwind-v4) — React 19 + Tailwind v4 호환성 확인
- [KaTeX 공식 문서](https://katex.org/) — 렌더링 속도 비교, 버전 확인
- [PWA Caching Strategies — web.dev](https://web.dev/learn/pwa/) — Service Worker 전략

### Secondary (MEDIUM confidence)
- [Deep Knowledge Tracing — Scientific Reports 2025](https://www.nature.com/articles/s41598-025-10497-x) — DKT 모델 실무 적용 패턴
- [AI-Driven Adaptive Learning System Design — ACM 2025](https://dl.acm.org/doi/10.1145/3732801.3732811) — 교육 플랫폼 아키텍처
- [BKT Parametric Constraints — EDM 2024](https://educationaldatamining.org/edm2024/proceedings/2024.EDM-long-papers.2/index.html) — P(Slip), P(Guess) 바운딩
- [Cold Start in Knowledge Tracing — arXiv 2025](https://arxiv.org/abs/2505.21517) — 콜드스타트 전략
- [Drizzle vs Prisma 2025](https://thedataguy.pro/blog/2025/12/nodejs-orm-comparison-2025/) — ORM 비교
- 기출탭탭, 수학대왕, 콴다, 오르조, 매쓰플랫 App Store + 공식 사이트 분석

### Tertiary (LOW confidence)
- 콴다 App Store/Google Play 사용자 불만 리뷰 — 광고 UX 문제 (단일 소스, 검증 필요)
- [수능 저작권 판결 경향신문 2024](https://www.khan.co.kr/article/202408041306001) — 저작권 리스크 참고 (언론 보도, 법적 검토 별도 필요)

---
*Research completed: 2026-02-19*
*Ready for roadmap: yes*
