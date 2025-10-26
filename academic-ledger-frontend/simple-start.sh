#!/bin/bash

echo "🚀 简化启动前端项目"
echo "=================="

# 进入项目目录
cd /home/li/web3/EduBlcok/academic-ledger-frontend

# 检查环境
echo "检查 Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，正在安装..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

echo "检查 npm..."
if ! command -v npm &> /dev/null; then
    echo "❌ npm 未安装"
    exit 1
fi

# 安装依赖
echo "📦 安装依赖..."
npm install

# 启动项目
echo "🚀 启动项目..."
npm run dev -- --host 0.0.0.0 --port 3000
