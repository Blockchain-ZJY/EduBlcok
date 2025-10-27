#!/bin/bash

# 🏆 Polkadot Hackathon 2025 提交脚本
# 项目：EduBlock - 区块链学历证书管理系统

echo "=========================================="
echo "  🏆 Polkadot Hackathon 2025 提交"
echo "=========================================="
echo ""

# 配置
HACKATHON_REPO="OneBlockPlus/polkadot-hackathon-2025"
YOUR_GITHUB_USERNAME="Blockchain-ZJY"  # 或 "lilinming"
PROJECT_NUMBER="08"  # 根据已有项目调整编号
PROJECT_NAME="edublock"
PROJECT_DIR="${PROJECT_NUMBER}-${PROJECT_NAME}"

echo "📝 项目信息："
echo "   比赛仓库: $HACKATHON_REPO"
echo "   你的用户名: $YOUR_GITHUB_USERNAME"
echo "   项目目录: $PROJECT_DIR"
echo ""

read -p "❓ 是否已经 Fork 了比赛仓库？(y/n): " forked

if [ "$forked" != "y" ]; then
    echo ""
    echo "请先完成以下步骤："
    echo "1. 访问: https://github.com/$HACKATHON_REPO"
    echo "2. 点击右上角的 'Fork' 按钮"
    echo "3. 等待 Fork 完成"
    echo ""
    echo "完成后重新运行此脚本"
    exit 0
fi

echo ""
echo "=========================================="
echo "  📥 Clone 比赛仓库"
echo "=========================================="
echo ""

TEMP_DIR="/tmp/hackathon-submission"
FORK_URL="https://github.com/$YOUR_GITHUB_USERNAME/polkadot-hackathon-2025.git"

# 删除旧的临时目录
if [ -d "$TEMP_DIR" ]; then
    rm -rf "$TEMP_DIR"
fi

# Clone fork
git clone "$FORK_URL" "$TEMP_DIR"

if [ $? -ne 0 ]; then
    echo "❌ Clone 失败"
    exit 1
fi

cd "$TEMP_DIR"

echo ""
echo "=========================================="
echo "  📦 创建项目目录"
echo "=========================================="
echo ""

# 复制模板
if [ -d "00-proj-template" ]; then
    cp -r "00-proj-template" "$PROJECT_DIR"
    echo "✅ 已复制模板到 $PROJECT_DIR"
else
    mkdir -p "$PROJECT_DIR"
    echo "⚠️  模板不存在，创建空目录"
fi

echo ""
echo "=========================================="
echo "  📋 复制项目文件"
echo "=========================================="
echo ""

# 复制项目文件（排除不必要的文件）
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
  --exclude 'submit-to-*.sh' \
  --exclude 'DISABLE_CI.md' \
  /home/li/web3/EduBlcok/ \
  "$PROJECT_DIR/"

echo ""
echo "=========================================="
echo "  📝 创建项目说明文档"
echo "=========================================="
echo ""

# 创建项目说明
cat > "$PROJECT_DIR/docs/README.md" << 'EOF'
# EduBlock - 区块链学历证书管理系统

## 项目信息

- **项目名称**: EduBlock
- **赛道**: 赛道一 - Polkadot 多虚拟机应用开发挑战
- **团队**: Blockchain-ZJY
- **技术栈**: Solidity (REVM) + Foundry + React + IPFS

## 项目简介

EduBlock 是一个基于 Polkadot Asset Hub (REVM) 的去中心化学历证书管理系统，实现了证书的安全颁发、永久存储和快速验证。

## 核心功能

- 🏫 **院校管理**: 基于 OpenZeppelin AccessControl 的权限管理
- 📜 **证书颁发**: 院校可为学生颁发数字证书，支持 IPFS 存储
- 🔍 **证书查询**: 支持多维度查询（学生、院校）
- 🖼️ **证书预览**: 前端直接展示 IPFS 证书图片
- 👤 **学生注册**: 学生自主注册和信息管理

## 技术实现

### 智能合约
- **语言**: Solidity 0.8.19
- **框架**: Foundry
- **部署网络**: Polkadot Asset Hub Testnet
- **合约地址**: `待填写实际部署地址`

### 前端应用
- **框架**: React 18 + TypeScript + Vite
- **Web3**: Ethers.js v5
- **存储**: IPFS (Pinata)
- **部署**: Vercel - https://edublock-web-4vej.vercel.app/

## Polkadot 生态集成

