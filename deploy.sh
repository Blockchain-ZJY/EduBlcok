#!/bin/bash

# 🚀 AcademicLedger 快速部署脚本
# 使用方法：chmod +x deploy.sh && ./deploy.sh

echo "=========================================="
echo "  🎓 AcademicLedger 部署脚本"
echo "=========================================="
echo ""

# 配置
RPC_URL="https://testnet-passet-hub-eth-rpc.polkadot.io"
PRIVATE_KEY="f033cf49bb3398ce47ecdc31558b8b009629e2c89306db15b379cb6b78156f4c"

# 检查是否安装了 forge
if ! command -v forge &> /dev/null
then
    echo "❌ 错误: 未检测到 Foundry (forge)"
    echo "请先安装 Foundry: https://book.getfoundry.sh/getting-started/installation"
    exit 1
fi

echo "✅ 检测到 Foundry"
echo ""

# 编译合约
echo "📦 正在编译合约..."
forge build

if [ $? -ne 0 ]; then
    echo "❌ 编译失败"
    exit 1
fi

echo "✅ 编译成功"
echo ""

# 部署合约
echo "🚀 正在部署合约到 Polkadot Asset Hub Testnet..."
echo ""

forge script script/DeployAcademicLedger.sol:DeployAcademicLedger \
  --rpc-url $RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast \
  -vvvv

if [ $? -eq 0 ]; then
    echo ""
    echo "=========================================="
    echo "  ✅ 部署成功！"
    echo "=========================================="
    echo ""
    echo "📝 下一步操作："
    echo "1. 从上面的输出中复制合约地址"
    echo "2. 更新前端配置文件："
    echo "   academic-ledger-frontend/src/contracts/AcademicLedger.ts"
    echo "3. 重启前端: cd academic-ledger-frontend && npm run dev"
    echo ""
else
    echo ""
    echo "❌ 部署失败，请检查错误信息"
    exit 1
fi

