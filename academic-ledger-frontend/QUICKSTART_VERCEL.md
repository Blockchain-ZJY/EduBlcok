# ⚡ Vercel 部署快速开始

5 分钟内将你的 dApp 部署到线上！

---

## 🚀 最快部署方式（3 步）

### 步骤 1: 推送代码到 GitHub

```bash
cd /home/li/web3/EduBlcok
git add .
git commit -m "Deploy to Vercel"
git push origin main
```

### 步骤 2: 在 Vercel 导入项目

1. 打开 **https://vercel.com**
2. 点击 **"Continue with GitHub"** 登录
3. 点击 **"Add New..."** → **"Project"**
4. 选择你的仓库 `Blockchain-ZJY/EduBlcok`
5. 点击 **"Import"**

### 步骤 3: 配置并部署

在配置页面：

**Root Directory**: 
- 点击 **"Edit"** 
- 选择 `academic-ledger-frontend`
- 点击 **"Continue"**

**Environment Variables**:
- 点击 **"Add"**
- Name: `VITE_PINATA_JWT`
- Value: 从你的 `.env` 文件复制完整的 JWT 密钥
  ```
  eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOi...
  ```

**完成**:
- 点击 **"Deploy"** 按钮
- 等待 2-3 分钟 ☕

---

## ✅ 部署成功！

部署完成后，你会得到一个 URL：

```
https://your-project-name.vercel.app
```

🎉 **恭喜！你的 dApp 已经上线了！**

---

## 🧪 测试部署的应用

1. 打开部署的 URL
2. 连接 MetaMask
3. 切换到 Polkadot Asset Hub Testnet
4. 测试：
   - ✅ 注册院校
   - ✅ 注册学生
   - ✅ 颁发证书（上传图片）
   - ✅ 查看证书列表

---

## 🔧 如果遇到问题

### IPFS 图片不显示？

1. 进入 Vercel Dashboard
2. 选择你的项目
3. 点击 **"Settings"** → **"Environment Variables"**
4. 确认 `VITE_PINATA_JWT` 存在
5. 如果没有，添加它
6. 回到 **"Deployments"**，点击 **"Redeploy"**

### MetaMask 连不上？

确保：
- ✅ 使用的是 HTTPS（Vercel 自动提供）
- ✅ MetaMask 已安装
- ✅ 已添加 Polkadot Asset Hub Testnet 网络

---

## 📱 分享你的 dApp

把 URL 分享给朋友：

```
🎓 我的区块链学历证书 dApp 上线了！
🔗 https://your-project-name.vercel.app
```

---

## 🔄 更新应用（自动部署）

每次推送代码，Vercel 会自动更新：

```bash
# 修改代码
git add .
git commit -m "Update feature"
git push origin main

# Vercel 会自动部署新版本！
```

---

## 📚 需要更多帮助？

详细文档：
- 📖 完整部署指南: `VERCEL_DEPLOY.md`
- ✅ 部署检查清单: `DEPLOY_CHECKLIST.md`

---

**就是这么简单！Happy Deploying! 🚀**

