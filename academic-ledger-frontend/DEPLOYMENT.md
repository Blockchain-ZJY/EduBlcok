# 部署说明

## 1. 部署智能合约到 Polkadot Asset Hub 测试网

### 设置环境变量

```bash
export PRIVATE_KEY="你的私钥"
export RPC_URL="https://testnet-passet-hub-eth-rpc.polkadot.io"
```

### 部署合约

```bash
# 在合约项目目录中执行
forge create --rpc-url $RPC_URL --private-key $PRIVATE_KEY src/AcademicLedger.sol:AcademicLedger --constructor-args 0x0000000000000000000000000000000000000000
```

### 更新合约地址

部署成功后，将新的合约地址更新到 `src/contracts/AcademicLedger.ts` 文件中的 `CONTRACT_ADDRESS` 常量。

## 2. 配置 MetaMask

### 添加网络

1. 打开 MetaMask
2. 点击网络下拉菜单
3. 选择 "添加网络"
4. 输入以下信息：
   - **网络名称**: Polkadot Asset Hub Testnet
   - **RPC URL**: `https://testnet-passet-hub-eth-rpc.polkadot.io`
   - **链ID**: 1284
   - **货币符号**: PAS
   - **区块浏览器**: `https://polkadot-asset-hub-testnet.subscan.io/`

### 获取测试币

1. 访问 [Polkadot Asset Hub Faucet](https://faucet.polkadot.io/)
2. 输入你的钱包地址
3. 获取测试币

## 3. 启动前端应用

### 开发环境

```bash
cd academic-ledger-frontend
npm install
npm run dev
```

### 生产环境

```bash
cd academic-ledger-frontend
npm install
npm run build
npm install -g serve
serve -s dist
```

## 4. 验证部署

1. 打开浏览器访问应用
2. 连接 MetaMask 钱包
3. 确保网络切换到 Polkadot Asset Hub 测试网
4. 测试各项功能：
   - 注册院校
   - 颁发证书
   - 验证证书
   - 查询证书

## 5. 常见问题

### 问题1: 网络连接失败
- 检查 RPC URL 是否正确
- 确认网络配置无误

### 问题2: 交易失败
- 检查账户余额是否充足
- 确认 gas 费用设置

### 问题3: 合约调用失败
- 检查合约地址是否正确
- 确认合约已正确部署

## 6. 监控和调试

### 查看交易
- 使用区块浏览器查看交易详情
- 监控合约事件

### 调试工具
- MetaMask 开发者工具
- 浏览器控制台
- 合约事件日志
