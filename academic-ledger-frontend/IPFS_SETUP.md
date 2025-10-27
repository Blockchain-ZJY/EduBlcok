# Pinata IPFS 配置指南

本项目使用Pinata服务来存储证书元数据到IPFS（InterPlanetary File System）。

## 1. 获取Pinata API密钥

1. 访问 [Pinata官网](https://www.pinata.cloud/)
2. 注册/登录你的账户
3. 进入 API Keys 页面
4. 点击 "New Key" 创建新的API密钥

### 推荐方式：使用JWT

1. 在创建API密钥时，勾选需要的权限：
   - `pinFileToIPFS`
   - `pinJSONToIPFS`
   - `unpin`
   - `pinList`
2. 复制生成的JWT token

### 备用方式：使用API Key和Secret

1. 创建API密钥时会同时生成 API Key 和 API Secret
2. 复制这两个值

## 2. 配置环境变量

在项目根目录创建 `.env` 文件（或复制 `.env.example`）：

```bash
# 方式1: 使用JWT (推荐)
VITE_PINATA_JWT=your_pinata_jwt_here

# 方式2: 使用API Key和Secret (备用)
VITE_PINATA_API_KEY=your_api_key_here
VITE_PINATA_SECRET_KEY=your_secret_key_here

# 合约地址
VITE_CONTRACT_ADDRESS=your_contract_address_here
```

**注意**: `.env` 文件已添加到 `.gitignore`，不会被提交到Git仓库。

## 3. 安装依赖

```bash
npm install axios
```

## 4. 使用方法

### 基本用法

```typescript
import { pinataService } from './utils/pinataService';

// 测试连接
const isConnected = await pinataService.testAuthentication();

// 上传文件
const file = // ... File对象
const result = await pinataService.uploadFile(file, {
  name: 'my-file.pdf',
  keyvalues: {
    type: 'certificate'
  }
});
console.log('IPFS Hash:', result.IpfsHash);

// 上传JSON数据
const metadata = {
  name: '证书',
  description: '学位证书',
  attributes: [...]
};
const jsonResult = await pinataService.uploadJSON(metadata);

// 获取IPFS URL
const url = pinataService.getIPFSUrl(result.IpfsHash);
```

### 证书元数据上传

```typescript
const certificateData = {
  studentName: '张三',
  studentId: '20230001',
  institutionName: '某某大学',
  program: '计算机科学',
  level: '本科',
  issuedDate: '2025-01-26',
  description: '优秀毕业生'
};

const ipfsHash = await pinataService.uploadCertificateMetadata(certificateData);
console.log('元数据IPFS链接:', pinataService.getIPFSUrl(ipfsHash));
```

## 5. 在UI中集成

项目已包含 `FileUpload` 组件用于文件上传：

```tsx
import { FileUpload } from './components/FileUpload';
import { pinataService } from './utils/pinataService';

const handleFileSelect = async (file: File) => {
  try {
    const result = await pinataService.uploadFile(file, {
      name: file.name,
      keyvalues: {
        type: 'certificate-document'
      }
    });
    
    const ipfsUrl = pinataService.getIPFSUrl(result.IpfsHash);
    console.log('文件已上传到IPFS:', ipfsUrl);
  } catch (error) {
    console.error('上传失败:', error);
  }
};

<FileUpload
  onFileSelect={handleFileSelect}
  accept=".pdf,.jpg,.png"
  maxSize={10}
  label="上传证书文件"
/>
```

## 6. IPFS网关

默认使用Pinata网关访问文件：
- `https://gateway.pinata.cloud/ipfs/{hash}`

你也可以使用其他公共IPFS网关：
- `https://ipfs.io/ipfs/{hash}`
- `https://cloudflare-ipfs.com/ipfs/{hash}`

## 7. 功能特性

### PinataService 类提供的方法：

- ✅ `testAuthentication()` - 测试API连接
- ✅ `uploadFile(file, metadata)` - 上传文件到IPFS
- ✅ `uploadJSON(jsonData, metadata)` - 上传JSON到IPFS
- ✅ `uploadCertificateMetadata(metadata)` - 上传证书元数据
- ✅ `getIPFSUrl(hash)` - 获取IPFS访问URL
- ✅ `getJSONFromIPFS(hash)` - 从IPFS获取JSON数据
- ✅ `unpinFile(hash)` - 取消固定（删除）文件
- ✅ `getPinnedFiles(filters)` - 获取已固定文件列表

## 8. 最佳实践

1. **元数据标准化**: 使用统一的元数据格式
2. **文件大小限制**: 设置合理的文件大小限制（建议<10MB）
3. **错误处理**: 添加完善的错误处理和用户提示
4. **缓存策略**: 考虑缓存已上传的IPFS哈希
5. **网关备份**: 使用多个IPFS网关作为备份

## 9. 安全注意事项

⚠️ **重要**: 
- 不要将API密钥提交到公共代码仓库
- 使用环境变量管理敏感信息
- 定期轮换API密钥
- 为API密钥设置适当的权限

## 10. 故障排查

### 上传失败
- 检查API密钥是否正确
- 确认网络连接正常
- 检查文件大小是否超限
- 查看Pinata账户配额

### 无法访问IPFS内容
- 尝试使用不同的IPFS网关
- 等待内容在IPFS网络中传播（可能需要几分钟）
- 检查IPFS哈希是否正确

## 11. 相关资源

- [Pinata官方文档](https://docs.pinata.cloud/)
- [IPFS官网](https://ipfs.io/)
- [Pinata API参考](https://docs.pinata.cloud/reference)

