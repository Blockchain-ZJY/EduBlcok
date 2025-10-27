# IPFS 功能快速入门

## 🚀 快速开始（3步）

### 步骤1: 安装依赖

```bash
cd academic-ledger-frontend
npm install axios
```

### 步骤2: 配置API密钥

1. 在 `academic-ledger-frontend` 目录创建 `.env` 文件
2. 添加你的Pinata JWT（从你的API密钥"BlockEdu"中获取）:

```env
VITE_PINATA_JWT=你的JWT_token
```

**如何获取JWT?**
- 登录 Pinata: https://app.pinata.cloud/
- 进入 API Keys 页面
- 点击你的 "BlockEdu" 密钥
- 复制 JWT 字符串

### 步骤3: 启动应用

```bash
npm run dev
```

## ✨ 功能说明

### 1. IPFS连接状态

启动应用后，会自动测试IPFS连接：
- ✅ **连接成功**: 控制台显示 "IPFS (Pinata) 连接成功"
- ❌ **连接失败**: 检查API密钥配置

### 2. 院校功能（颁发证书）

当你登录为**院校角色**时，会看到：

#### 传统方式颁发证书
- 📜 **颁发证书** 按钮：使用传统方式（手动输入URI）

#### IPFS方式颁发证书（推荐）
- 🌐 **颁发证书 (IPFS)** 按钮：自动上传元数据到IPFS
- 📁 **文件上传区域**：可以上传证书文档（PDF、图片等）

**使用流程：**
1. （可选）先上传证书文档（PDF等）
2. 点击"颁发证书 (IPFS)"按钮
3. 按提示输入学生地址、专业、学位等信息
4. 系统自动：
   - 上传文档到IPFS（如果有）
   - 生成并上传证书元数据到IPFS
   - 在区块链上记录IPFS哈希
5. 颁发成功后显示：
   - 证书ID
   - 元数据IPFS哈希和访问链接
   - 文档IPFS哈希和访问链接（如果有）

### 3. 查看证书

颁发证书后，你会获得IPFS链接，可以：
- 直接访问查看元数据
- 分享给学生
- 通过任何IPFS网关访问

## 🎯 IPFS的优势

1. **去中心化存储**：数据存储在IPFS网络，不依赖单一服务器
2. **永久保存**：通过Pinata固定，数据永久可访问
3. **内容寻址**：使用内容哈希，数据不可篡改
4. **全球访问**：可通过多个IPFS网关访问
5. **成本低廉**：Pinata提供免费套餐

## 📊 支持的文件类型

- PDF文档 (.pdf)
- 图片 (.jpg, .jpeg, .png)
- Word文档 (.doc, .docx)
- 最大10MB

## 🔍 查看IPFS内容

获得IPFS哈希后，可以通过以下网关访问：

1. **Pinata网关** (默认):
   ```
   https://gateway.pinata.cloud/ipfs/{你的哈希}
   ```

2. **IPFS.io**:
   ```
   https://ipfs.io/ipfs/{你的哈希}
   ```

3. **Cloudflare**:
   ```
   https://cloudflare-ipfs.com/ipfs/{你的哈希}
   ```

## 💡 元数据格式

上传到IPFS的证书元数据包含：

```json
{
  "name": "张三 - 计算机科学证书",
  "description": "某某大学颁发的本科证书",
  "attributes": [
    { "trait_type": "学生姓名", "value": "张三" },
    { "trait_type": "学号", "value": "20230001" },
    { "trait_type": "颁发机构", "value": "某某大学" },
    { "trait_type": "专业/课程", "value": "计算机科学" },
    { "trait_type": "学位/等级", "value": "本科" },
    { "trait_type": "颁发日期", "value": "2025-01-26" }
  ],
  "properties": {
    // 更多详细信息...
  }
}
```

## ⚠️ 注意事项

1. **API配额**：免费套餐有限制，注意使用量
2. **文件大小**：建议<10MB
3. **隐私**：IPFS上的数据是公开的，不要上传敏感信息
4. **网络延迟**：首次访问可能需要几秒钟

## 🐛 常见问题

### IPFS未连接？

检查：
1. `.env` 文件是否在正确位置
2. JWT是否正确复制（无多余空格）
3. 环境变量名是否正确：`VITE_PINATA_JWT`
4. 是否重启了开发服务器

### 上传失败？

可能原因：
1. 网络问题
2. API配额用完
3. 文件太大
4. API密钥权限不足

### 无法访问IPFS链接？

1. 尝试不同的IPFS网关
2. 等待几分钟让内容传播
3. 检查IPFS哈希是否正确

## 📚 更多资源

- [完整配置指南](./IPFS_SETUP.md)
- [Pinata文档](https://docs.pinata.cloud/)
- [IPFS官网](https://ipfs.io/)

