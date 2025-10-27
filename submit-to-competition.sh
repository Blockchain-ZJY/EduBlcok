#!/bin/bash

# 🏆 比赛项目提交脚本
# 使用方法：bash submit-to-competition.sh

echo "=========================================="
echo "  🏆 比赛项目提交向导"
echo "=========================================="
echo ""

# 配置（根据实际比赛修改）
COMPETITION_REPO="比赛组织/比赛仓库"  # 例如：Polkadot-Blockchain-Academy/Final-Project
YOUR_GITHUB_USERNAME="lilinming"
PROJECT_NAME="EduBlock"
SUBMISSION_PATH="submissions/$PROJECT_NAME"  # 根据比赛要求修改

echo "📝 配置信息："
echo "   比赛仓库: $COMPETITION_REPO"
echo "   你的用户名: $YOUR_GITHUB_USERNAME"
echo "   项目名称: $PROJECT_NAME"
echo "   提交路径: $SUBMISSION_PATH"
echo ""

read -p "❓ 是否已经 Fork 了比赛仓库？(y/n): " forked

if [ "$forked" != "y" ]; then
    echo ""
    echo "请先完成以下步骤："
    echo "1. 访问: https://github.com/$COMPETITION_REPO"
    echo "2. 点击右上角的 'Fork' 按钮"
    echo "3. 等待 Fork 完成"
    echo ""
    echo "完成后重新运行此脚本"
    exit 0
fi

echo ""
echo "=========================================="
echo "  📥 克隆你的 Fork"
echo "=========================================="
echo ""

# 临时目录
TEMP_DIR="/tmp/competition-submission"
FORK_URL="https://github.com/$YOUR_GITHUB_USERNAME/${COMPETITION_REPO##*/}.git"

echo "克隆地址: $FORK_URL"
echo "目标目录: $TEMP_DIR"
echo ""

# 如果目录存在，先删除
if [ -d "$TEMP_DIR" ]; then
    echo "⚠️  目录已存在，删除旧的..."
    rm -rf "$TEMP_DIR"
fi

# 克隆
git clone "$FORK_URL" "$TEMP_DIR"

if [ $? -ne 0 ]; then
    echo "❌ 克隆失败，请检查仓库地址"
    exit 1
fi

echo ""
echo "=========================================="
echo "  📦 复制项目文件"
echo "=========================================="
echo ""

cd "$TEMP_DIR"

# 创建提交目录
mkdir -p "$SUBMISSION_PATH"

# 复制项目文件（排除不必要的文件）
echo "从 /home/li/web3/EduBlcok 复制文件..."

