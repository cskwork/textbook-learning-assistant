# Pitfalls Research

**Domain:** 수학 기출문제 학습 웹앱 (Math Exam Learning PWA for Korean High School Students)
**Researched:** 2026-02-19
**Confidence:** MEDIUM (WebSearch + official docs 교차 검증. 일부 항목은 학술 논문 기반)

---

## Critical Pitfalls

### Pitfall 1: KaTeX/MathJax SSR 하이드레이션 불일치

**What goes wrong:**
서버에서 렌더링된 수식 HTML과 클라이언트에서 KaTeX가 다시 렌더링한 HTML이 불일치하여 React hydration 에러가 발생한다. KaTeX는 SSR 시 MathML 지원 여부를 서버와 클라이언트에서 다르게 판단하기 때문에, Next.js/SSR 환경에서 수식이 깜빡이거나 레이아웃이 무너진다.

**Why it happens:**
KaTeX의 `renderToString`은 환경 감지 로직이 브라우저 환경에서만 동작하는 API(`navigator`, `document`)에 의존한다. Next.js에서 서버 렌더링 후 클라이언트 하이드레이션 시 두 번째 패스에서 다른 결과를 생성한다.

**How to avoid:**
- KaTeX는 클라이언트 전용(`'use client'`)으로만 렌더링하거나, `suppressHydrationWarning`을 수식 컨테이너에 명시적으로 적용한다.
- 수식이 많은 페이지는 `dynamic(() => import('...'), { ssr: false })`로 lazy load한다.
- `react-katex`보다 직접 `useEffect` 내에서 `renderToString` 호출을 권장한다.
- CLS(Cumulative Layout Shift) 방지를 위해 수식 컨테이너에 최소 높이를 CSS로 미리 지정한다.

**Warning signs:**
- 개발 환경에서 "Prop `dangerouslySetInnerHTML` did not match" 콘솔 경고
- 수식 영역만 레이아웃이 점프하는 현상
- Lighthouse CLS 점수 0.1 초과

**Phase to address:** Phase 1 (기술 스택 선정 및 초기 설정) - 수식 렌더링 파이프라인 POC 필수

---

### Pitfall 2: BKT/DKT Cold Start — 신규 사용자에게 잘못된 추천

**What goes wrong:**
신규 학생의 상호작용 데이터가 없는 상태에서 BKT/DKT 모델이 극단적으로 낮거나 높은 숙련도를 추정하여, 너무 쉽거나 너무 어려운 문제만 추천한다. 초기 사용 경험이 나빠져 이탈율이 높아진다.

**Why it happens:**
BKT는 사전 확률(`P(L0)`)을 전체 모집단 평균으로 초기화하는데, 이는 개별 학생 수준을 전혀 반영하지 못한다. DKT/SAKT 등 딥러닝 계열은 짧은 시퀀스(<5개 응답)에서 attention weight가 편향되어 예측이 불안정하다.

**How to avoid:**
- 온보딩 진단 퀴즈(5~10문제)로 초기 숙련도를 추정하는 cold start 전략을 설계한다.
- 초기에는 BKT보다 item difficulty + 정답률 기반의 단순 규칙 기반 추천을 사용하고, 충분한 데이터(학생당 30+ 응답)가 쌓이면 BKT/DKT로 전환한다.
- BKT `P(Slip)`, `P(Guess)` 파라미터를 0.3 이하로 바운딩하지 않으면 EM이 비현실적인 값으로 수렴한다 — 반드시 제약 설정.
- 진단 결과를 학년/과목 수준으로만 세분화하고, 단원별 세분화는 데이터 축적 후 도입한다.

**Warning signs:**
- 신규 사용자가 첫 세션에서 연속 5회 이상 오답 또는 정답
- 학생별 `P(L0)` 추정치가 0 또는 1에 수렴
- 초기 이탈률(Day 1 → Day 3 retention)이 기준 대비 30% 이상 낮음

**Phase to address:** Phase 2 (적응형 학습 엔진) - 온보딩 진단 플로우를 MVP에서 함께 구현

---

### Pitfall 3: 문제 태깅 스키마 설계 실패 — 나중에 전체 재태깅 필요

