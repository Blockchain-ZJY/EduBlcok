# Academic Ledger Frontend

学术证书区块链系统前端应用，基于 React + TypeScript + Vite 构建。

## 功能特性

- 🔗 连接 MetaMask 钱包
- 🏫 注册院校
- 📜 颁发证书
- ✅ 验证证书
- 📋 查询证书
- 🚫 撤销证书
- 🌐 支持 Polkadot Asset Hub 测试网

## 技术栈

- React 18
- TypeScript
- Vite
- Ethers.js
- CSS3

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

### 3. 构建生产版本

```bash
npm run build
```

## 网络配置

### Polkadot Asset Hub 测试网

- **网络名称**: Polkadot Asset Hub Testnet
- **RPC URL**: `https://testnet-passet-hub-eth-rpc.polkadot.io`
- **链ID**: 1284
- **货币符号**: PAS
- **区块浏览器**: `https://polkadot-asset-hub-testnet.subscan.io/`

## 使用说明

1. 安装 MetaMask 浏览器扩展
2. 添加 Polkadot Asset Hub 测试网
3. 获取测试币
4. 连接钱包
5. 开始使用系统功能

## 项目结构

```
src/
├── components/
│   ├── ContractInterface.tsx    # 主要交互组件
│   └── ContractInterface.css    # 组件样式
├── contracts/
│   └── AcademicLedger.ts        # 合约交互类
├── App.tsx                       # 主应用组件
├── App.css                       # 应用样式
├── main.tsx                     # 应用入口
└── index.css                    # 全局样式
```

## 开发说明

- 合约地址需要根据实际部署情况更新
- 支持响应式设计
- 包含完整的错误处理
- 支持 MetaMask 钱包连接

## 许可证

MIT
