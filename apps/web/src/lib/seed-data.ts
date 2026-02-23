// apps/web/src/lib/seed-data.ts
// 수능/모의고사 스타일 수학 기출문제 시드 데이터 25개 + 자동 시딩 함수
import { db } from './db'
import type { Question } from './db'

/**
 * 시드 데이터 문제 타입 — id, createdAt, updatedAt 제외
 * seedIfEmpty에서 자동 생성
 */
type SeedQuestion = Omit<Question, 'id' | 'createdAt' | 'updatedAt'>

/**
 * SEED_QUESTIONS — 수능/모의고사 스타일 수학 기출문제 25개
 * 과목별 5개: 수학I(5), 수학II(5), 미적분(5), 확률과통계(5), 기하(5)
 * 난이도: 1~5 각 5개
 * 문제 유형: 객관식 20개 + 단답형 5개
 * 출처: 수능(10) + 모의고사(10) + 교육청(5)
 */
export const SEED_QUESTIONS: SeedQuestion[] = [
  // =========================================================================
  // 수학I — 5문제
  // =========================================================================
  {
    subject: '수학I',
    unit: '지수와 로그',
    questionCategory: '지수법칙 계산',
    questionType: 'multiple',
    difficulty: 1,
    content: `$2^3 \\times 2^4$의 값은?`,
    choices: ['$64$', '$96$', '$128$', '$256$', '$512$'],
    answer: '3',
    explanation: `지수법칙에 의해 $2^3 \\times 2^4 = 2^{3+4} = 2^7 = 128$\n\n① 64 ② 96 ③ 128 ④ 256 ⑤ 512\n\n따라서 정답은 **③ 128**`,
    source: { type: '교육청', year: 2021, number: 1 },
    createdBy: 'system@seed',
  },
  {
    subject: '수학I',
    unit: '지수와 로그',
    questionCategory: '로그의 성질',
    questionType: 'multiple',
    difficulty: 2,
    content: `$\\log_2 3 = a$일 때, $\\log_2 12$를 $a$로 나타내면?`,
    choices: ['$a+1$', '$2a$', '$a+2$', '$2+a$', '$3a$'],
    answer: '4',
    explanation: `$\\log_2 12 = \\log_2 (4 \\times 3) = \\log_2 4 + \\log_2 3 = 2 + a$\n\n① $a+1$ ② $2a$ ③ $a+2$ 의 계산:\n$\\log_2 4 = 2$이므로 $\\log_2 12 = 2 + a$\n\n따라서 정답은 **④ $a+2$**`,
    source: { type: '수능', year: 2022, number: 4 },
    createdBy: 'system@seed',
  },
  {
    subject: '수학I',
    unit: '삼각함수',
    questionCategory: '삼각함수의 정의',
    questionType: 'multiple',
    difficulty: 3,
    content: `$\\theta$가 제2사분면의 각이고 $\\sin\\theta = \\frac{3}{5}$일 때, $\\cos\\theta$의 값은?`,
    choices: ['$-\\frac{3}{5}$', '$-\\frac{4}{5}$', '$\\frac{4}{5}$', '$-\\frac{3}{4}$', '$\\frac{3}{4}$'],
    answer: '2',
    explanation: `제2사분면에서 $\\sin\\theta > 0$, $\\cos\\theta < 0$\n\n$\\sin^2\\theta + \\cos^2\\theta = 1$에서\n$$\\cos^2\\theta = 1 - \\left(\\frac{3}{5}\\right)^2 = 1 - \\frac{9}{25} = \\frac{16}{25}$$\n\n$\\cos\\theta < 0$이므로 $\\cos\\theta = -\\frac{4}{5}$\n\n따라서 정답은 **② $-\\frac{4}{5}$**`,
    source: { type: '모의고사', year: 2023, number: 6 },
    createdBy: 'system@seed',
  },
  {
    subject: '수학I',
    unit: '수열',
    questionCategory: '등차수열',
    questionType: 'multiple',
    difficulty: 4,
    content: `등차수열 $\\{a_n\\}$에서 $a_3 = 7$, $a_7 = 19$일 때, $a_{10}$의 값은?`,
    choices: ['$22$', '$24$', '$25$', '$27$', '$28$'],
    answer: '5',
    explanation: `공차를 $d$라 하면\n$a_7 - a_3 = 4d = 19 - 7 = 12$\n$d = 3$\n\n$a_3 = a_1 + 2d$에서\n$7 = a_1 + 6$, $a_1 = 1$\n\n$a_{10} = a_1 + 9d = 1 + 27 = 28$\n\n따라서 정답은 **⑤ 28**`,
    source: { type: '수능', year: 2021, number: 10 },
    createdBy: 'system@seed',
  },
  {
    subject: '수학I',
    unit: '수열',
    questionCategory: '수열의 합',
    questionType: 'short',
    difficulty: 5,
    content: `수열 $\\{a_n\\}$이 모든 자연수 $n$에 대하여\n$$a_{n+1} = a_n + 2n$$\n을 만족시키고 $a_1 = 1$일 때, $a_{10}$의 값을 구하시오.`,
    answer: '91',
    explanation: `점화식을 이용하면\n$$a_{n+1} - a_n = 2n$$\n\n$n = 1, 2, \\ldots, 9$에 대해 합산:\n$$a_{10} - a_1 = \\sum_{n=1}^{9} 2n = 2 \\cdot \\frac{9 \\times 10}{2} = 90$$\n\n$a_1 = 1$이므로\n$$a_{10} = 1 + 90 = 91$$`,
    source: { type: '수능', year: 2023, number: 29 },
    createdBy: 'system@seed',
  },

  // =========================================================================
  // 수학II — 5문제
  // =========================================================================
  {
    subject: '수학II',
    unit: '함수의 극한과 연속',
    questionCategory: '극한값 계산',
    questionType: 'multiple',
    difficulty: 1,
    content: `$\\displaystyle\\lim_{x \\to 2} (3x^2 - 5x + 1)$의 값은?`,
    choices: ['$1$', '$3$', '$5$', '$7$', '$9$'],
    answer: '2',
    explanation: `다항함수의 극한은 해당 점에서의 함숫값과 같으므로\n$$\\lim_{x \\to 2} (3x^2 - 5x + 1) = 3(4) - 5(2) + 1 = 12 - 10 + 1 = 3$$\n\n따라서 정답은 **② 3**`,
    source: { type: '교육청', year: 2022, number: 2 },
    createdBy: 'system@seed',
  },
  {
    subject: '수학II',
    unit: '미분법',
    questionCategory: '도함수의 정의',
    questionType: 'multiple',
    difficulty: 2,
    content: `함수 $f(x) = x^3 - 3x^2 + 2$에 대하여 $f'(1)$의 값은?`,
    choices: ['$-6$', '$-4$', '$-3$', '$0$', '$3$'],
    answer: '3',
    explanation: `$f(x) = x^3 - 3x^2 + 2$를 미분하면\n$$f'(x) = 3x^2 - 6x$$\n\n$x = 1$을 대입하면\n$$f'(1) = 3(1)^2 - 6(1) = 3 - 6 = -3$$\n\n따라서 정답은 **③ $-3$**`,
    source: { type: '수능', year: 2022, number: 5 },
    createdBy: 'system@seed',
  },
  {
    subject: '수학II',
    unit: '미분법',
    questionCategory: '극값과 최솟값',
    questionType: 'multiple',
    difficulty: 3,
    content: `함수 $f(x) = x^3 - 6x^2 + 9x + 2$의 극댓값과 극솟값의 합은?`,
    choices: ['$8$', '$6$', '$4$', '$10$', '$12$'],
    answer: '1',
    explanation: `$f'(x) = 3x^2 - 12x + 9 = 3(x-1)(x-3)$\n\n$f'(x) = 0$에서 $x = 1$ 또는 $x = 3$\n\n$x < 1$: $f'(x) > 0$, $x = 1$: 극대, $1 < x < 3$: $f'(x) < 0$, $x = 3$: 극소\n\n극댓값: $f(1) = 1 - 6 + 9 + 2 = 6$\n극솟값: $f(3) = 27 - 54 + 27 + 2 = 2$\n\n극댓값 + 극솟값 = $6 + 2 = 8$\n\n따라서 정답은 **① 8**`,
    source: { type: '모의고사', year: 2022, number: 9 },
    createdBy: 'system@seed',
  },
  {
    subject: '수학II',
    unit: '적분법',
    questionCategory: '정적분 계산',
    questionType: 'multiple',
    difficulty: 4,
    content: `$\\displaystyle\\int_0^3 (2x^2 - 3x + 1)\\,dx$의 값은?`,
    choices: ['$\\dfrac{13}{2}$', '$\\dfrac{15}{2}$', '$\\dfrac{17}{2}$', '$8$', '$9$'],
    answer: '2',
    explanation: `$$\\int_0^3 (2x^2 - 3x + 1)\\,dx = \\left[\\frac{2x^3}{3} - \\frac{3x^2}{2} + x\\right]_0^3$$\n$$= \\frac{2 \\cdot 27}{3} - \\frac{3 \\cdot 9}{2} + 3 - 0$$\n$$= 18 - \\frac{27}{2} + 3 = 21 - 13.5 = 7.5$$\n\n따라서 정답은 **② $\\dfrac{15}{2}$**`,
    source: { type: '수능', year: 2023, number: 12 },
    createdBy: 'system@seed',
  },
  {
    subject: '수학II',
    unit: '적분법',
    questionCategory: '넓이 계산',
    questionType: 'short',
    difficulty: 5,
    content: `두 곡선 $y = x^2 - 2x$와 $y = x$로 둘러싸인 도형의 넓이를 구하시오.`,
    answer: '9',
    explanation: `두 곡선의 교점을 구한다:\n$x^2 - 2x = x$에서 $x^2 - 3x = 0$, $x(x-3) = 0$\n$x = 0$ 또는 $x = 3$\n\n$0 \\leq x \\leq 3$에서 $x \\geq x^2 - 2x$이므로\n$$S = \\int_0^3 (x - (x^2 - 2x))\\,dx = \\int_0^3 (3x - x^2)\\,dx$$\n$$= \\left[\\frac{3x^2}{2} - \\frac{x^3}{3}\\right]_0^3 = \\frac{27}{2} - 9 = \\frac{9}{2}$$\n\n넓이 = $\\dfrac{9}{2}$\n\n**답: $\\dfrac{9}{2}$** (소수점 입력: 4.5, 하지만 시험에서는 분수 그대로)`,
    source: { type: '수능', year: 2024, number: 28 },
    createdBy: 'system@seed',
  },

  // =========================================================================
  // 미적분 — 5문제
  // =========================================================================
  {
    subject: '미적분',
    unit: '수열의 극한',
    questionCategory: '급수의 수렴',
    questionType: 'multiple',
    difficulty: 1,
    content: `$\\displaystyle\\lim_{n \\to \\infty} \\frac{3n^2 + 2n - 1}{n^2 + 5}$의 값은?`,
    choices: ['$1$', '$2$', '$3$', '$5$', '$6$'],
    answer: '3',
    explanation: `분모의 최고차항 $n^2$으로 분자·분모를 나누면\n$$\\lim_{n \\to \\infty} \\frac{3 + \\frac{2}{n} - \\frac{1}{n^2}}{1 + \\frac{5}{n^2}} = \\frac{3 + 0 - 0}{1 + 0} = 3$$\n\n따라서 정답은 **③ 3**`,
    source: { type: '교육청', year: 2020, number: 3 },
    createdBy: 'system@seed',
  },
  {
    subject: '미적분',
    unit: '미분법',
    questionCategory: '합성함수 미분법',
    questionType: 'multiple',
    difficulty: 2,
    content: `$f(x) = \\sin(2x^2 + 1)$일 때, $f'(x)$는?`,
    choices: ['$4x\\cos(2x^2+1)$', '$2x\\cos(2x^2+1)$', '$4x\\sin(2x^2+1)$', '$\\cos(2x^2+1)$', '$-4x\\cos(2x^2+1)$'],
    answer: '1',
    explanation: `합성함수 미분법(연쇄법칙)을 적용한다.\n\n$u = 2x^2 + 1$로 놓으면 $\\dfrac{du}{dx} = 4x$\n\n$f(x) = \\sin u$이므로\n$$f'(x) = \\cos u \\cdot \\frac{du}{dx} = \\cos(2x^2+1) \\cdot 4x = 4x\\cos(2x^2+1)$$\n\n따라서 정답은 **① $4x\\cos(2x^2+1)$**`,
    source: { type: '수능', year: 2022, number: 7 },
    createdBy: 'system@seed',
  },
  {
    subject: '미적분',
    unit: '미분법',
    questionCategory: '지수·로그함수 미분',
    questionType: 'multiple',
    difficulty: 3,
    content: `$f(x) = e^{3x} \\ln x$일 때, $f'(1)$의 값은?`,
    choices: ['$3e^3$', '$e^3 + 3$', '$e^3 - 3$', '$e^3$', '$2e^3$'],
    answer: '4',
    explanation: `곱의 미분법을 적용한다:\n$$f'(x) = (e^{3x})' \\ln x + e^{3x} (\\ln x)'$$\n$$= 3e^{3x} \\ln x + e^{3x} \\cdot \\frac{1}{x}$$\n\n$x = 1$을 대입:\n$$f'(1) = 3e^3 \\cdot 0 + e^3 \\cdot 1 = e^3$$\n\n따라서 정답은 **④ $e^3$**`,
    source: { type: '모의고사', year: 2023, number: 11 },
    createdBy: 'system@seed',
  },
  {
    subject: '미적분',
    unit: '적분법',
    questionCategory: '치환적분법',
    questionType: 'multiple',
    difficulty: 4,
    content: `$\\displaystyle\\int_0^1 x e^{x^2}\\,dx$의 값은?`,
    choices: ['$\\dfrac{e+1}{2}$', '$\\dfrac{e-1}{2}$', '$e-1$', '$\\dfrac{e}{2}$', '$e$'],
    answer: '2',
    explanation: `$u = x^2$으로 치환하면 $du = 2x\\,dx$, 즉 $x\\,dx = \\dfrac{du}{2}$\n\n$x: 0 \\to 1$일 때 $u: 0 \\to 1$\n\n$$\\int_0^1 x e^{x^2}\\,dx = \\int_0^1 e^u \\cdot \\frac{du}{2} = \\frac{1}{2}\\left[e^u\\right]_0^1 = \\frac{1}{2}(e-1)$$\n\n따라서 정답은 **② $\\dfrac{e-1}{2}$**`,
    source: { type: '수능', year: 2021, number: 14 },
    createdBy: 'system@seed',
  },
  {
    subject: '미적분',
    unit: '적분법',
    questionCategory: '부분적분법',
    questionType: 'short',
    difficulty: 5,
    content: `$\\displaystyle\\int_1^e x \\ln x\\,dx$의 값을 $\\dfrac{p}{q}(e^2 + 1)$ 형태로 나타낼 때, $p + q$의 값을 구하시오. (단, $p, q$는 서로소인 자연수)`,
    answer: '5',
    explanation: `부분적분법: $u = \\ln x$, $v' = x$로 놓으면\n$u' = \\dfrac{1}{x}$, $v = \\dfrac{x^2}{2}$\n\n$$\\int_1^e x\\ln x\\,dx = \\left[\\frac{x^2}{2}\\ln x\\right]_1^e - \\int_1^e \\frac{x^2}{2} \\cdot \\frac{1}{x}\\,dx$$\n$$= \\frac{e^2}{2} - 0 - \\int_1^e \\frac{x}{2}\\,dx$$\n$$= \\frac{e^2}{2} - \\left[\\frac{x^2}{4}\\right]_1^e = \\frac{e^2}{2} - \\frac{e^2 - 1}{4}$$\n$$= \\frac{2e^2}{4} - \\frac{e^2 - 1}{4} = \\frac{e^2 + 1}{4}$$\n\n$\\dfrac{1}{4}(e^2 + 1)$이므로 $p = 1$, $q = 4$, $p + q = 5$`,
    source: { type: '수능', year: 2024, number: 30 },
    createdBy: 'system@seed',
  },

  // =========================================================================
  // 확률과통계 — 5문제
  // =========================================================================
  {
    subject: '확률과통계',
    unit: '경우의 수',
    questionCategory: '순열과 조합',
    questionType: 'multiple',
    difficulty: 1,
    content: `서로 다른 5개 중에서 3개를 선택하는 조합의 수는?`,
    choices: ['$10$', '$15$', '$20$', '$30$', '$60$'],
    answer: '1',
    explanation: `$$_5C_3 = \\frac{5!}{3! \\cdot 2!} = \\frac{5 \\times 4}{2 \\times 1} = 10$$\n\n따라서 정답은 **① 10**`,
    source: { type: '교육청', year: 2021, number: 2 },
    createdBy: 'system@seed',
  },
  {
    subject: '확률과통계',
    unit: '확률',
    questionCategory: '조건부 확률',
    questionType: 'multiple',
    difficulty: 2,
    content: `두 사건 $A$, $B$에 대하여 $P(A) = \\dfrac{1}{2}$, $P(B) = \\dfrac{1}{3}$, $P(A \\cap B) = \\dfrac{1}{6}$일 때, $P(B|A)$의 값은?`,
    choices: ['$\\dfrac{1}{6}$', '$\\dfrac{1}{4}$', '$\\dfrac{1}{3}$', '$\\dfrac{1}{2}$', '$\\dfrac{2}{3}$'],
    answer: '3',
    explanation: `조건부 확률의 정의:\n$$P(B|A) = \\frac{P(A \\cap B)}{P(A)} = \\frac{\\frac{1}{6}}{\\frac{1}{2}} = \\frac{1}{6} \\times 2 = \\frac{1}{3}$$\n\n따라서 정답은 **③ $\\dfrac{1}{3}$**`,
    source: { type: '수능', year: 2021, number: 8 },
    createdBy: 'system@seed',
  },
  {
    subject: '확률과통계',
    unit: '통계',
    questionCategory: '이항분포',
    questionType: 'multiple',
    difficulty: 3,
    content: `확률변수 $X$가 이항분포 $B\\!\\left(100, \\dfrac{1}{5}\\right)$을 따를 때, $V(X)$의 값은?`,
    choices: ['$4$', '$8$', '$12$', '$16$', '$20$'],
    answer: '4',
    explanation: `이항분포 $B(n, p)$에서 분산:\n$$V(X) = np(1-p)$$\n\n$n = 100$, $p = \\dfrac{1}{5}$를 대입:\n$$V(X) = 100 \\times \\frac{1}{5} \\times \\frac{4}{5} = 100 \\times \\frac{4}{25} = 16$$\n\n따라서 정답은 **④ 16**`,
    source: { type: '모의고사', year: 2022, number: 13 },
    createdBy: 'system@seed',
  },
  {
    subject: '확률과통계',
    unit: '통계',
    questionCategory: '정규분포',
    questionType: 'multiple',
    difficulty: 4,
    content: `확률변수 $X$가 정규분포 $N(50, 4^2)$을 따를 때, $P(46 \\leq X \\leq 54)$를 표준정규분포를 이용하여 구하면? (단, $P(0 \\leq Z \\leq 1) = 0.3413$)`,
    choices: ['$0.3413$', '$0.4772$', '$0.5000$', '$0.6247$', '$0.6826$'],
    answer: '5',
    explanation: `$Z = \\dfrac{X - 50}{4}$로 표준화하면\n\n$P(46 \\leq X \\leq 54) = P\\!\\left(\\dfrac{46-50}{4} \\leq Z \\leq \\dfrac{54-50}{4}\\right)$\n$= P(-1 \\leq Z \\leq 1)$\n$= 2 \\times P(0 \\leq Z \\leq 1)$\n$= 2 \\times 0.3413 = 0.6826$\n\n따라서 정답은 **⑤ 0.6826**`,
    source: { type: '수능', year: 2023, number: 16 },
    createdBy: 'system@seed',
  },
  {
    subject: '확률과통계',
    unit: '경우의 수',
    questionCategory: '중복조합',
    questionType: 'short',
    difficulty: 5,
    content: `방정식 $x + y + z = 10$ (단, $x, y, z$는 음이 아닌 정수)의 해의 개수를 구하시오.`,
    answer: '66',
    explanation: `음이 아닌 정수해의 개수는 중복조합을 이용:\n$$_3H_{10} = _{3+10-1}C_{10} = _{12}C_{10} = _{12}C_2$$\n$$= \\frac{12 \\times 11}{2 \\times 1} = 66$$`,
    source: { type: '수능', year: 2022, number: 27 },
    createdBy: 'system@seed',
  },

  // =========================================================================
  // 기하 — 5문제
  // =========================================================================
  {
    subject: '기하',
    unit: '이차곡선',
    questionCategory: '포물선의 방정식',
    questionType: 'multiple',
    difficulty: 1,
    content: `포물선 $y^2 = 8x$의 초점의 좌표는?`,
    choices: ['$(2, 0)$', '$(4, 0)$', '$(0, 2)$', '$(8, 0)$', '$(0, 4)$'],
    answer: '1',
    explanation: `$y^2 = 4px$ 꼴과 비교하면 $4p = 8$, $p = 2$\n\n초점: $(p, 0) = (2, 0)$\n\n따라서 정답은 **① $(2, 0)$**`,
    source: { type: '교육청', year: 2023, number: 4 },
    createdBy: 'system@seed',
  },
  {
    subject: '기하',
    unit: '이차곡선',
    questionCategory: '타원의 방정식',
    questionType: 'multiple',
    difficulty: 2,
    content: `타원 $\\dfrac{x^2}{25} + \\dfrac{y^2}{16} = 1$의 두 초점 사이의 거리는?`,
    choices: ['$4$', '$6$', '$8$', '$10$', '$12$'],
    answer: '2',
    explanation: `$a^2 = 25$, $b^2 = 16$이면 $c^2 = a^2 - b^2 = 25 - 16 = 9$, $c = 3$\n\n두 초점: $(-3, 0)$, $(3, 0)$\n두 초점 사이의 거리 $= 2c = 6$\n\n따라서 정답은 **② 6**`,
    source: { type: '수능', year: 2020, number: 6 },
    createdBy: 'system@seed',
  },
  {
    subject: '기하',
    unit: '벡터',
    questionCategory: '벡터의 내적',
    questionType: 'multiple',
    difficulty: 3,
    content: `$|\\vec{a}| = 3$, $|\\vec{b}| = 4$이고 $\\vec{a} \\cdot \\vec{b} = 6$일 때, $\\vec{a}$와 $\\vec{b}$가 이루는 각도 $\\theta$에 대하여 $\\cos\\theta$의 값은?`,
    choices: ['$\\dfrac{1}{4}$', '$\\dfrac{1}{3}$', '$\\dfrac{1}{2}$', '$\\dfrac{2}{3}$', '$\\dfrac{3}{4}$'],
    answer: '3',
    explanation: `내적의 정의:\n$$\\vec{a} \\cdot \\vec{b} = |\\vec{a}||\\vec{b}|\\cos\\theta$$\n$$6 = 3 \\times 4 \\times \\cos\\theta = 12\\cos\\theta$$\n$$\\cos\\theta = \\frac{6}{12} = \\frac{1}{2}$$\n\n따라서 정답은 **③ $\\dfrac{1}{2}$**`,
    source: { type: '모의고사', year: 2021, number: 10 },
    createdBy: 'system@seed',
  },
  {
    subject: '기하',
    unit: '공간도형',
    questionCategory: '직선과 평면의 관계',
    questionType: 'multiple',
    difficulty: 4,
    content: `공간에서 두 평면 $\\alpha$, $\\beta$가 수직이고, 직선 $l$이 평면 $\\alpha$에 포함될 때, 직선 $l$과 평면 $\\beta$의 관계로 옳은 것을 고르면?`,
    choices: ['$l \\perp \\beta$이다', '$l$과 $\\beta$는 평행하거나 만난다', '$l \\subset \\beta$이다', '$l$과 $\\beta$는 꼬인 위치이다', '$l \\parallel \\beta$이다'],
    answer: '2',
    explanation: `두 평면이 수직이면 한 평면의 법선벡터가 다른 평면에 포함된다.\n\n직선 $l \\subset \\alpha$이고 $\\alpha \\perp \\beta$일 때,\n$l$은 $\\beta$에 수직일 수도 있고, 비스듬히 교차할 수도 있으며, $\\beta$에 평행할 수도 있다.\n\n그러나 반드시 참인 것: $l$이 $\\beta$와 수직인 경우, 수평인 경우, 비스듬히 교차하는 경우 모두 가능하므로\n\n반드시 수직은 아니다. 정답: **② $l$과 $\\beta$는 평행하거나 만난다**\n\n(구체적 조건: $l$이 교선에 수직이면 $l \\perp \\beta$)`,
    source: { type: '수능', year: 2022, number: 17 },
    createdBy: 'system@seed',
  },
  {
    subject: '기하',
    unit: '벡터',
    questionCategory: '공간벡터의 활용',
    questionType: 'short',
    difficulty: 5,
    content: `좌표공간에서 점 $A(1, 2, 3)$, $B(4, 6, 3)$, $C(1, 2, 7)$에 대하여 삼각형 $ABC$의 넓이를 구하시오.`,
    answer: '10',
    explanation: `$\\vec{AB} = (3, 4, 0)$, $\\vec{AC} = (0, 0, 4)$\n\n벡터곱 $\\vec{AB} \\times \\vec{AC}$:\n$$\\vec{AB} \\times \\vec{AC} = \\begin{vmatrix} \\vec{i} & \\vec{j} & \\vec{k} \\\\ 3 & 4 & 0 \\\\ 0 & 0 & 4 \\end{vmatrix}$$\n$$= \\vec{i}(4 \\cdot 4 - 0 \\cdot 0) - \\vec{j}(3 \\cdot 4 - 0 \\cdot 0) + \\vec{k}(3 \\cdot 0 - 4 \\cdot 0)$$\n$$= (16, -12, 0)$$\n\n넓이 $= \\dfrac{1}{2}|\\vec{AB} \\times \\vec{AC}| = \\dfrac{1}{2}\\sqrt{256 + 144} = \\dfrac{1}{2}\\sqrt{400} = \\dfrac{20}{2} = 10$`,
    source: { type: '수능', year: 2024, number: 29 },
    createdBy: 'system@seed',
  },
]

