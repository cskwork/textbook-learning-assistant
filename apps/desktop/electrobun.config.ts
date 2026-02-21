/**
 * Electrobun 데스크톱 앱 설정
 * v1.13.1 ElectrobunConfig 형식
 */
import type { ElectrobunConfig } from "electrobun"

export default {
  app: {
    name: "수학기출학습도우미",
    identifier: "com.textbook-learning-assistant.desktop",
    version: "1.0.0",
    description: "수학 기출문제 학습 도우미 데스크톱 앱",
  },
  build: {
    bun: {
      entrypoint: "src/bun/index.ts",
    },
    mac: {
      bundleCEF: false,
    },
  },
  runtime: {
    exitOnLastWindowClosed: true,
  },
} satisfies ElectrobunConfig
