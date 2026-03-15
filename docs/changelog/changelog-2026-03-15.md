# Changelog 2026-03-15

## 데모용 로그인 우회

- 웹 앱 진입 시 세션이 없으면 데모 사용자 세션을 자동 생성하도록 변경
- 로그인 화면을 거치지 않고 즉시 역할 선택 온보딩으로 진입하도록 인증 흐름 조정
- 로그아웃 시 로그인 페이지 대신 데모 초기 상태로 복구해 다시 학생/강사 선택 가능하도록 수정
- `apps/web/src/lib/auth.test.ts` 추가로 데모 세션 자동 생성/초기화 동작 테스트 보강

## 진단퀴즈 데스크톱 레이아웃 보정

- `student/onboarding-quiz` 페이지를 `max-w-5xl` 기반의 좌측 정렬 레이아웃으로 확장해 사이드바와 본문 사이의 과도한 여백을 축소
- 상단 헤더를 진행 상태 패널과 함께 재구성해 데스크톱 폭 사용률과 시선 흐름 개선
- 첫 문제에서도 진행 바가 0%로 보이지 않도록 진단 진행률 계산 로직 분리 및 테스트 추가

## 학생 화면 폭 규칙 통일

- `PageContainer`에 데스크톱 좌측 정렬 옵션을 추가해 사이드바 기준 레이아웃을 공통화
- 학생 홈, 학습 분석, 학습 플래너, 문제 목록, 학습자료, 오답노트, 마이페이지에 좌측 정렬 폭 규칙 적용
- 데스크톱에서 주요 학생 화면이 `left: 256px` 기준으로 시작하도록 맞춰 사이드바와 본문 사이의 부자연스러운 간격을 축소

## 게임 모드 카드 대비 강화

- 반전 모드 전용 카드 토큰을 조정해 게임 카드 배경을 더 불투명한 다크 패널로 변경
- 게임 문제 본문 카드는 밝은 대비 패널로 전환해 수식과 텍스트 가독성 강화
- 게임 모드 선택 카드, 결과 카드, 객관식/단답 입력 카드의 텍스트와 보더 대비를 상향 조정

## 디자인 리파인먼트: 교육 프리미엄 (초등 7-12세)

### Phase 1: CSS 디자인 토큰 정제 (`index.css`)
- 브랜드 hue 250~260 혼재 → 255 통일 (Light/Dark 모드 전체)
- 순백 카드(`oklch(1 0 0)`) → 브랜드 틴트(`oklch(0.993 0.002 255)`)
- 순흑 그림자 → hue 255 틴트 그림자
- FunMode 토큰: hex → oklch 통일, glassmorphism 토큰 제거, 네온 4색 체계(green/magenta/gold/coral)
- 유동 타이포그래피 `clamp()` 적용 (h1~h4)
- `--radius: 0.85rem` → `0.75rem`
- 애니메이션 토큰 추가 (`--duration-*`, `--ease-*`)
- 보조 강조색 4색 추가 (coral/mint/amber/lavender)

### Phase 2: 핵심 UI 컴포넌트 정제
- **Button**: `kid` 사이즈(48px), `success` variant, `active:scale-[0.97]`, 아이콘 크기 확대
- **Card**: CVA variant 시스템 도입 (default/elevated/outlined/flat)
- **Badge**: `lg` 사이즈 추가

### Phase 3: 네비게이션 정제
- **BottomNav**: glassmorphism → solid 배경, pill 인디케이터, 라벨 11px
- **Sidebar**: solid 배경, 좌측 3px 보더 인디케이터, 섹션 라벨
- **AppShell Header**: solid 배경, border 강화

### Phase 4: FunMode 컴포넌트 정제
- **GlassCard**: glassmorphism 제거 → `bg-card/80 border-border`, `cn()` 리팩토링
- **NeonBorder**: `subtle` 옵션 추가, 글로우 40% 감소, cyan → green 마이그레이션
- **NeonText**: 기본 글로우 `low`, 글로우 40% 감소, cyan/red 제거
- **LaserButton**: size 동기화(kid), 글로우 감소, glass 의존 제거

### Phase 5: 레이아웃 패턴 컴포넌트 (신규)
- `PageContainer` — max-w variant (default/wide/narrow)
- `PageHeader` — title + action 레이아웃
- `EmptyState` — 빈 상태 안내 UI

### 마이그레이션
- NeonColor `cyan` → `green`, `red` → `coral` 전체 14개 파일 마이그레이션

### FunMode 텍스트 가독성 수정
- **근본 원인**: `--fun-text-*`, `--fun-bg-*`, `--fun-glass-border`, `--fun-neon-cyan`, `--fun-neon-red`, `--fun-glow-*` CSS 변수 미정의 → 텍스트 색상 미적용
- `index.css` [data-fun-mode] 블록에 누락 변수 19개 추가
- `--muted-foreground` 밝기 0.65 → 0.70 상향 (작은 텍스트 가독성)
- `--secondary`, `--secondary-foreground`, `--popover`, `--popover-foreground` FunMode 전용 토큰 추가
- `GlassCard`: `bg-card/80` → `bg-card/90` (반투명 배경 위 텍스트 대비 강화)
