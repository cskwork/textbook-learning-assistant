# 수학 기출 학습 도우미

## 현재 상태

- **완료된 Milestones:** v1.0 MVP, v2.0 디자인 리뉴얼, v3.0 반전 모드 게이미피케이션
- **현재 Milestone:** v4.0 PDF 2-Way 학습 시스템
- **현재 Phase:** 요구사항 정의 중 (리서치 진행)
- **다음 명령어:** `/gsd:new-milestone` (요구사항 → 로드맵 생성)
- **참고:** `/clear` 먼저 실행 후 위 명령어 실행 권장 (fresh context)

## v4.0 목표

PDF ↔ 앱 양방향 연동:
- PDF 업로드 & Gemini Vision AI 문제 자동 추출 (사용자 검수/수정)
- PDF 뷰어 + 풀이 오버레이 (iPad 시험지 느낌)
- 강사용 PDF → DB 자동 등록
- 앱 → PDF 내보내기 (시험지 스타일 + 학습지 스타일)

## 핵심 결정사항

- 하단 탭바 네비게이션 (모바일/태블릿), 데스크톱은 사이드바
- 태블릿 우선(tablet-first) 반응형 디자인
- 기출탭탭 스타일 — 파란색 계열, 교육 앱 느낌
- Tailwind v4 CSS-first 방식 유지 — 디자인 토큰은 @layer base CSS 변수
- POC 아키텍처(localStorage + Dexie) 유지

## 기술 스택

- Frontend: React 19 + Vite 7 + Tailwind v4 + shadcn/ui
- Backend: Express 5 + Drizzle ORM + PostgreSQL (POC: localStorage mock)
- Auth: JWT (jsonwebtoken) + bcrypt (POC: localStorage mock)
- v2.0: Swiper, Framer Motion, Pretendard 폰트
- v3.0: Phaser 3.90, Three.js 0.183, R3F 9.5, Howler.js 2.2, Dexie v9

# context-mode — MANDATORY routing rules

You have context-mode MCP tools available. These rules are NOT optional — they protect your context window from flooding. A single unrouted command can dump 56 KB into context and waste the entire session.

## BLOCKED commands — do NOT attempt these

### curl / wget — BLOCKED
Any Bash command containing `curl` or `wget` is intercepted and replaced with an error message. Do NOT retry.
Instead use:
- `ctx_fetch_and_index(url, source)` to fetch and index web pages
- `ctx_execute(language: "javascript", code: "const r = await fetch(...)")` to run HTTP calls in sandbox

### Inline HTTP — BLOCKED
Any Bash command containing `fetch('http`, `requests.get(`, `requests.post(`, `http.get(`, or `http.request(` is intercepted and replaced with an error message. Do NOT retry with Bash.
Instead use:
- `ctx_execute(language, code)` to run HTTP calls in sandbox — only stdout enters context

### WebFetch — BLOCKED
WebFetch calls are denied entirely. The URL is extracted and you are told to use `ctx_fetch_and_index` instead.
Instead use:
- `ctx_fetch_and_index(url, source)` then `ctx_search(queries)` to query the indexed content

## REDIRECTED tools — use sandbox equivalents

### Bash (>20 lines output)
Bash is ONLY for: `git`, `mkdir`, `rm`, `mv`, `cd`, `ls`, `npm install`, `pip install`, and other short-output commands.
For everything else, use:
- `ctx_batch_execute(commands, queries)` — run multiple commands + search in ONE call
- `ctx_execute(language: "shell", code: "...")` — run in sandbox, only stdout enters context

### Read (for analysis)
If you are reading a file to **Edit** it → Read is correct (Edit needs content in context).
If you are reading to **analyze, explore, or summarize** → use `ctx_execute_file(path, language, code)` instead. Only your printed summary enters context. The raw file content stays in the sandbox.

### Grep (large results)
Grep results can flood context. Use `ctx_execute(language: "shell", code: "grep ...")` to run searches in sandbox. Only your printed summary enters context.

## Tool selection hierarchy

1. **GATHER**: `ctx_batch_execute(commands, queries)` — Primary tool. Runs all commands, auto-indexes output, returns search results. ONE call replaces 30+ individual calls.
2. **FOLLOW-UP**: `ctx_search(queries: ["q1", "q2", ...])` — Query indexed content. Pass ALL questions as array in ONE call.
3. **PROCESSING**: `ctx_execute(language, code)` | `ctx_execute_file(path, language, code)` — Sandbox execution. Only stdout enters context.
4. **WEB**: `ctx_fetch_and_index(url, source)` then `ctx_search(queries)` — Fetch, chunk, index, query. Raw HTML never enters context.
5. **INDEX**: `ctx_index(content, source)` — Store content in FTS5 knowledge base for later search.

## Subagent routing

When spawning subagents (Agent/Task tool), the routing block is automatically injected into their prompt. Bash-type subagents are upgraded to general-purpose so they have access to MCP tools. You do NOT need to manually instruct subagents about context-mode.

## Output constraints

- Keep responses under 500 words.
- Write artifacts (code, configs, PRDs) to FILES — never return them as inline text. Return only: file path + 1-line description.
- When indexing content, use descriptive source labels so others can `ctx_search(source: "label")` later.

## ctx commands

| Command | Action |
|---------|--------|
| `ctx stats` | Call the `ctx_stats` MCP tool and display the full output verbatim |
| `ctx doctor` | Call the `ctx_doctor` MCP tool, run the returned shell command, display as checklist |
| `ctx upgrade` | Call the `ctx_upgrade` MCP tool, run the returned shell command, display as checklist |
