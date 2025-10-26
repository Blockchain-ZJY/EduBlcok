#!/bin/bash

echo "🔍 诊断前端项目启动问题"
echo "=========================="

# 检查当前目录
echo "📁 当前目录: $(pwd)"
echo "📁 目录内容:"
ls -la

echo ""
echo "🔧 检查 Node.js 环境:"
echo "Node.js 版本: $(node --version 2>/dev/null || echo '未安装')"
echo "npm 版本: $(npm --version 2>/dev/null || echo '未安装')"

echo ""
echo "📦 检查依赖:"
if [ -d "node_modules" ]; then
    echo "✅ node_modules 目录存在"
    echo "依赖数量: $(ls node_modules | wc -l)"
else
    echo "❌ node_modules 目录不存在"
fi

echo ""
echo "🔍 检查关键文件:"
for file in package.json vite.config.ts src/main.tsx; do
    if [ -f "$file" ]; then
        echo "✅ $file 存在"
    else
        echo "❌ $file 不存在"
    fi
done

echo ""
echo "🚀 尝试启动项目:"
echo "执行: npm run dev"
npm run dev
