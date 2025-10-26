#!/bin/bash

echo "🚀 启动 Academic Ledger Frontend 项目"
echo "=================================="

# 检查 Node.js 是否安装
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未找到 Node.js，请先安装 Node.js"
    exit 1
fi

# 检查 npm 是否安装
if ! command -v npm &> /dev/null; then
    echo "❌ 错误: 未找到 npm，请先安装 npm"
    exit 1
fi

echo "✅ Node.js 版本: $(node --version)"
echo "✅ npm 版本: $(npm --version)"

# 安装依赖
echo "📦 安装依赖..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ 依赖安装失败"
    exit 1
fi

echo "✅ 依赖安装完成"

# 启动开发服务器
echo "🌐 启动开发服务器..."
echo "🔍 正在检测可用端口..."
echo "📝 如果3002端口被占用，将自动使用下一个可用端口"
echo "🌐 将使用Chrome浏览器打开应用"
echo "按 Ctrl+C 停止服务器"
echo ""

npm run dev