- ✅ 使用 REVM 执行环境，完全兼容 EVM 工具链
- ✅ 部署在 Polkadot Asset Hub Testnet
- ✅ 与 Foundry、Hardhat 等工具无缝集成
- ✅ 展示 REVM 在教育证书场景的应用潜力

## 项目亮点

1. **完整的 DApp**: 从智能合约到前端界面的全栈实现
2. **IPFS 集成**: 去中心化文件存储，证书永久保存
3. **现代化 UI**: Apple 风格设计，优秀的用户体验
4. **多证书管理**: 支持学生拥有多个学历证书
5. **测试覆盖**: 完整的 Foundry 测试用例

## 快速开始

### 智能合约

```bash
# 安装依赖
forge install

# 编译
forge build

# 测试
forge test -vv

# 部署
forge script script/DeployAcademicLedger.sol \
  --rpc-url https://testnet-passet-hub-eth-rpc.polkadot.io \
  --broadcast
```

### 前端应用

```bash
cd academic-ledger-frontend

# 安装依赖
npm install

# 配置 .env
echo "VITE_PINATA_JWT=your_jwt_token" > .env

# 启动
npm run dev
```

## 测试脚本

详见 `test/AcademicLedger.t.sol` 和 `academic-ledger-frontend/测试交互脚本.md`

## 演示

- **前端地址**: https://edublock-web-4vej.vercel.app/
- **演示视频**: (待补充)
- **PPT 演示**: (待补充)

## 项目结构

```
EduBlock/
├── src/                      # 智能合约
├── test/                     # 测试用例
├── script/                   # 部署脚本
├── academic-ledger-frontend/ # 前端应用
└── docs/                     # 文档
```

## 开发进度

- ✅ 智能合约开发完成
- ✅ Foundry 测试覆盖
- ✅ 前端界面开发完成
- ✅ IPFS 集成
- ✅ 部署到测试网
- ✅ 前端部署到 Vercel
- ⏳ 演示视频制作中
- ⏳ PPT 准备中

## 许可证

MIT
EOF

echo "✅ 项目说明已创建"

echo ""
echo "=========================================="
echo "  📄 创建测试交互脚本"
echo "=========================================="
echo ""

# 创建测试脚本文档
cat > "$PROJECT_DIR/docs/测试交互脚本.md" << 'EOF'
# EduBlock 测试交互脚本

## 准备工作

### 1. 添加网络到 MetaMask

- **网络名称**: Polkadot Asset Hub Testnet
- **RPC URL**: `https://testnet-passet-hub-eth-rpc.polkadot.io`
- **链 ID**: `0x190f1b46`
- **货币符号**: `PAS`

### 2. 获取测试币

[添加测试币获取方式]

### 3. 准备测试账户

- **账户1**: 管理员 + 院校账户
- **账户2**: 学生账户

## 测试流程

### 场景1: 管理员注册院校

1. 使用账户1连接钱包
2. 确认显示"管理员"角色
3. 点击"注册院校"
4. 填写：
   - 院校地址：`账户1的地址`
   - 院校名称：`测试大学`
   - 元数据URI：`留空`
5. 确认交易
6. 等待交易确认
7. 验证：页面显示"院校"角色

### 场景2: 院校注册学生

1. 保持账户1连接（院校账户）
2. 点击"注册学生"
3. 填写：
   - 学生地址：`账户2的地址`
   - 学生姓名：`测试学生`
   - 学号：`2024001`
   - 元数据URI：`留空`
4. 确认交易
5. 切换到账户2验证显示"学生"角色

### 场景3: 颁发证书

1. 使用账户1（院校）
2. 点击"颁发证书"
3. 填写：
   - 学生地址：`账户2的地址`
   - 专业：`计算机科学`
   - 学位：`学士`
   - 有效期：`永久有效`
   - 描述：`优秀毕业生`
4. 上传证书图片（JPG/PNG，<10MB）
5. 确认交易
6. 等待 IPFS 上传和链上确认
7. 验证：显示成功消息和证书ID

### 场景4: 学生查看证书

1. 切换到账户2（学生）
2. 点击"我的证书"
3. 验证：
   - 显示证书数量
   - 显示证书详细信息
   - 显示证书图片
   - 可以"在新窗口打开"图片

### 场景5: 查询证书

1. 任意账户连接钱包
2. 点击"查询学生证书"
3. 输入账户2的地址
4. 验证：显示该学生的所有证书和图片

## 合约函数调用测试

### 使用 Foundry Cast