**What goes wrong:**
초기에 단원/난이도 2계층 태그만 정의한 뒤 문제 수천 개를 입력했는데, 이후 "개념별 태그", "풀이 유형", "예상 소요 시간" 등을 추가하려면 기존 전체 문제를 재검토해야 한다. 이 시점에서는 이미 사용자 학습 기록과 태그가 연결되어 있어 마이그레이션 비용이 매우 크다.

**Why it happens:**
MVP 압박으로 최소 태깅 구조부터 시작하지만, 적응형 추천은 세밀한 개념 태그에 의존한다. 태그 스키마는 데이터가 쌓일수록 변경 비용이 기하급수적으로 증가한다.

**How to avoid:**
- 1단계부터 확장 가능한 태그 스키마 설계: `{subject, grade, unit, topic, concept[], difficulty, question_type, estimated_time, solution_method[], source_exam, year}`
- 수능/모의고사 기준 공식 교육과정 분류 체계(교육부 성취기준)를 태그 계층의 기준으로 사용한다.
- 태그는 JSON 배열로 저장하되, 핵심 태그(unit, difficulty)는 별도 컬럼으로 인덱싱한다.
- 첫 100문제를 입력하기 전에 태그 스키마를 검토하고 팀 내 합의 문서를 작성한다.

**Warning signs:**
- 태그 선택 시 "기타" 카테고리 사용 빈도 증가
- "이 문제는 어디에 분류해야 하지?"라는 질문이 반복됨
- 같은 개념 문제가 서로 다른 단원으로 분류됨

**Phase to address:** Phase 1 (데이터 모델링) - 첫 번째 문제 입력 전에 스키마 확정

---

### Pitfall 4: 수능/모의고사 기출문제 저작권 미처리

**What goes wrong:**
수능 기출문제를 그대로 텍스트/이미지로 서비스에 올렸다가 저작권 침해 이슈에 휘말린다. 평가원(KICE)이 수능 문제를 CC BY-NC-ND 4.0으로 공개하지만, 문제에 포함된 문학 작품·예술 작품은 별도 저작권이 있다. 법원 판례(2024)에서도 평가원 자신이 저작권 침해로 판결받은 사례가 있다.

**Why it happens:**
수능 문제 자체는 공공재로 인식하지만, 문제에 삽입된 지문(소설 발췌, 시, 그림 등)은 원저작자 권리가 살아있다. 수학 문제의 경우 지문 삽입은 드물지만, 문제 이미지(스캔본) 그대로 사용하면 KICE 저작권 귀속 문제가 생긴다.

**How to avoid:**
- 수학 기출문제는 텍스트+LaTeX로 재입력(직접 타이핑)하여 표현 형식을 새로 생성한다.
- 법률 검토: CC BY-NC-ND 4.0 조건 하에 비상업적/수정 없음 조건 준수 여부 확인.
- 서비스가 유료(상업적)가 될 경우 KICE에 사전 허가 문의를 진행한다.
- 이미지 스캔본은 사용하지 않고, 도형/그래프는 직접 SVG로 재제작한다.

**Warning signs:**
- 문제 데이터를 PDF 스캔에서 직접 추출하는 파이프라인 존재
- "어차피 공개된 거잖아요"라는 팀 내 인식
- 유료 서비스 전환 계획이 있으나 저작권 검토가 없음

**Phase to address:** Phase 0 (사전 기획) - 법적 검토를 개발 시작 전에 완료

---

### Pitfall 5: PWA 오프라인 동기화 충돌 처리 미설계

**What goes wrong:**
오프라인에서 문제를 풀고 나중에 네트워크가 연결되면 학습 기록을 서버에 올리는데, 같은 학생이 다른 기기에서도 문제를 풀었을 경우 어느 기록이 정답인지 알 수 없는 상태가 된다. BKT 모델에 순서가 다른 응답 시퀀스가 입력되면 숙련도 추정이 오염된다.

**Why it happens:**
Background Sync API가 모든 브라우저에서 지원되지 않으며, 충돌 해결 전략을 처음부터 설계하지 않으면 나중에 data integrity 문제가 발생한다. 교육 앱의 특성상 응답 순서가 모델 입력에 직접 영향을 준다.

