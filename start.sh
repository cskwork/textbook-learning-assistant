#!/bin/bash
# 수학 기출 학습 도우미 — 개발 서버 실행
cd "$(dirname "$0")"

case "${1:-web}" in
  web)  pnpm web:dev ;;
  api)  pnpm api:dev ;;
  all)  pnpm web:dev & pnpm api:dev & wait ;;
  *)    echo "Usage: ./start.sh [web|api|all]" ;;
esac