```bash
# 设置环境变量
export RPC_URL="https://testnet-passet-hub-eth-rpc.polkadot.io"
export CONTRACT_ADDRESS="0x合约地址"
export PRIVATE_KEY="你的私钥"

# 1. 检查管理员角色
cast call $CONTRACT_ADDRESS \
  "hasRole(bytes32,address)" \
  0x0000000000000000000000000000000000000000000000000000000000000000 \
  你的地址 \
  --rpc-url $RPC_URL

# 2. 注册院校
cast send $CONTRACT_ADDRESS \
  "registerInstitution(address,string,string)" \
  院校地址 \
  "测试大学" \
  "" \
  --private-key $PRIVATE_KEY \
  --rpc-url $RPC_URL

# 3. 注册学生
cast send $CONTRACT_ADDRESS \
  "registerStudent(address,string,string,string)" \
  学生地址 \
  "测试学生" \
  "2024001" \
  "" \
  --private-key $PRIVATE_KEY \
  --rpc-url $RPC_URL

# 4. 颁发证书
cast send $CONTRACT_ADDRESS \
  "issueCertificate(address,string,string,uint64,string,bytes32)" \
  学生地址 \
  "计算机科学" \
  "学士" \
  0 \
  "ipfs://QmXXX..." \
  0x0000000000000000000000000000000000000000000000000000000000000001 \
  --private-key $PRIVATE_KEY \
  --rpc-url $RPC_URL

# 5. 查询证书
cast call $CONTRACT_ADDRESS \
  "getCertificate(uint256)" \
  1 \
  --rpc-url $RPC_URL

# 6. 查询学生证书列表
cast call $CONTRACT_ADDRESS \
  "certificatesOf(address)" \
  学生地址 \
  --rpc-url $RPC_URL
```

## 预期结果

- ✅ 所有交易成功确认
- ✅ 角色正确显示
- ✅ 证书成功颁发
- ✅ 图片成功上传到 IPFS
- ✅ 证书信息完整显示
- ✅ 图片可以预览和打开

## 注意事项

1. 确保有足够的测试币（建议每个账户 >0.1 PAS）
2. IPFS 上传需要几秒钟，请耐心等待
3. 交易确认后刷新页面查看最新状态
4. 如遇问题，查看浏览器控制台日志
EOF

echo "✅ 测试脚本已创建"

echo ""
echo "=========================================="
echo "  📝 Git 提交"
echo "=========================================="
echo ""

# Git 配置
git config user.name "$YOUR_GITHUB_USERNAME"
git config user.email "$YOUR_GITHUB_USERNAME@users.noreply.github.com"

# 添加文件
git add "$PROJECT_DIR"

# 提交
git commit -m "feat: Add EduBlock - Blockchain Academic Certificate System

Project: EduBlock (赛道一)
Team: Blockchain-ZJY

EduBlock 是基于 Polkadot Asset Hub (REVM) 的去中心化学历证书管理系统

核心功能:
- 院校和学生管理（基于 OpenZeppelin AccessControl）
- 证书颁发和 IPFS 存储
- 多维度证书查询
- 现代化前端界面

技术栈:
- Solidity 0.8.19 (REVM)
- Foundry
- React + TypeScript
- IPFS (Pinata)

部署信息:
- 测试网: Polkadot Asset Hub Testnet
- 前端: https://edublock-web-4vej.vercel.app/

Polkadot Hackathon 2025 - Track 1"

echo ""
echo "=========================================="
echo "  🚀 推送到 GitHub"
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
    echo "   https://github.com/$YOUR_GITHUB_USERNAME/polkadot-hackathon-2025"
    echo ""
    echo "2. 点击 'Contribute' → 'Open Pull Request'"
    echo ""
    echo "3. 填写 PR 信息："
    echo "   标题: [赛道一] EduBlock - 区块链学历证书系统"
    echo "   描述: 详见提交的项目文档"
    echo ""
    echo "4. 确认 PR 目标："
    echo "   From: $YOUR_GITHUB_USERNAME/polkadot-hackathon-2025 (main)"
    echo "   To: OneBlockPlus/polkadot-hackathon-2025 (main)"
    echo ""
    echo "5. 提交 PR"
    echo ""
    echo "📋 后续任务（截止时间前）："
    echo "   - 更新项目说明中的实际合约地址"
    echo "   - 测试所有合约函数"
    echo "   - 准备演示视频（可在 Demo Day 前完成）"
    echo "   - 准备 PPT（可在 Demo Day 前完成）"
    echo ""
    echo "🎉 Good Luck！"
    echo ""
else
    echo "❌ 推送失败"
    exit 1
fi

