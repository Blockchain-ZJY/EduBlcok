# 📦 部署文档总览

AcademicLedger dApp 的完整部署指南索引

---

## 🎯 快速导航

### 对于急着部署的你
👉 **[5分钟快速部署](QUICKSTART_VERCEL.md)** - 最快的方式上线你的 dApp

### 对于想了解细节的你
👉 **[完整部署指南](VERCEL_DEPLOY.md)** - 详细的 Vercel 部署教程

### 对于追求完美的你
👉 **[部署检查清单](DEPLOY_CHECKLIST.md)** - 确保万无一失

---

## 📚 部署文档列表

| 文档 | 用途 | 适合人群 |
|------|------|---------|
| **QUICKSTART_VERCEL.md** | 5分钟快速上手 | 🚀 想快速部署 |
| **VERCEL_DEPLOY.md** | 完整部署教程 | 📖 想了解细节 |
| **DEPLOY_CHECKLIST.md** | 部署前检查清单 | ✅ 追求零错误 |
| **vercel.json** | Vercel 配置文件 | 🔧 已自动配置 |
| **.vercelignore** | 忽略文件配置 | 🔧 已自动配置 |

---

## 🎓 部署流程图

```
┌─────────────────────────────────────────┐
│  1. 准备阶段                            │
│  - 确认合约地址                         │
│  - 准备 Pinata JWT                      │
│  - 本地测试构建 (npm run build)        │
└─────────────┬───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│  2. 推送到 GitHub                       │
│  git push origin main                   │
└─────────────┬───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│  3. Vercel 配置                         │
│  - 导入 GitHub 仓库                     │
│  - 设置 Root: academic-ledger-frontend  │
│  - 添加环境变量: VITE_PINATA_JWT        │
└─────────────┬───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│  4. 部署                                │
│  点击 Deploy 按钮                       │
│  等待 2-3 分钟                          │
└─────────────┬───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│  5. 测试                                │
│  - 访问部署的 URL                       │
│  - 测试所有功能                         │
│  - 连接 MetaMask                        │
└─────────────┬───────────────────────────┘
              │
              ▼
          🎉 成功！
```

---

## 🔧 部署前配置文件检查

### 必须配置的文件

#### 1. `src/contracts/AcademicLedger.ts`
```typescript
// ✅ 更新合约地址
export const CONTRACT_ADDRESS = '0x你的合约地址';
```

#### 2. `.env`（本地）
```bash
# ✅ Pinata JWT
VITE_PINATA_JWT=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 自动配置的文件（无需修改）

- ✅ `vercel.json` - Vercel 配置
- ✅ `.vercelignore` - 忽略文件
- ✅ `package.json` - 已包含正确的构建命令

---

## 🚀 两种部署方式对比

### 方式 1: GitHub 自动部署（推荐 ⭐）

**优点**:
- ✅ 最简单
- ✅ 自动 CI/CD
- ✅ 每次推送自动部署
- ✅ 提供预览链接

**步骤**:
```bash
git push origin main
# 在 Vercel 导入项目
# 自动部署！
```

### 方式 2: Vercel CLI

**优点**:
- ✅ 命令行操作
- ✅ 更多控制
- ✅ 适合脚本化

**步骤**:
```bash
npm install -g vercel
vercel login
cd academic-ledger-frontend
vercel --prod
```

---

## 📝 环境变量配置

在 Vercel Dashboard 中配置：

| 变量名 | 从哪里获取 | 必须？ |
|--------|-----------|--------|
| `VITE_PINATA_JWT` | `.env` 文件或 Pinata Dashboard | ✅ 是 |

**配置路径**:
```
Vercel Dashboard 
  → 选择项目 
  → Settings 
  → Environment Variables 
  → Add
```

---

## 🎯 部署后测试清单

- [ ] 网站可以访问
- [ ] 可以连接 MetaMask
- [ ] 可以注册院校
- [ ] 可以注册学生
- [ ] 可以颁发证书
- [ ] 可以上传图片
- [ ] 图片可以正常显示
- [ ] 所有查询功能正常

---

## 🐛 常见问题速查

| 问题 | 解决方案 | 文档 |
|------|---------|------|
| MetaMask 连不上 | 检查 HTTPS 和网络配置 | VERCEL_DEPLOY.md |
| IPFS 图片不显示 | 配置环境变量 | DEPLOY_CHECKLIST.md |
| 构建失败 | 检查本地 `npm run build` | VERCEL_DEPLOY.md |
| 404 错误 | 路由配置 (vercel.json) | VERCEL_DEPLOY.md |

---

## 📊 部署时间线

```
准备阶段:    5-10 分钟
GitHub 推送: 1 分钟
Vercel 配置: 3-5 分钟
部署等待:    2-3 分钟
测试验证:    5-10 分钟
─────────────────────────
总计:        15-30 分钟
```

---

## 🔗 相关链接

### 项目相关
- 🏠 项目根目录: `../`
- 📜 合约源码: `../src/AcademicLedger.sol`
- 🔧 部署脚本: `../script/DeployAcademicLedger.sol`

### 前端相关
- ⚙️ 合约接口: `src/contracts/AcademicLedger.ts`
- 🎨 主界面: `src/components/ContractInterface.tsx`
- 🔐 环境配置: `.env`

### 外部资源
- 🌐 Vercel Dashboard: https://vercel.com/dashboard
- 📦 Pinata Dashboard: https://app.pinata.cloud
- 🦊 MetaMask: https://metamask.io

---

## 🎓 学习资源

### Vercel 相关
- [Vercel 官方文档](https://vercel.com/docs)
- [Vite 部署指南](https://vitejs.dev/guide/static-deploy.html#vercel)
- [Vercel CLI 文档](https://vercel.com/docs/cli)

### Web3 相关
- [Ethers.js 文档](https://docs.ethers.org/v5/)
- [MetaMask 文档](https://docs.metamask.io/)
- [IPFS 文档](https://docs.ipfs.tech/)

---

## 💡 高级功能

### 自定义域名
```
Vercel Dashboard 
  → Settings 
  → Domains 
  → Add Domain
```

### 性能监控
```
Vercel Dashboard 
  → Analytics 
  → Speed Insights
```

### 多环境部署
- **Production**: `main` 分支
- **Preview**: 其他分支或 Pull Request
- **Development**: 本地开发

---

## 🎉 部署成功后

你的 dApp 将拥有：

- ✅ 全球 CDN 加速
- ✅ 自动 HTTPS
- ✅ 自动 CI/CD
- ✅ 零停机部署
- ✅ 性能监控
- ✅ 免费托管

分享你的 URL，让世界看到你的区块链项目！ 🌍

---

## 📞 需要帮助？

- 📖 查看详细文档: 上面列出的各个 .md 文件
- 🐛 遇到问题: 查看 `DEPLOY_CHECKLIST.md` 的常见问题部分
- 💬 Vercel 社区: https://github.com/vercel/vercel/discussions

---

**准备好部署了吗？开始吧！** 🚀

推荐路径：
1. 先看 `QUICKSTART_VERCEL.md` 快速上手
2. 遇到问题查看 `DEPLOY_CHECKLIST.md`
3. 需要深入了解看 `VERCEL_DEPLOY.md`

