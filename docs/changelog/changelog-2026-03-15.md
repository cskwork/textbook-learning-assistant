# Changelog 2026-03-15

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
