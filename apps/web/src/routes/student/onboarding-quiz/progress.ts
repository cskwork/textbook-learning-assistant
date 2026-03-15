export function getDiagnosticProgress(currentIndex: number, totalQuestions: number): number {
  if (totalQuestions <= 0) return 0

  const normalizedIndex = Math.max(currentIndex, 0)
  return Math.min(100, ((normalizedIndex + 1) / totalQuestions) * 100)
}
