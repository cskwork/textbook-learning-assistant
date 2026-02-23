// useGameSession.ts
// useReducer 기반 게임 세션 상태머신 — 모든 게임 모드에서 공유
// Phase 19 게임화 퀴즈 엔진

import { useReducer, useCallback, useMemo, useEffect } from 'react'
import type { Question } from '@/lib/db'
import type { GameMode } from '@/lib/db'

// ─── 상태 타입 ─────────────────────────────────────────────────────────────────

export type GamePhase = 'ready' | 'playing' | 'paused' | 'finished'

export interface GameSessionState {
  phase: GamePhase
  mode: GameMode
  currentQuestionIndex: number
  questions: Question[]
  correctCount: number
  wrongCount: number
  totalScore: number
  xpEarned: number
  startTime: number
  endTime: number | null
  // 모드별 확장 필드
  hearts: number           // survival: 기본 3
  bossHp: number           // bossBattle: 기본 100
  playerHp: number         // bossBattle: 기본 3 (하트)
  timePerQuestion: number  // timeAttack: 난이도별 차등
  comboCount: number       // 연속 정답
  maxCombo: number         // 최대 콤보 기록
}

/** 게임 세션 결과 — onComplete 콜백으로 전달 */
export interface GameSessionResult {
  mode: GameMode
  correctCount: number
  totalQuestions: number
  score: number
  xpEarned: number
  timeElapsed: number  // 초
  maxCombo: number
  metadata?: Record<string, unknown>
}

// ─── 액션 타입 ─────────────────────────────────────────────────────────────────

type GameAction =
  | { type: 'START_GAME' }
  | { type: 'ANSWER_CORRECT'; score: number; xp: number }
  | { type: 'ANSWER_WRONG' }
  | { type: 'NEXT_QUESTION' }
  | { type: 'TIME_UP' }
  | { type: 'FINISH_GAME' }
  | { type: 'RECOVER_HEART' }
  | { type: 'RESET_SESSION'; mode: GameMode; questions: Question[] }

// ─── 리듀서 ───────────────────────────────────────────────────────────────────

export function gameReducer(state: GameSessionState, action: GameAction): GameSessionState {
  switch (action.type) {
    case 'START_GAME':
      return {
        ...state,
        phase: 'playing',
        startTime: Date.now(),
      }

    case 'ANSWER_CORRECT': {
      const newCombo = state.comboCount + 1
      const newState: GameSessionState = {
        ...state,
        correctCount: state.correctCount + 1,
        comboCount: newCombo,
        maxCombo: Math.max(state.maxCombo, newCombo),
        totalScore: state.totalScore + action.score,
        xpEarned: state.xpEarned + action.xp,
      }

      // 보스배틀: 보스 HP 감소 (10 데미지)
      if (state.mode === 'bossBattle') {
        newState.bossHp = Math.max(0, state.bossHp - 10)
        if (newState.bossHp <= 0) {
          newState.phase = 'finished'
          newState.endTime = Date.now()
        }
      }

      return newState
    }

    case 'ANSWER_WRONG': {
      const newState: GameSessionState = {
        ...state,
        wrongCount: state.wrongCount + 1,
        comboCount: 0,
      }

      // 서바이벌: 하트 감소
      if (state.mode === 'survival') {
        newState.hearts = state.hearts - 1
        if (newState.hearts <= 0) {
          newState.phase = 'finished'
          newState.endTime = Date.now()
        }
      }

      // 보스배틀: 플레이어 HP 감소
      if (state.mode === 'bossBattle') {
        newState.playerHp = state.playerHp - 1
        if (newState.playerHp <= 0) {
          newState.phase = 'finished'
          newState.endTime = Date.now()
        }
      }

      return newState
    }

    case 'NEXT_QUESTION': {
      const nextIndex = state.currentQuestionIndex + 1
      // 서바이벌은 문제 인덱스를 순환시키고, 종료는 하트 0에서만 처리한다.
      if (state.mode === 'survival') {
        if (state.questions.length === 0) {
          return {
            ...state,
            phase: 'finished',
            endTime: Date.now(),
          }
        }
        return {
          ...state,
          currentQuestionIndex: nextIndex % state.questions.length,
        }
      }

      // 마지막 문제 완료 시 종료
      if (nextIndex >= state.questions.length) {
        return {
          ...state,
          currentQuestionIndex: nextIndex,
          phase: 'finished',
          endTime: Date.now(),
        }
      }
      return {
        ...state,
        currentQuestionIndex: nextIndex,
      }
    }

    case 'TIME_UP':
      // 타임어택: 시간 소진 = 오답 처리
      return gameReducer(
        gameReducer(state, { type: 'ANSWER_WRONG' }),
        { type: 'NEXT_QUESTION' },
      )

    case 'FINISH_GAME':
      return {
        ...state,
        phase: 'finished',
        endTime: Date.now(),
      }

    case 'RECOVER_HEART':
      // 서바이벌 10문제마다 하트 회복 (최대 3)
      return {
        ...state,
        hearts: Math.min(3, state.hearts + 1),
      }

    case 'RESET_SESSION':
      return createInitialState(action.mode, action.questions)

    default:
      return state
  }
}