**How to avoid:**
- 각 학습 응답 이벤트에 `device_id` + `timestamp` + `sequence_number`를 기록한다.
- 충돌 해결 전략: 타임스탬프 기준 병합(LWW - Last Write Wins)보다 이벤트 소싱 방식으로 모든 응답 이벤트를 누적 저장하고 서버에서 재계산한다.
- IndexedDB 저장 시 트랜잭션 단위를 "응답 하나"로 원자적으로 관리한다.
- 오프라인 가능 범위를 명확히 제한: 문제 풀기는 오프라인 가능, 성적 분석/추천은 온라인 필요.
- iOS Safari의 IndexedDB 할당량(50MB)을 고려하여 캐싱 전략을 수립한다.

**Warning signs:**
- 동기화 로직이 "나중에 추가"로 미뤄지고 있음
- 서버 학습 기록과 로컬 기록의 비교 로직이 없음
- 테스트에서 오프라인 → 온라인 전환 시나리오가 없음

**Phase to address:** Phase 3 (PWA 오프라인 지원) - 동기화 프로토콜 설계를 구현 전에 문서화

---

## Moderate Pitfalls

### Pitfall 6: 모바일에서 수식 가로 스크롤 깨짐

**What goes wrong:**
`\frac{\partial^2 f}{\partial x^2}` 같은 긴 수식이 모바일 뷰포트(360px)에서 부모 컨테이너를 벗어나 레이아웃이 깨진다. MathJax는 긴 수식을 단일 비분리 블록으로 렌더링하기 때문이다.

**Prevention:**
- 수식 래퍼에 `overflow-x: auto; max-width: 100%` 적용.
- 블록 수식(`$$...$$`)은 전용 스크롤 컨테이너 안에 배치한다.
- 기기 폭이 400px 이하인 경우 display math 폰트 사이즈를 자동으로 축소(`font-size: clamp(0.8em, 2vw, 1em)`).
- 실제 안드로이드 기기(Chrome) + iOS Safari에서 수식 렌더링 테스트를 별도로 수행한다.

---

### Pitfall 7: 강사/학생 권한 설계 부실 — 데이터 노출 사고

**What goes wrong:**
강사가 모든 학생 데이터를 볼 수 있도록 단순히 `role === 'teacher'` 체크만 구현했는데, 강사가 자기 수업 외 다른 반 학생 데이터까지 접근하거나, 학생이 URL 조작으로 다른 학생 답안을 볼 수 있는 취약점이 생긴다.

**Prevention:**
- 행 수준 보안(Row Level Security, RLS)을 DB 레이어(Supabase/PostgreSQL)에서 강제한다.
- API 레이어에서 "강사는 자신이 관리하는 클래스 학생만 조회 가능" 조건을 모든 쿼리에 적용한다.
- 미들웨어 레벨 role 체크 외에 DB 레이어에서도 중복 검증(Defense in Depth).
- 학생 ID가 URL 파라미터로 노출되지 않도록 내부 UUID를 사용한다.

---

### Pitfall 8: 문제 이미지/수식 로딩으로 인한 LCP 저하

**What goes wrong:**
문제 목록 페이지에서 수십 개의 문제를 한 번에 렌더링하면서 KaTeX 렌더링 + 이미지 로딩이 동시에 일어나 Largest Contentful Paint(LCP)가 5초를 초과한다. 모바일 3G 환경에서는 더 심각하다.

**Prevention:**
- 문제 목록은 가상화(react-window, TanStack Virtual)로 화면에 보이는 문제만 렌더링한다.
- KaTeX는 Intersection Observer로 뷰포트 진입 시에만 렌더링(lazy math rendering).
- 그래프/도형 이미지는 WebP + `loading="lazy"` 적용.
- 첫 로드에는 문제 10개 이하만 표시하고 무한 스크롤 또는 페이지네이션 사용.

---

### Pitfall 9: BKT 파라미터 자유 추정으로 인한 비현실적 숙련도

**What goes wrong:**
BKT EM 알고리즘이 `P(Slip) = 0.8` 같은 비현실적인 파라미터로 수렴하면, "항상 틀리는 학생도 숙련됨"이라는 역설적 추정이 나온다. 이 상태에서 쉬운 문제만 계속 추천된다.

**Prevention:**
- `P(Slip) < 0.3`, `P(Guess) < 0.3` 제약 조건을 EM 루프에 명시적으로 적용(pyBKT의 `coef_` 바운딩 활용).
- 단원별로 파라미터를 독립적으로 추정(multigs)하되, 데이터가 50개 미만인 단원은 전역 파라미터를 사용한다.
- 파라미터 추정 결과를 모니터링 대시보드에 표시하고 이상 감지 알림을 설정한다.

