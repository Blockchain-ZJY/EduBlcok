# 🚀 合约部署指南

## 📋 两种部署方式

### 方式1：使用 `forge create`（你当前的方式）
```bash
forge create --rpc-url https://testnet-passet-hub-eth-rpc.polkadot.io \
  --private-key f033cf49bb3398ce47ecdc31558b8b009629e2c89306db15b379cb6b78156f4c \
  src/AcademicLedger.sol:AcademicLedger \
  --broadcast
```

**优点**：
- ✅ 简单直接
- ✅ 适合快速部署单个合约

**缺点**：
- ❌ 不能自定义部署逻辑
- ❌ 不能自动输出提示信息
- ❌ 私钥暴露在命令行历史中

---

### 方式2：使用 `forge script`（推荐 ⭐）
```bash
forge script script/DeployAcademicLedger.sol:DeployAcademicLedger \
  --rpc-url https://testnet-passet-hub-eth-rpc.polkadot.io \
  --private-key f033cf49bb3398ce47ecdc31558b8b009629e2c89306db15b379cb6b78156f4c \
  --broadcast \
  -vvvv
```

**优点**：
- ✅ 可以自定义部署逻辑
- ✅ 自动显示部署地址和提示
- ✅ 可以在脚本中做额外配置
- ✅ 更好的日志输出
- ✅ 支持部署多个合约

---

## 🔒 安全部署（使用环境变量）

### 步骤1：创建 `.env` 文件

在项目根目录创建 `.env` 文件：

```bash
# .env
TESTNET_RPC_URL=https://testnet-passet-hub-eth-rpc.polkadot.io
PRIVATE_KEY=f033cf49bb3398ce47ecdc31558b8b009629e2c89306db15b379cb6b78156f4c
```

⚠️ **重要**：确保 `.env` 已经在 `.gitignore` 中，避免泄露私钥！

### 步骤2：部署合约

```bash
# 方法A：使用 source 加载环境变量
source .env
forge script script/DeployAcademicLedger.sol:DeployAcademicLedger \
  --rpc-url $TESTNET_RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast \
  -vvvv
```

或者

```bash
# 方法B：使用 forge 自动加载 .env（推荐）
forge script script/DeployAcademicLedger.sol:DeployAcademicLedger \
  --rpc-url https://testnet-passet-hub-eth-rpc.polkadot.io \
  --private-key $PRIVATE_KEY \
  --broadcast \
  -vvvv
```

---

## 📝 部署后的输出示例

成功部署后，你会看到：

```
========================================
Deploying AcademicLedger Contract...
========================================

========================================
     Deployment Successful!
========================================
Contract Address: 0x1234567890abcdef...
Network: Polkadot Asset Hub Testnet
========================================

[NEXT STEP]
Update CONTRACT_ADDRESS in:
academic-ledger-frontend/src/contracts/AcademicLedger.ts

New address: 0x1234567890abcdef...
========================================
```

---

## 🔧 部署后配置前端

### 步骤1：复制合约地址

从上面的输出中复制 `Contract Address`

### 步骤2：更新前端配置

打开 `academic-ledger-frontend/src/contracts/AcademicLedger.ts`，找到：

```typescript
// 合约地址（部署后需要更新）
export const CONTRACT_ADDRESS = '0x旧地址...';
```

替换为新地址：

```typescript
// 合约地址（部署后需要更新）
export const CONTRACT_ADDRESS = '0x新地址...';
```

### 步骤3：重启前端

```bash
cd academic-ledger-frontend
npm run dev
```

---

## 🎯 快速部署命令（复制即用）

### 使用脚本部署（推荐）

```bash
# 一键部署
forge script script/DeployAcademicLedger.sol:DeployAcademicLedger \
  --rpc-url https://testnet-passet-hub-eth-rpc.polkadot.io \
  --private-key f033cf49bb3398ce47ecdc31558b8b009629e2c89306db15b379cb6b78156f4c \
  --broadcast \
  -vvvv
```

### 参数说明

| 参数 | 说明 |
|------|------|
| `--rpc-url` | 网络 RPC 地址 |
| `--private-key` | 部署账户私钥 |
| `--broadcast` | 实际广播交易（不加此参数是模拟） |
| `-vvvv` | 详细日志输出（4个v表示最详细） |

---

## 🔍 常见问题

### Q1: 如何模拟部署（不实际部署）？

去掉 `--broadcast` 参数：

```bash
forge script script/DeployAcademicLedger.sol:DeployAcademicLedger \
  --rpc-url https://testnet-passet-hub-eth-rpc.polkadot.io \
  --private-key f033cf49bb3398ce47ecdc31558b8b009629e2c89306db15b379cb6b78156f4c \
  -vvvv
```

### Q2: 如何查看 Gas 费用？

在输出日志中查找：

```
Gas used: 123456
Transaction cost: 0.001234 ETH
```

### Q3: 部署失败怎么办？

检查：
1. ✅ 账户是否有足够的余额
2. ✅ RPC URL 是否正确
3. ✅ 私钥是否正确
4. ✅ 合约代码是否编译通过（`forge build`）

---

## 📊 对比总结

| 特性 | `forge create` | `forge script` |
|------|----------------|----------------|
| 使用难度 | 简单 | 中等 |
| 自定义能力 | 低 | 高 ⭐ |
| 日志输出 | 基础 | 详细 ⭐ |
| 部署多合约 | ❌ | ✅ |
| 自动提示 | ❌ | ✅ |
| **推荐度** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

---

## 🎓 总结

- 使用 `forge script` 部署更加**专业**和**灵活**
- 将私钥保存到 `.env` 文件更加**安全**
- 部署后记得**更新前端配置**

现在你可以使用脚本愉快地部署合约了！ 🚀

