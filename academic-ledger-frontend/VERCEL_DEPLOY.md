# 🚀 Vercel 部署指南

将 AcademicLedger 前端部署到 Vercel，让全世界都能访问你的 dApp！

---

## 📋 部署前准备

### 1. 检查项目是否可以本地构建

```bash
cd academic-ledger-frontend
npm run build
```

如果构建成功，会在 `dist` 目录生成静态文件。

### 2. 确保环境变量配置正确

检查 `.env` 文件：

```bash
# .env
VITE_PINATA_JWT=你的Pinata_JWT密钥
```

⚠️ **重要**：`.env` 文件不会上传到 Git，部署时需要在 Vercel 中配置。

---

## 🎯 方法1：通过 GitHub 部署（推荐 ⭐）

这是最简单也是最推荐的方式！

### 步骤1：将代码推送到 GitHub

```bash
# 如果还没有推送代码
cd /home/li/web3/EduBlcok
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

### 步骤2：登录 Vercel

1. 访问 [https://vercel.com](https://vercel.com)
2. 点击 **"Sign Up"** 或 **"Login"**
3. 选择 **"Continue with GitHub"**（使用 GitHub 账号登录）

### 步骤3：导入项目

1. 登录后，点击 **"Add New..."** → **"Project"**
2. 找到你的仓库 `Blockchain-ZJY/EduBlcok`（或 `lilinming/EduBlcok`）
3. 点击 **"Import"**

### 步骤4：配置项目

在配置页面：

#### Framework Preset
- 自动检测为 **"Vite"**（保持默认）

#### Root Directory
- 点击 **"Edit"**
- 选择 `academic-ledger-frontend`
- 点击 **"Continue"**

#### Build and Output Settings
- **Build Command**: `npm run build`（保持默认）
- **Output Directory**: `dist`（保持默认）
- **Install Command**: `npm install`（保持默认）

#### Environment Variables（重要！）

点击 **"Environment Variables"**，添加以下变量：

| Name | Value |
|------|-------|
| `VITE_PINATA_JWT` | `你的Pinata JWT密钥` |

> 💡 从你的 `.env` 文件中复制 `VITE_PINATA_JWT` 的值

### 步骤5：部署

1. 点击 **"Deploy"**
2. 等待部署完成（通常 1-2 分钟）
3. 部署成功后，Vercel 会给你一个 URL，如：
   - `https://your-project.vercel.app`

---

## 🛠️ 方法2：使用 Vercel CLI 部署

### 步骤1：安装 Vercel CLI

```bash
npm install -g vercel
```

### 步骤2：登录 Vercel

```bash
vercel login
```

选择登录方式（GitHub、Email 等）

### 步骤3：进入前端目录

```bash
cd academic-ledger-frontend
```

### 步骤4：首次部署

```bash
vercel
```

按照提示操作：

```
? Set up and deploy "~/academic-ledger-frontend"? [Y/n] y
? Which scope do you want to deploy to? Your Name
? Link to existing project? [y/N] n
? What's your project's name? academic-ledger
? In which directory is your code located? ./
? Want to override the settings? [y/N] n
```

### 步骤5：配置环境变量

```bash
# 添加 Pinata JWT
vercel env add VITE_PINATA_JWT
```

输入你的 Pinata JWT 密钥，选择适用环境：
- Production ✅
- Preview ✅
- Development ✅

### 步骤6：重新部署（应用环境变量）

```bash
vercel --prod
```

---

## 🔧 自定义域名（可选）

### 在 Vercel Dashboard 中配置

1. 进入你的项目
2. 点击 **"Settings"** → **"Domains"**
3. 添加你的自定义域名
4. 按照 Vercel 的指示配置 DNS

示例：
- `academic-ledger.your-domain.com`
- `edu-blockchain.your-domain.com`

---

## 📝 部署配置文件（可选）

在 `academic-ledger-frontend` 目录创建 `vercel.json`：

