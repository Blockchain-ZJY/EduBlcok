#!/bin/bash

echo "🔧 修复前端项目依赖问题"
echo "========================"

# 清理缓存
echo "🧹 清理缓存..."
rm -rf node_modules
rm -rf package-lock.json
rm -rf .vite

# 重新安装
echo "📦 重新安装依赖..."
npm install

# 检查安装结果
if [ $? -eq 0 ]; then
    echo "✅ 依赖安装成功"
    echo "🚀 启动项目..."
    npm run dev
else
    echo "❌ 依赖安装失败"
    echo "尝试使用 yarn..."
    npm install -g yarn
    yarn install
    yarn dev
fi
