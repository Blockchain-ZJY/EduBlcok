@echo off
echo 🔍 诊断前端项目问题
echo ==================

cd /d "%~dp0"

echo 📁 当前目录: %CD%
echo.

echo 🔧 检查环境:
echo Node.js 版本:
node --version
echo.

echo npm 版本:
npm --version
echo.

echo 📦 检查依赖:
if exist node_modules (
    echo ✅ node_modules 存在
    echo 依赖数量: 
    dir node_modules /b | find /c /v ""
) else (
    echo ❌ node_modules 不存在
)
echo.

echo 🔍 检查关键文件:
if exist package.json echo ✅ package.json 存在
if exist vite.config.ts echo ✅ vite.config.ts 存在
if exist src\main.tsx echo ✅ src\main.tsx 存在
if exist index.html echo ✅ index.html 存在
echo.

echo 🚀 尝试启动项目:
echo 执行 npm run dev...
echo.

call npm run dev