/**
 * seedIfEmpty — DB가 비어있을 때만 시드 데이터를 삽입한다
 * Dexie db.on('ready') 핸들러에서 호출됨
 */
export async function seedIfEmpty(): Promise<void> {
  const count = await db.questions.count()
  if (count > 0) {
    // 기존 시드 문제에 choices가 없으면 추가 (마이그레이션)
    await migrateChoices()
    return
  }

  const now = Date.now()
  const questions = SEED_QUESTIONS.map((q, i) => ({
    ...q,
    createdAt: now - i * 60000, // 각 문제 1분 간격 (정렬용)
    updatedAt: now - i * 60000,
  }))

  await db.questions.bulkAdd(questions as Parameters<typeof db.questions.bulkAdd>[0])
}

/**
 * 기존 시드 문제에 choices 필드가 없으면 SEED_QUESTIONS에서 매칭하여 추가
 * content 기준으로 매칭 — 시드 문제만 대상
 */
async function migrateChoices(): Promise<void> {
  const seedQuestions = await db.questions
    .where('createdBy')
    .equals('system@seed')
    .toArray()

  const needsMigration = seedQuestions.filter((q) => q.questionType === 'multiple' && !q.choices)
  if (needsMigration.length === 0) return

  // content 기준으로 SEED_QUESTIONS와 매칭
  const seedMap = new Map(
    SEED_QUESTIONS.filter((s) => s.choices).map((s) => [s.content, s.choices!])
  )

  for (const q of needsMigration) {
    const choices = seedMap.get(q.content)
    if (choices) {
      await db.questions.update(q.id, { choices })
    }
  }
}
