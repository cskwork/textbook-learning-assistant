# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-24)

**핵심 가치:** 학생이 자신의 취약한 수학 유형을 정확히 파악하고, AI가 추천하는 맞춤 문제를 통해 효율적으로 실력을 향상시킬 수 있어야 한다
**현재 집중:** v4.0 PDF 2-Way 학습 시스템

## Current Position

Phase: Not started (요구사항 정의 완료, 로드맵 재작성 필요)
Plan: —
Status: 사용자 방향 전환 — 빠른 POC 우선, DB 없이, Vercel 배포
Last activity: 2026-02-24 — 요구사항 16개 정의 완료 후 방향 전환

## Performance Metrics

| 마일스톤 | Phases | Plans | 상태 |
|---------|--------|-------|------|
| v1.0 MVP | 9 | 38 | 완료 |
| v2.0 디자인 리뉴얼 | 5 | 21 | 완료 |
| v3.0 반전 모드 | 6 | 22 | 완료 |
| v4.0 PDF 2-Way | — | — | 요구사항 정의 중 |

## Accumulated Context

### Decisions

- **빠른 POC 우선 (2026-02-24):** 16개 전체 요구사항 대신 핵심 PDF→AI 파싱 파이프라인을 DB 없이 빠르게 검증
- **Vercel 배포 (2026-02-24):** Vercel serverless로 Gemini API 프록시 + 프론트엔드 배포. API 키 서버사이드 보호
- **DB 없이 시작 (2026-02-24):** Dexie/IndexedDB 스킵, 메모리 상태만으로 POC. DB는 검증 후 추가

(v3.0 결정사항 아카이브됨 — milestones/v3.0-ROADMAP.md 참조)

### Blockers/Concerns

- POC 아키텍처 (localStorage + Dexie) — 실서비스 전환 시 백엔드 연동 필요
- R3F v9 peer dep `react: ">=19 <19.3"` — React 19.3 릴리즈 시 즉시 재검토 필요

## Session Continuity

Last activity: 2026-02-24 — 요구사항 정의 완료, 사용자 방향 전환
Stopped at: 로드맵 생성 직전 — 사용자가 "빠른 POC, DB 없이, Vercel" 요청
Resume file: None
Next command: /gsd:new-milestone (로드맵을 POC 우선 방향으로 재작성)

### 방향 전환 컨텍스트
- REQUIREMENTS.md 16개 정의 완료 (커밋됨)
- 리서치 4종 + SUMMARY.md 완료 (커밋됨)
- 로드맵은 아직 미작성 (roadmapper가 v4.0 phases를 쓰지 못함)
- **사용자 요청:** "i want a fast poc first (no db at first place) just use vercel"
- **의미:** 16개 요구사항 중 핵심(PDF 업로드 → Gemini 파싱 → 결과 표시)만 먼저 빌드
- **기술 변경:** Vercel serverless API route로 Gemini 호출 (API 키 보호), DB 스킵
- **다음 세션에서 할 일:** REQUIREMENTS.md를 POC 범위로 축소하거나, Phase 21을 "Fast POC" phase로 정의하고 나머지를 후속 phase로 배치