rsync -av --progress \
  --exclude 'node_modules' \
  --exclude '.git' \
  --exclude 'cache' \
  --exclude 'out' \
  --exclude 'broadcast' \
  --exclude '.env' \
  --exclude 'academic-ledger-frontend/node_modules' \
  --exclude 'academic-ledger-frontend/dist' \
  --exclude 'academic-ledger-frontend/.env' \
  /home/li/web3/EduBlcok/* \
  "$SUBMISSION_PATH/"

echo ""
echo "=========================================="
echo "  📝 创建 README"
echo "=========================================="
echo ""

# 创建项目 README
cat > "$SUBMISSION_PATH/README.md" << 'EOF'
# EduBlock - 区块链学历证书管理系统

## 项目简介

EduBlock 是一个基于区块链的去中心化学历证书管理系统，实现了证书的颁发、存储、查询和验证。

## 技术栈

- **智能合约**: Solidity 0.8.19
- **开发框架**: Foundry
- **前端**: React + TypeScript + Vite
- **存储**: IPFS (Pinata)
- **区块链**: Polkadot Asset Hub Testnet

## 核心功能

1. **院校管理**: 管理员可以注册院校
2. **学生注册**: 学生可以自主注册
3. **证书颁发**: 院校可以为学生颁发证书（支持上传证书图片到 IPFS）
4. **证书查询**: 支持按学生、院校、证书ID查询
5. **证书展示**: 直接在界面显示 IPFS 上的证书图片

## 项目结构

```
EduBlock/
├── src/                      # 智能合约源码
│   └── AcademicLedger.sol
├── test/                     # 合约测试
│   └── AcademicLedger.t.sol
├── script/                   # 部署脚本
│   └── DeployAcademicLedger.sol
├── academic-ledger-frontend/ # 前端应用
│   ├── src/
│   │   ├── components/       # React 组件
│   │   ├── contracts/        # 合约接口
│   │   └── utils/            # 工具函数
│   └── public/
└── foundry.toml              # Foundry 配置
```

## 快速开始

### 智能合约

```bash
# 安装依赖
forge install

# 编译合约
forge build

# 运行测试
forge test -vv

# 部署
forge script script/DeployAcademicLedger.sol --rpc-url <RPC_URL> --broadcast
```

### 前端应用

```bash
cd academic-ledger-frontend

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，添加 VITE_PINATA_JWT

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 部署

- **智能合约**: Polkadot Asset Hub Testnet
- **前端**: Vercel

## 特色功能

- ✅ 完整的角色权限管理（管理员、院校、学生）
- ✅ IPFS 集成，去中心化存储证书文件
- ✅ 证书图片直接在界面预览
- ✅ 支持多证书管理（本科、硕士、博士等）
- ✅ 现代化 UI/UX 设计
- ✅ 完整的测试覆盖

## 作者

- GitHub: [@lilinming](https://github.com/lilinming)
- 项目仓库: https://github.com/lilinming/edublock

## 许可证

MIT
EOF

echo "✅ README 已创建"

echo ""
echo "=========================================="
echo "  💾 提交更改"
echo "=========================================="
echo ""

# Git 配置（如果需要）
git config user.name "$YOUR_GITHUB_USERNAME"
git config user.email "$YOUR_GITHUB_USERNAME@users.noreply.github.com"

# 添加文件
git add .

# 提交
git commit -m "feat: Add EduBlock - Blockchain-based Academic Certificate System

Project: EduBlock
Team/Author: lilinming

Features:
- Institution and student registration
- Certificate issuance with IPFS storage
- Certificate query and verification
- Modern React frontend
- Full Foundry test coverage

Tech Stack:
- Solidity 0.8.19
- Foundry
- React + TypeScript
- IPFS (Pinata)
- Polkadot Asset Hub Testnet"

echo ""
echo "=========================================="
echo "  🚀 推送到你的 Fork"
echo "=========================================="
echo ""

git push origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "=========================================="
    echo "  ✅ 推送成功！"
    echo "=========================================="
    echo ""
    echo "📌 下一步："
    echo ""
    echo "1. 访问你的 Fork："
    echo "   https://github.com/$YOUR_GITHUB_USERNAME/${COMPETITION_REPO##*/}"
    echo ""
    echo "2. 点击 'Contribute' 或 'Pull Request' 按钮"
    echo ""
    echo "3. 点击 'Open Pull Request'"
    echo ""
    echo "4. 填写 PR 信息："
    echo "   标题: [参赛] EduBlock - 区块链学历证书管理系统"
    echo "   描述: (已在 README 中详细说明)"
    echo ""
    echo "5. 点击 'Create Pull Request' 完成提交"
    echo ""
    echo "🎉 祝你比赛顺利！"
    echo ""
else
    echo ""
    echo "❌ 推送失败，请检查错误信息"
    echo ""
fi

# 清理（可选）
echo ""
read -p "❓ 是否删除临时目录 $TEMP_DIR？(y/n): " cleanup
if [ "$cleanup" == "y" ]; then
    cd /home/li/web3/EduBlcok
    rm -rf "$TEMP_DIR"
    echo "✅ 临时目录已删除"
fi

