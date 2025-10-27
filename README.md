# EduBlock - 区块链学历证书管理系统

<div align="center">

![EduBlock Logo](https://img.shields.io/badge/EduBlock-Blockchain-blue)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.19-363636?logo=solidity)](https://soliditylang.org/)
[![Foundry](https://img.shields.io/badge/Built%20with-Foundry-FFDB1C.svg)](https://getfoundry.sh/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://reactjs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

基于区块链的去中心化学历证书管理系统

[功能特性](#-功能特性) • [快速开始](#-快速开始) • [技术栈](#-技术栈) • [部署](#-部署) • [演示](#-演示)

</div>

---

## 📖 项目简介

EduBlock 是一个基于区块链技术的去中心化学历证书管理系统，旨在解决传统学历认证中的信任、防伪和效率问题。通过智能合约和 IPFS 分布式存储，实现了学历证书的安全颁发、永久存储和快速验证。

### 🎯 解决的问题

- **学历造假**: 利用区块链不可篡改特性，确保证书真实性
- **验证困难**: 去中心化存储，任何人都可以快速验证证书
- **隐私保护**: 学生掌控自己的证书数据
- **存储成本**: IPFS 分布式存储，降低存储成本
- **跨境认证**: 全球化的证书验证体系

---

## ✨ 功能特性

### 核心功能

- 🏫 **院校管理**: 管理员可以注册和管理认证院校
- 👤 **学生注册**: 学生可以自主注册并管理个人信息
- 📜 **证书颁发**: 院校为学生颁发数字学历证书
- 📎 **IPFS 存储**: 证书文件上传至 IPFS，实现去中心化存储
- 🔍 **证书查询**: 支持多维度查询（学生、院校）
- 🖼️ **证书预览**: 直接在界面查看 IPFS 上的证书图片

### 技术特性

- ✅ 完整的角色权限管理（管理员、院校、学生）
- ✅ OpenZeppelin 安全合约库
- ✅ 全面的单元测试覆盖
- ✅ 现代化 UI/UX 设计
- ✅ 响应式界面，支持移动端
- ✅ MetaMask 钱包集成
- ✅ 完整的错误处理和用户提示

---

## 🛠️ 技术栈

### 智能合约

- **语言**: Solidity 0.8.19
- **开发框架**: Foundry
- **测试框架**: Forge
- **依赖库**: OpenZeppelin Contracts (AccessControl, Pausable)

### 前端应用

- **框架**: React 18
- **语言**: TypeScript
- **构建工具**: Vite
- **Web3 库**: Ethers.js v5
- **样式**: CSS3 (现代化设计)
- **文件上传**: Axios

### 基础设施

- **区块链网络**: Polkadot Asset Hub Testnet
- **文件存储**: IPFS (Pinata Gateway)
- **前端部署**: Vercel
- **合约部署**: Foundry Script

---

## 📁 项目结构

```
EduBlock/
├── src/                          # 智能合约源码
│   └── AcademicLedger.sol       # 主合约
├── test/                         # 合约测试
│   └── AcademicLedger.t.sol     # 测试用例
├── script/                       # 部署脚本
│   └── DeployAcademicLedger.sol # 部署脚本
├── academic-ledger-frontend/     # 前端应用
│   ├── src/
│   │   ├── components/          # React 组件
│   │   │   ├── ContractInterface.tsx
│   │   │   ├── ConfirmModal.tsx
│   │   │   ├── InputModal.tsx
│   │   │   ├── CertificateIssueForm.tsx
│   │   │   ├── InstitutionRegisterForm.tsx
│   │   │   └── StudentRegisterForm.tsx
│   │   ├── contracts/           # 合约接口
│   │   │   └── AcademicLedger.ts
│   │   ├── utils/               # 工具函数
│   │   │   ├── pinataService.ts
│   │   │   └── ipfsHelper.ts
│   │   ├── App.tsx              # 主应用
│   │   └── main.tsx             # 入口文件
│   ├── public/                   # 静态资源
│   ├── vercel.json              # Vercel 配置
│   └── package.json
├── lib/                          # Foundry 依赖
│   ├── forge-std/
│   └── openzeppelin-contracts/
├── foundry.toml                  # Foundry 配置
├── .gitignore
├── LICENSE
└── README.md                     # 项目文档
```

---

## 🚀 快速开始

### 前置要求

- Node.js >= 18.0.0
- Foundry (安装指南: https://book.getfoundry.sh/getting-started/installation)
- MetaMask 浏览器扩展
- Git

### 1. 克隆项目

```bash
git clone https://github.com/Blockchain-ZJY/EduBlcok.git
cd EduBlcok
```

### 2. 智能合约开发

#### 安装依赖

```bash
# Foundry 会自动安装依赖
forge install
```

#### 编译合约

```bash
forge build
```

#### 运行测试

```bash
# 运行所有测试
forge test

# 详细输出
forge test -vvv

# 测试覆盖率
forge coverage
```

#### 部署合约

```bash
# 部署到测试网
forge script script/DeployAcademicLedger.sol:DeployAcademicLedger \
  --rpc-url https://testnet-passet-hub-eth-rpc.polkadot.io \
  --private-key YOUR_PRIVATE_KEY \
  --broadcast \
  -vvvv
```

### 3. 前端应用开发

#### 安装依赖

```bash
cd academic-ledger-frontend
npm install
```

#### 配置环境变量

创建 `.env` 文件：

```bash
# Pinata IPFS API Key
VITE_PINATA_JWT=your_pinata_jwt_token
```

获取 Pinata JWT:
1. 注册 https://app.pinata.cloud
2. 进入 API Keys
3. 创建新的 API Key
4. 复制 JWT 到 `.env`

#### 更新合约地址

编辑 `src/contracts/AcademicLedger.ts`：

```typescript
export const CONTRACT_ADDRESS = '0x你的合约地址';
```

#### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:5173

#### 构建生产版本

```bash
npm run build
```

---

## 📋 使用指南

### 网络配置

在 MetaMask 中添加 Polkadot Asset Hub Testnet：

- **网络名称**: Polkadot Asset Hub Testnet
- **RPC URL**: `https://testnet-passet-hub-eth-rpc.polkadot.io`
- **链 ID**: `1284`
- **货币符号**: `PAS`
- **区块浏览器**: `https://polkadot-asset-hub-testnet.subscan.io/`

### 角色说明

1. **管理员 (Admin)**
   - 合约部署者自动获得管理员权限
   - 可以注册院校
   - 可以暂停/恢复系统

2. **院校 (Institution)**
   - 由管理员注册
   - 可以注册学生
   - 可以颁发证书
   - 可以更新证书 URI

3. **学生 (Student)**
   - 由院校注册
   - 可以查看自己的证书
   - 任何人都可以验证证书

### 操作流程

1. **管理员**: 连接钱包 → 注册院校
2. **院校**: 连接钱包 → 注册学生 → 颁发证书（上传图片）
3. **学生**: 连接钱包 → 查看我的证书
4. **任何人**: 查询学生证书 → 查询院校证书

---

## 🧪 测试

### 智能合约测试

```bash
# 运行所有测试
forge test

# 运行特定测试
forge test --match-test test_AdminCanRegisterInstitution

# Gas 报告
forge test --gas-report

# 测试覆盖率
forge coverage
```

### 测试用例

- ✅ 初始化状态测试
- ✅ 院校注册测试
- ✅ 权限控制测试
- ✅ 证书颁发测试
- ✅ 证书更新测试
- ✅ 暂停功能测试
- ✅ 边界条件测试

---

## 📦 部署

### 智能合约部署

#### 使用 Foundry Script

```bash
forge script script/DeployAcademicLedger.sol:DeployAcademicLedger \
  --rpc-url https://testnet-passet-hub-eth-rpc.polkadot.io \
  --private-key $PRIVATE_KEY \
  --broadcast
```

#### 部署后

1. 复制合约地址
2. 在区块浏览器验证合约（可选）
3. 更新前端配置中的合约地址

### 前端部署到 Vercel

#### 方式1: 通过 GitHub

1. 推送代码到 GitHub
2. 访问 https://vercel.com
3. 导入项目
4. 设置 Root Directory: `academic-ledger-frontend`
5. 添加环境变量: `VITE_PINATA_JWT`
6. 部署

#### 方式2: 使用 Vercel CLI

```bash
cd academic-ledger-frontend

# 安装 Vercel CLI
npm install -g vercel

# 登录
vercel login

# 部署
vercel --prod
```

详细部署文档: `academic-ledger-frontend/DEPLOY_CHECKLIST.md`

---

## 🎨 界面预览

### 主界面

- 现代化设计，Apple 风格
- 响应式布局，支持移动端
- 清晰的角色标识
- 直观的操作流程

### 核心功能界面

1. **钱包连接**: MetaMask 集成
2. **院校注册**: 统一表单，实时验证
3. **学生注册**: 统一表单，实时验证
4. **证书颁发**: 支持文件上传，IPFS 存储
5. **证书查询**: 多维度查询，详细展示
6. **证书预览**: 直接显示 IPFS 图片，支持新窗口打开

---

## 🔒 安全性

### 智能合约安全

- ✅ OpenZeppelin 标准库
- ✅ AccessControl 权限管理
- ✅ Pausable 紧急暂停
- ✅ 输入验证
- ✅ 重入攻击防护
- ✅ 完整的事件日志

### 前端安全

- ✅ 环境变量隔离
- ✅ 输入验证和清理
- ✅ 错误处理
- ✅ HTTPS 部署

---

## 📊 Gas 优化

- 使用 `uint64` 存储时间戳
- 合理使用 `memory` 和 `storage`
- 批量操作优化
- 事件替代存储

---

## 🤝 贡献

欢迎贡献！请遵循以下步骤：

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

### 代码规范

- Solidity: 遵循 [Solidity Style Guide](https://docs.soliditylang.org/en/latest/style-guide.html)
- TypeScript: 使用 ESLint 配置
- 提交信息: 遵循 [Conventional Commits](https://www.conventionalcommits.org/)

---

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

---

## 👥 作者

- **开发者**: lilinming
- **GitHub**: [@lilinming](https://github.com/lilinming)
- **项目地址**: https://github.com/lilinming/edublock

---

## 🙏 致谢

- [OpenZeppelin](https://openzeppelin.com/) - 安全合约库
- [Foundry](https://getfoundry.sh/) - 开发工具链
- [Pinata](https://pinata.cloud/) - IPFS 服务
- [Polkadot](https://polkadot.network/) - 区块链基础设施
- [Vercel](https://vercel.com/) - 前端托管

---

## 📞 联系方式

如有问题或建议，欢迎：

- 提交 Issue
- 发起 Discussion
- 联系开发者

---

## 🔗 相关链接

- [项目文档](./academic-ledger-frontend/README.md)
- [智能合约](./src/AcademicLedger.sol)
- [部署指南](./DEPLOY_GUIDE.md)
- [测试文档](./test/AcademicLedger.t.sol)

---

<div align="center">

**⭐ 如果这个项目对你有帮助，请给一个 Star！⭐**

Made with ❤️ by lilinming

</div>