---

### Pitfall 10: 스페이스드 리피티션 없이 단순 "못 푼 문제 반복" 구현

**What goes wrong:**
틀린 문제를 단순히 다시 보여주는 방식은 간격 효과(Spacing Effect)를 활용하지 못한다. 학생이 방금 틀린 문제를 바로 다시 풀면 단기 기억으로 정답을 맞추지만 장기 기억으로 이어지지 않는다. 앱이 학습 효과가 없는 것처럼 느껴진다.

**Prevention:**
- SM-2 또는 FSRS 알고리즘 기반 복습 스케줄링을 Day 1부터 도입한다.
- BKT 숙련도와 스페이스드 리피티션 간격을 연동한다: 숙련도가 낮을수록 복습 간격을 짧게.
- "오늘의 복습 문제" 섹션을 학습 대시보드의 핵심 기능으로 배치한다.

---

## Technical Debt Patterns

| 단축키 | 즉각적 이점 | 장기 비용 | 수용 가능 여부 |
|--------|-------------|-----------|----------------|
| 문제 입력을 Markdown 텍스트만 지원 (LaTeX 미지원) | 개발 빠름 | 수식 문제 입력 불가, 전체 리빌드 필요 | Never — 수학 앱의 핵심 |
| BKT 없이 정답률 기반 난이도 추천만 구현 | 구현 단순 | 개인화 불가, 나중에 BKT 도입 시 스키마 변경 | MVP에서 한시적 허용, Phase 2에서 전환 |
| 단일 `role` 컬럼으로 권한 관리 | 개발 빠름 | 클래스별 권한 분리 불가, RLS 재설계 필요 | Phase 1에서 클래스 연결 구조와 함께 설계해야 함 |
| 이미지 스캔으로 문제 저장 | 입력 빠름 | 검색/태깅 불가, 저작권 위험, OCR 오류 | Never — 텍스트+LaTeX 재입력 필수 |
| 오프라인 미지원으로 시작 | 개발 단순 | PWA 핵심 가치 훼손 | MVP에서 허용, Phase 3에서 반드시 구현 |

---

## Integration Gotchas

| 통합 대상 | 흔한 실수 | 올바른 접근 |
|-----------|-----------|------------|
| KaTeX + React | `dangerouslySetInnerHTML` 직접 사용으로 XSS 위험 | `katex.renderToString()`에 `throwOnError: false` + DOMPurify 적용 |
| KaTeX + SSR (Next.js) | SSR에서 렌더링 후 클라이언트 하이드레이션 불일치 | `dynamic({ ssr: false })` 또는 클라이언트 전용 래퍼 |
| Supabase RLS | 개발 중 RLS 비활성화 후 배포 전 활성화 잊음 | CI에서 RLS 활성화 여부 자동 검증 스크립트 추가 |
| IndexedDB (Dexie.js) | 스키마 버전 관리 없이 필드 추가 → 기존 사용자 DB 오류 | Dexie migration 버전 관리를 처음부터 적용 |
| pyBKT / 커스텀 BKT | Python 모델을 Node.js API와 연동할 때 `float32` 정밀도 차이 | 파라미터를 DB에 저장할 때 `DOUBLE PRECISION` 사용 |
| Desmos/GeoGebra iframe | iframe이 PWA 오프라인 캐시에서 제외됨 | 그래프 도구 URL을 서비스워커 캐시 목록에 명시적으로 포함 |

---

## Performance Traps

| 트랩 | 증상 | 예방 | 임계점 |
|------|------|------|--------|
| 문제 목록 전체 KaTeX 렌더링 | 페이지 로드 시 5초 이상 멈춤 | Intersection Observer + 가상 스크롤 | 문제 20개 이상 |
| BKT 매 응답마다 전체 히스토리 재계산 | 응답 저장 API가 2초 이상 걸림 | 증분 업데이트(이전 상태 + 새 응답만 계산) | 응답 100개 이상 |
| 문제 이미지 비최적화 (PNG/JPEG 원본) | 모바일 3G에서 첫 화면 10초 이상 | WebP 변환 + CDN + `loading="lazy"` | 이미지 10개 이상 |
| IndexedDB 전체 응답 이력 매번 읽기 | 오프라인 모드에서 앱이 느려짐 | 최근 100개 응답만 로컬 캐시, 나머지는 서버 | 응답 500개 이상 |
| N+1: 학생별 최신 숙련도 조회 | 대시보드 쿼리 10초 이상 | 숙련도를 별도 테이블에 캐싱하고 응답 시 갱신 | 학생 50명 이상 |

