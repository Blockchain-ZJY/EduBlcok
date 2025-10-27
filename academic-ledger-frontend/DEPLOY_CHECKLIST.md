# ✅ Vercel 部署前检查清单

在部署到 Vercel 之前，确保完成以下步骤：

---

## 📋 部署前准备

### 1. 代码检查

- [ ] 所有功能在本地测试通过
- [ ] 没有 TypeScript 错误
- [ ] 没有 ESLint 警告
- [ ] 合约地址已更新到正确的地址

```bash
# 检查 TypeScript 错误
npm run build

# 检查 ESLint
npm run lint
```

### 2. 合约配置检查

- [ ] `src/contracts/AcademicLedger.ts` 中的 `CONTRACT_ADDRESS` 已更新
- [ ] 网络配置正确（Polkadot Asset Hub Testnet）
- [ ] ABI 与最新部署的合约一致

打开 `src/contracts/AcademicLedger.ts`：

```typescript
// ✅ 确认这个地址是最新部署的合约地址
export const CONTRACT_ADDRESS = '0x...';

// ✅ 确认网络配置正确
export const NETWORK_CONFIG = {
  chainId: '0x...',
  chainName: 'Polkadot Asset Hub Testnet',
  rpcUrls: ['https://testnet-passet-hub-eth-rpc.polkadot.io'],
  // ...
};
```

### 3. IPFS 配置检查

- [ ] Pinata API Key (JWT) 已准备好
- [ ] 在本地测试了文件上传
- [ ] 图片预览功能正常

检查本地 `.env`：
```bash
cat .env
# 应该看到：
# VITE_PINATA_JWT=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. 构建测试

- [ ] 本地构建成功

```bash
cd academic-ledger-frontend
npm run build
```

期望输出：
```
✓ built in 3.45s
dist/index.html                   0.46 kB
dist/assets/index-abc123.js      245.32 kB
...
```

### 5. Git 检查

- [ ] 所有改动已提交
- [ ] 代码已推送到 GitHub

```bash
git status
# 应该是干净的工作区

git push origin main
# 确保推送成功
```

---

## 🚀 Vercel 部署步骤

### 方式1：通过 GitHub（推荐）

1. [ ] 访问 https://vercel.com
2. [ ] 使用 GitHub 账号登录
3. [ ] 点击 "Add New..." → "Project"
4. [ ] 选择你的仓库
5. [ ] 配置项目：
   - Root Directory: `academic-ledger-frontend`
   - Framework: `Vite` (自动检测)
   - Build Command: `npm run build`
   - Output Directory: `dist`
6. [ ] 添加环境变量：
   - `VITE_PINATA_JWT` = 你的 Pinata JWT
7. [ ] 点击 "Deploy"
8. [ ] 等待部署完成

### 方式2：使用 CLI

```bash
# 1. 安装 CLI
npm install -g vercel

# 2. 登录
vercel login

# 3. 进入目录
cd academic-ledger-frontend

# 4. 首次部署
vercel

# 5. 添加环境变量
vercel env add VITE_PINATA_JWT

# 6. 生产部署
vercel --prod
```

---

## 🔍 部署后验证

部署成功后，测试以下功能：

### 基础功能
- [ ] 网站可以访问
- [ ] 页面正常加载
- [ ] 样式显示正常
- [ ] 没有控制台错误

### Web3 功能
- [ ] 可以连接 MetaMask
- [ ] 显示正确的网络提示
- [ ] 可以切换到 Polkadot Asset Hub Testnet

### 管理员功能
- [ ] 可以注册院校
- [ ] 可以注册学生

### 院校功能
- [ ] 可以颁发证书
- [ ] 可以上传证书图片到 IPFS
- [ ] 可以查看已颁发的证书列表

### 学生功能
- [ ] 可以查看自己的证书
- [ ] 证书图片正确显示
- [ ] 可以点击"在新窗口打开"查看完整图片

### 查询功能
- [ ] 可以查询学生证书
- [ ] 可以查询院校证书
- [ ] 所有证书图片都正确显示

---

## 🐛 常见问题快速修复

### 问题1: MetaMask 连接失败

**症状**: 点击"连接钱包"没有反应

**解决**:
1. 检查浏览器控制台错误
2. 确认 MetaMask 已安装
3. 尝试刷新页面

### 问题2: IPFS 图片不显示

**症状**: 证书区域显示空白或加载失败

**解决**:
1. 检查 Vercel 环境变量是否配置
2. 在 Vercel Dashboard → Settings → Environment Variables
3. 确认 `VITE_PINATA_JWT` 存在且正确
4. 重新部署（Deployments → Redeploy）

### 问题3: 合约调用失败

**症状**: 显示 "call revert exception" 或类似错误

**解决**:
1. 检查合约地址是否正确
2. 确认合约已在 Polkadot Asset Hub Testnet 上部署
3. 检查网络配置是否正确

### 问题4: 构建失败

**症状**: Vercel 部署时构建错误

**解决**:
1. 在本地运行 `npm run build` 检查错误
2. 修复所有 TypeScript 和 ESLint 错误
3. 提交并推送修复后重新部署

---

## 📝 环境变量清单

在 Vercel 中需要配置的环境变量：

| 变量名 | 值 | 环境 |
|--------|----|----|
| `VITE_PINATA_JWT` | 你的 Pinata JWT 密钥 | Production, Preview, Development |

**获取位置**：
- 从本地 `.env` 文件复制
- 或从 https://app.pinata.cloud → API Keys 获取

---

## 🎯 性能优化（可选）

部署后可以进行的优化：

- [ ] 启用 Vercel Analytics（免费）
- [ ] 配置自定义域名
- [ ] 设置 GitHub 分支部署策略
- [ ] 配置 Preview 部署

---

## 📊 部署信息记录

部署成功后，记录以下信息：

```
部署时间: ___________
Production URL: ___________
合约地址: ___________
网络: Polkadot Asset Hub Testnet
Vercel 项目名: ___________
```

---

## 🔄 持续部署

每次推送代码到 GitHub，Vercel 会自动：
1. ✅ 拉取最新代码
2. ✅ 运行构建
3. ✅ 部署新版本
4. ✅ 提供预览链接

---

## 📚 相关文档

- 📖 完整部署指南: `VERCEL_DEPLOY.md`
- 🔧 合约部署指南: `../DEPLOY_GUIDE.md`
- 🎯 测试流程: `测试流程.md`
- 🐛 调试指南: `调试指南.md`

---

**准备好了吗？开始部署吧！** 🚀

按照上面的清单逐项检查，确保万无一失！

