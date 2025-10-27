#!/bin/bash

# 🔧 修复并部署脚本
# 使用方法：在 WSL 中运行 bash fix-and-deploy.sh

echo "=========================================="
echo "  🔧 修复 Vercel 构建错误并部署"
echo "=========================================="
echo ""

# 切换到项目目录
cd /home/li/web3/EduBlcok

# 检查 Git 状态
echo "📊 检查 Git 状态..."
git status

echo ""
echo "=========================================="
echo "  📝 提交修复"
echo "=========================================="
echo ""

# 添加所有修改
git add .

# 提交
git commit -m "Fix: Vercel TypeScript build errors - 修复构建错误

- 删除 App.tsx 中未使用的 React 导入
- 修复 ConfirmModal.tsx 中未使用的 match 变量
- 删除 ContractInterface.tsx 中的废弃函数
- 删除 portUtils.ts (浏览器环境不支持 Node.js net 模块)
"

echo ""
echo "=========================================="
echo "  🚀 推送到 GitHub"
echo "=========================================="
echo ""

# 推送到 GitHub
git push origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "=========================================="
    echo "  ✅ 推送成功！"
    echo "=========================================="
    echo ""
    echo "📌 Vercel 会自动检测并重新部署"
    echo "⏳ 预计 2-3 分钟后完成"
    echo ""
    echo "🔗 访问 Vercel Dashboard 查看进度："
    echo "   https://vercel.com/dashboard"
    echo ""
else
    echo ""
    echo "❌ 推送失败，请检查错误信息"
    echo ""
fi

