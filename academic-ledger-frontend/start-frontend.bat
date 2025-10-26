@echo off
chcp 65001 >nul

echo 🚀 启动 Academic Ledger Frontend 项目
echo ==================================

REM 检查 Node.js 是否安装
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 错误: 未找到 Node.js，请先安装 Node.js
    pause
    exit /b 1
)

REM 检查 npm 是否安装
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 错误: 未找到 npm，请先安装 npm
    pause
    exit /b 1
)

echo ✅ Node.js 版本: 
node --version
echo ✅ npm 版本: 
npm --version

REM 安装依赖
echo 📦 安装依赖...
call npm install

if %errorlevel% neq 0 (
    echo ❌ 依赖安装失败
    pause
    exit /b 1
)

echo ✅ 依赖安装完成

REM 启动开发服务器
echo 🌐 启动开发服务器...
echo 🔍 正在检测可用端口...
echo 📝 如果3002端口被占用，将自动使用下一个可用端口
echo 🌐 将使用Chrome浏览器打开应用
echo 按 Ctrl+C 停止服务器
echo.

call npm run dev

pause