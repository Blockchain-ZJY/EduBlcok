# 快速配置 IPFS

## 步骤1: 创建 .env 文件

在 `academic-ledger-frontend` 目录下创建 `.env` 文件：

```bash
# Windows PowerShell
New-Item -Path .env -ItemType File

# Linux/Mac
touch .env
```

## 步骤2: 添加你的Pinata API密钥

编辑 `.env` 文件，添加以下内容（使用你从Pinata获取的密钥）：

```env
# 使用JWT (推荐 - 从图片中可以看到你有一个 BlockEdu 的API key)
VITE_PINATA_JWT=你的JWT token

# 或者使用API Key和Secret
VITE_PINATA_API_KEY=你的API_KEY
VITE_PINATA_SECRET_KEY=你的SECRET_KEY
```

## 步骤3: 安装axios依赖

```bash
npm install axios
```

## 步骤4: 重启开发服务器

```bash
npm run dev
```

## 完成！

现在你可以在应用中使用IPFS功能了。

### 如何找到你的API密钥？

根据你的截图，你已经有一个名为 "BlockEdu" 的API密钥：
- **密钥**: `605281d5bfc192b38343`
- **发行日期**: 2025年10月26日
- **权限**: 积极的

你需要点击这个密钥来查看完整的JWT token或Secret。