```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

这个配置文件：
- ✅ 配置路由重写（支持 React Router）
- ✅ 优化静态资源缓存
- ✅ 明确构建命令

---

## 🔄 自动部署（CI/CD）

### GitHub 自动部署

部署后，每次推送到 GitHub，Vercel 会自动：
1. ✅ 拉取最新代码
2. ✅ 构建项目
3. ✅ 部署到生产环境

```bash
# 本地修改代码
git add .
git commit -m "Update frontend"
git push origin main

# Vercel 会自动部署新版本！
```

### 查看部署状态

在 Vercel Dashboard 中：
- **Deployments** 标签页查看所有部署
- 每次提交都会创建一个预览链接
- 可以回滚到任何历史版本

---

## 🐛 常见问题

### Q1: 部署后连接 MetaMask 失败

**原因**：浏览器可能阻止了 MetaMask

**解决**：
1. 确保使用 HTTPS（Vercel 默认提供）
2. 在浏览器中允许 MetaMask 扩展

### Q2: 部署后 IPFS 图片不显示

**原因**：环境变量未配置

**解决**：
1. 进入 Vercel Dashboard → Settings → Environment Variables
2. 添加 `VITE_PINATA_JWT`
3. 重新部署：Deployments → 点击 "Redeploy"

### Q3: 部署后显示 404

**原因**：路由配置问题

**解决**：
1. 添加 `vercel.json` 配置文件（见上方）
2. 配置路由重写规则

### Q4: 构建失败

**检查**：
1. 本地是否能成功 `npm run build`
2. `package.json` 中的依赖是否完整
3. Node.js 版本是否匹配（Vercel 默认使用最新 LTS）

**指定 Node.js 版本**（如果需要）：

在 `package.json` 中添加：

```json
{
  "engines": {
    "node": ">=18.0.0"
  }
}
```

---

## 📊 部署后检查清单

部署成功后，检查以下功能：

- [ ] 网站可以访问
- [ ] 可以连接 MetaMask
- [ ] 可以注册院校
- [ ] 可以注册学生
- [ ] 可以颁发证书
- [ ] 可以上传图片到 IPFS
- [ ] 可以查看证书列表
- [ ] 图片可以正常显示

---

## 🎯 完整部署流程（快速参考）

### 使用 GitHub（推荐）

```bash
# 1. 推送代码到 GitHub
git push origin main

# 2. 访问 Vercel
# https://vercel.com

# 3. Import Project
# 选择你的仓库

# 4. 配置
# Root Directory: academic-ledger-frontend
# Environment Variables: VITE_PINATA_JWT=你的密钥

# 5. Deploy
# 点击 Deploy 按钮

# 完成！🎉
```

### 使用 CLI

```bash
# 1. 安装 CLI
npm install -g vercel

# 2. 登录
vercel login

# 3. 进入目录
cd academic-ledger-frontend

# 4. 部署
vercel

# 5. 配置环境变量
vercel env add VITE_PINATA_JWT

# 6. 生产部署
vercel --prod

# 完成！🎉
```

---

## 🔗 有用的链接

- 📖 Vercel 官方文档：https://vercel.com/docs
- 🎓 Vite 部署指南：https://vitejs.dev/guide/static-deploy.html#vercel
- 🔧 Vercel CLI 文档：https://vercel.com/docs/cli
- 💬 Vercel 社区：https://github.com/vercel/vercel/discussions

---

## 🎉 部署成功示例

部署成功后的 URL 示例：
- **Production**: `https://academic-ledger.vercel.app`
- **Preview** (每次提交): `https://academic-ledger-git-main-username.vercel.app`

分享你的 dApp 链接给朋友测试吧！ 🚀

---

## 💡 高级技巧

### 1. 多环境部署

- **Production**: `main` 分支 → 生产环境
- **Staging**: `develop` 分支 → 预览环境
- **Preview**: 每个 Pull Request → 独立预览链接

### 2. 性能优化

Vercel 会自动：
- ✅ 压缩静态资源
- ✅ 启用 CDN 加速
- ✅ 自动 HTTPS
- ✅ 图片优化

### 3. 分析部署

在 Vercel Dashboard：
- **Analytics**: 查看访问量、性能
- **Speed Insights**: 分析加载速度
- **Logs**: 查看运行时日志

---

**准备好部署了吗？Let's go! 🚀**

