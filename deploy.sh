#!/bin/bash
# Vercel 프로덕션 배포 스크립트
cd "$(dirname "$0")/apps/web" && vercel --prod --yes