// ─── 초기 상태 생성 ───────────────────────────────────────────────────────────

export function createInitialState(mode: GameMode, questions: Question[]): GameSessionState {
  // 타임어택 난이도별 시간 계산
  let timePerQuestion = 20
  if (mode === 'timeAttack' && questions.length > 0) {
    const avgDifficulty =
      questions.reduce((sum, q) => sum + q.difficulty, 0) / questions.length
    if (avgDifficulty <= 2) timePerQuestion = 30
    else if (avgDifficulty <= 3) timePerQuestion = 20
    else timePerQuestion = 15
  }

  return {
    phase: 'ready',
    mode,
    currentQuestionIndex: 0,
    questions,
    correctCount: 0,
    wrongCount: 0,
    totalScore: 0,
    xpEarned: 0,
    startTime: 0,
    endTime: null,
    hearts: 3,
    bossHp: 100,
    playerHp: 3,
    timePerQuestion,
    comboCount: 0,
    maxCombo: 0,
  }
}

/** 문제 목록 변경 감지를 위한 시그니처 문자열 생성 */
export function createQuestionsSignature(questions: Question[]): string {
  return questions.map((q) => q.id).join(',')
}

// ─── 훅 ────────────────────────────────────────────────────────────────────

export function useGameSession(mode: GameMode, questions: Question[]) {
  const [state, dispatch] = useReducer(
    gameReducer,
    { mode, questions },
    ({ mode, questions }) => createInitialState(mode, questions),
  )

  const questionsSignature = useMemo(() => createQuestionsSignature(questions), [questions])

  // 질문 세트/모드가 바뀌면 세션 상태를 초기화한다.
  // (초기 로딩 시 [] → 실제 문제 목록 전환 케이스 포함)
  useEffect(() => {
    dispatch({ type: 'RESET_SESSION', mode, questions })
  }, [mode, questionsSignature])

  const startGame = useCallback(() => dispatch({ type: 'START_GAME' }), [])
  const answerCorrect = useCallback(
    (score: number, xp: number) => dispatch({ type: 'ANSWER_CORRECT', score, xp }),
    [],
  )
  const answerWrong = useCallback(() => dispatch({ type: 'ANSWER_WRONG' }), [])
  const nextQuestion = useCallback(() => dispatch({ type: 'NEXT_QUESTION' }), [])
  const timeUp = useCallback(() => dispatch({ type: 'TIME_UP' }), [])
  const finishGame = useCallback(() => dispatch({ type: 'FINISH_GAME' }), [])
  const recoverHeart = useCallback(() => dispatch({ type: 'RECOVER_HEART' }), [])

  /** 현재 문제 (파생) */
  const currentQuestion = state.questions[state.currentQuestionIndex] ?? null

  /** 게임 종료 여부 (파생) */
  const isGameOver = state.phase === 'finished'

  /** 세션 결과 객체 생성 (게임 종료 시 사용) */
  const sessionResult = useMemo((): GameSessionResult | null => {
    if (!isGameOver) return null
    const timeElapsed = state.endTime
      ? Math.round((state.endTime - state.startTime) / 1000)
      : 0
    return {
      mode: state.mode,
      correctCount: state.correctCount,
      totalQuestions: state.currentQuestionIndex,
      score: state.totalScore,
      xpEarned: state.xpEarned,
      timeElapsed,
      maxCombo: state.maxCombo,
    }
  }, [isGameOver, state])

  return {
    state,
    dispatch,
    // 편의 함수
    startGame,
    answerCorrect,
    answerWrong,
    nextQuestion,
    timeUp,
    finishGame,
    recoverHeart,
    // 파생 상태
    currentQuestion,
    isGameOver,
    sessionResult,
  }
}
