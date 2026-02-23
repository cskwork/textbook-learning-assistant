@echo off
REM Vercel 프로덕션 배포 스크립트
cd /d "%~dp0apps\web" && vercel --prod --yes