---

## Security Mistakes

| 실수 | 위험 | 예방 |
|------|------|------|
| 학생 응답 데이터를 클라이언트에서 직접 집계 후 서버에 POST | 클라이언트가 점수를 조작할 수 있음 | 원시 응답(정답/오답)만 서버에 전송, 집계는 서버에서만 |
| 강사가 모든 학생 데이터 조회 API에 클래스 필터 없음 | 다른 반 학생 데이터 노출 | RLS: `class_id` 기반 row-level 접근 제한 |
| 기출문제 이미지를 퍼블릭 URL로 서빙 | 저작권 문제 + 무단 크롤링 | 서명된 URL(signed URL) 또는 인증 후 다운로드 |
| 미성년자 학습 데이터 장기 보관 | COPPA/개인정보보호법 위반 (만 14세 미만) | 데이터 보존 정책 명문화, 일정 기간 후 자동 삭제 |
| API에서 학생 UUID 대신 순차 ID 노출 | IDOR 취약점 (다른 학생 데이터 열거 가능) | 모든 공개 ID에 UUID v4 사용 |

---

## UX Pitfalls

| 함정 | 사용자 영향 | 개선 방향 |
|------|------------|-----------|
| 수식이 렌더링되기 전에 raw LaTeX 코드 노출 | 학생 혼란, 앱 신뢰도 하락 | 로딩 스켈레톤 or `visibility: hidden` 후 렌더링 완료 시 표시 |
| 정답 맞혔을 때만 피드백, 오답 해설 없음 | 학습 효과 없음 | 오답 시 단계별 풀이 해설(Step-by-step) 필수 |
| 적응형 추천이 "왜 이 문제인지" 설명 없음 | 학생이 알고리즘 불신 | 추천 이유 레이블 표시: "이 단원 정답률이 60%입니다" |
| 모바일에서 수식 입력 UI 없음 (강사용) | 강사가 모바일로 문제 입력 불가 | 강사 문제 입력은 데스크톱 전용으로 명확히 제한하거나 수식 키패드 제공 |
| 진도 대시보드가 단원별 평균 점수만 표시 | 어디가 약점인지 파악 불가 | BKT 숙련도 곡선 + 틀린 개념 태그 히트맵 표시 |

---

## "Looks Done But Isn't" Checklist

- [ ] **KaTeX 렌더링:** 스크린리더 접근성 확인 — KaTeX `aria-label` 또는 MathML 출력 여부 검증
- [ ] **오프라인 모드:** 실제 기기에서 비행기 모드로 전환 후 문제 풀기 → 재연결 후 동기화 흐름 검증
- [ ] **권한 관리:** 학생 계정으로 강사 API 엔드포인트 직접 호출 시 403 반환 확인
- [ ] **BKT 숙련도:** 같은 문제를 연속 10번 맞혔을 때 숙련도가 1에 수렴하지 않고 적절히 올라가는지 확인
- [ ] **문제 태깅:** 태그가 없는 문제가 추천 알고리즘에서 누락되지 않는지 확인
- [ ] **PWA 설치:** iOS Safari에서 "홈 화면에 추가" 후 오프라인 기동 확인
- [ ] **저작권:** 모든 문제 콘텐츠의 출처와 라이선스가 내부 데이터베이스에 기록되어 있는지 확인
- [ ] **수식 복사:** 학생이 수식을 클립보드에 복사했을 때 LaTeX 텍스트가 복사되는지 확인

---

## Recovery Strategies

| 함정 | 복구 비용 | 복구 단계 |
|------|-----------|-----------|
| 태그 스키마 재설계 | HIGH | (1) 새 스키마 정의 (2) 마이그레이션 스크립트 작성 (3) 기존 문제 일괄 재태깅 (학습 기록 참조 무결성 유지) |
| BKT 파라미터 오염 | MEDIUM | (1) 이상 파라미터 필터링 (2) 해당 단원 숙련도 초기화 (3) 제약 조건 추가 후 재추정 |
| SSR 하이드레이션 불일치 전수 발생 | MEDIUM | (1) 수식 컴포넌트 전체 `ssr: false` 전환 (2) CLS 방지 CSS 추가 (3) Lighthouse 재검증 |
| 오프라인 동기화 데이터 유실 | HIGH | (1) 이벤트 소싱 로그에서 복원 (2) 타임스탬프 기반 재정렬 (3) 사용자에게 손실 알림 및 보상) |
| 저작권 침해 경고 수신 | HIGH | (1) 해당 문제 즉시 비공개 처리 (2) 법적 검토 (3) 텍스트 재입력 후 재게시 |

