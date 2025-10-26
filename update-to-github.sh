#!/bin/bash

echo "🚀 准备将代码更新到GitHub"
echo "========================"
echo ""

# 进入项目目录
cd /home/li/web3/EduBlcok

# 检查是否在正确的目录
if [ ! -f "src/AcademicLedger.sol" ]; then
    echo "❌ 错误: 不在正确的项目目录中"
    exit 1
fi

# 显示当前状态
echo "📋 当前Git状态:"
git status

echo ""
echo "📝 准备提交以下文件:"
git diff --name-only
echo ""

# 询问是否继续
read -p "是否继续提交? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    echo "取消提交"
    exit 1
fi

# 添加所有文件
echo "➕ 添加文件到暂存区..."
git add .

# 提交代码
echo "💾 提交代码..."
git commit -m "更新：修复证书功能和权限检查

- 修复证书ID显示为0的问题
- 优化证书状态显示逻辑  
- 添加管理员权限检查
- 修复ENS错误问题
- 添加动态端口功能
- 改进错误处理和用户提示
- 添加调试日志"

echo ""
echo "📤 推送到GitHub..."
git push origin main

echo ""
echo "✅ 代码已成功更新到GitHub!"