---

## Pitfall-to-Phase Mapping

| 함정 | 방지 단계 | 검증 방법 |
|------|-----------|-----------|
| KaTeX SSR 하이드레이션 불일치 | Phase 1 (기술 스택 설정) | 수식 렌더링 POC에서 Lighthouse CLS < 0.1 확인 |
| BKT Cold Start | Phase 2 (적응형 엔진) | 신규 사용자 시뮬레이션: 진단 퀴즈 → 추천 결과 검토 |
| 문제 태깅 스키마 미설계 | Phase 1 (데이터 모델링) | 첫 100문제 입력 전 팀 리뷰 완료 |
| 기출문제 저작권 | Phase 0 (사전 기획) | 법적 검토 문서 + 입력 가이드라인 완성 |
| PWA 오프라인 동기화 충돌 | Phase 3 (PWA 구현) | 오프라인 시나리오 E2E 테스트 자동화 |
| 모바일 수식 레이아웃 깨짐 | Phase 1 (UI 컴포넌트) | 실제 기기 크로스브라우저 테스트 |
| 강사/학생 권한 부실 | Phase 1 (인증/권한) | OWASP IDOR 체크리스트 통과 |
| BKT 파라미터 비현실적 수렴 | Phase 2 (적응형 엔진) | 파라미터 바운딩 단위 테스트 + 모니터링 알림 |

---

## Sources

- Cold Start in Knowledge Tracing (2025): [https://arxiv.org/abs/2505.21517](https://arxiv.org/abs/2505.21517)
- BKT Parametric Constraints (EDM 2024): [https://educationaldatamining.org/edm2024/proceedings/2024.EDM-long-papers.2/index.html](https://educationaldatamining.org/edm2024/proceedings/2024.EDM-long-papers.2/index.html)
- pyBKT Library: [https://github.com/CAHLR/pyBKT](https://github.com/CAHLR/pyBKT)
- KaTeX vs MathJax 비교 (2025): [https://biggo.com/news/202511040733_KaTeX_MathJax_Web_Rendering_Comparison](https://biggo.com/news/202511040733_KaTeX_MathJax_Web_Rendering_Comparison)
- LaTeX/KaTeX 웹 챌린지: [https://evelynlearning.com/blog/challenges-in-writing-math-for-the-web-using-latex-and-katex](https://evelynlearning.com/blog/challenges-in-writing-math-for-the-web-using-latex-and-katex)
- PWA 오프라인 동적 데이터: [https://www.monterail.com/blog/pwa-offline-dynamic-data](https://www.monterail.com/blog/pwa-offline-dynamic-data)
- 수능 저작권 판결 (경향신문, 2024): [https://www.khan.co.kr/article/202408041306001](https://www.khan.co.kr/article/202408041306001)
- EdTech 보안 위반 사례 (2024): [https://managedservicesjournal.com/articles/edtech-security-challenges-to-overcome-in-2024/](https://managedservicesjournal.com/articles/edtech-security-challenges-to-overcome-in-2024/)
- FSRS 스페이스드 리피티션 알고리즘: [https://github.com/open-spaced-repetition/fsrs4anki/wiki/spaced-repetition-algorithm:-a-three%E2%80%90day-journey-from-novice-to-expert](https://github.com/open-spaced-repetition/fsrs4anki/wiki/spaced-repetition-algorithm:-a-three%E2%80%90day-journey-from-novice-to-expert)
- Moodle 문제 DB 구조 (공식 문서): [https://docs.moodle.org/dev/Question_database_structure](https://docs.moodle.org/dev/Question_database_structure)
- Deep KT 리뷰 (2025): [https://dl.acm.org/doi/10.1145/3729605.3729620](https://dl.acm.org/doi/10.1145/3729605.3729620)

---
*Pitfalls research for: 수학 기출문제 학습 웹앱 (Math Exam Learning PWA)*
*Researched: 2026-02-19*
