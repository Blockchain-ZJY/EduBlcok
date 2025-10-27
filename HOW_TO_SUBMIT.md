# 🏆 如何提交项目到比赛

## 📋 简单理解

**Fork → 添加项目 → Push → 创建 PR**

就像：
1. **Fork**: 复印比赛方的作业纸
2. **添加项目**: 在复印纸上写你的答案
3. **Push**: 保存你写的答案
4. **PR**: 把你的答案交给老师审阅

---

## 🎯 详细步骤

### 步骤 1: Fork 比赛仓库（网页操作）

1. 打开比赛方的 GitHub 仓库链接
   - 例如：`https://github.com/Polkadot-Academy/Final-Project`

2. 点击页面右上角的 **"Fork"** 按钮
   - ![Fork按钮](通常在右上角)

3. 等待几秒，Fork 完成后会跳转到你的副本
   - 你的副本：`https://github.com/lilinming/Final-Project`

---

### 步骤 2: 克隆你的 Fork（命令行操作）

```bash
# 在 WSL 中执行

# 克隆你 fork 的仓库（注意：是你的，不是比赛方的！）
git clone https://github.com/lilinming/Final-Project.git

# 进入目录
cd Final-Project
```

---

### 步骤 3: 添加你的项目文件

```bash
# 根据比赛要求创建目录
# 常见的结构：
# - submissions/你的项目名/
# - participants/你的名字/
# - projects/项目名/

# 例如：
mkdir -p submissions/EduBlock

# 复制你的项目文件
cp -r /home/li/web3/EduBlcok/* submissions/EduBlock/

# 或者使用 rsync（排除不必要的文件）
rsync -av --exclude 'node_modules' --exclude '.git' \
  /home/li/web3/EduBlcok/ submissions/EduBlock/
```

---

### 步骤 4: 提交到你的 Fork

```bash
# 查看更改
git status

# 添加所有文件
git add .

# 提交
git commit -m "feat: Submit EduBlock project"

# 推送到你的 fork
git push origin main
```

---

### 步骤 5: 创建 Pull Request（网页操作）

1. **访问你的 fork 仓库**
   - `https://github.com/lilinming/Final-Project`

2. **会看到提示**
   ```
   This branch is 1 commit ahead of Polkadot-Academy:main
   [Contribute] 按钮
   ```

3. **点击 "Contribute" → "Open Pull Request"**

4. **填写 PR 信息**
   ```
   标题：[参赛] EduBlock - 区块链学历证书系统
   
   描述：
   ## 项目信息
   - 项目名称：EduBlock
   - 参赛者：lilinming
   - 项目类型：区块链学历证书管理系统
   
   ## 技术栈
   - Solidity, Foundry, React, IPFS
   
   ## 功能特点
   - 去中心化证书管理
   - IPFS 存储
   - 完整的前端界面
   
   ## 部署信息
   - 合约地址：0x...
   - 前端 URL：https://...
   ```

5. **确认信息**
   - From: `lilinming/Final-Project` (你的 fork)
   - To: `Polkadot-Academy/Final-Project` (比赛仓库)
   - Branch: `main` → `main`

6. **点击 "Create Pull Request"**

7. **完成！** 🎉
   - 等待比赛方审核你的 PR
   - 你可以在 PR 页面看到审核状态

---

## 📝 实际例子

假设比赛仓库是：`github.com/Web3Foundation/Grant-Program`

### 网页操作

1. **Fork**
   ```
   打开: https://github.com/Web3Foundation/Grant-Program
   点击: Fork 按钮
   结果: https://github.com/lilinming/Grant-Program
   ```

### 命令行操作

2. **Clone**
   ```bash
   git clone https://github.com/lilinming/Grant-Program.git
   cd Grant-Program
   ```

3. **添加项目**
   ```bash
   # 按照比赛要求的目录结构
   mkdir -p applications/EduBlock
   
   # 复制项目
   cp -r /home/li/web3/EduBlcok/* applications/EduBlock/
   
   # 创建项目说明
   cat > applications/EduBlock.md << 'EOF'
   # EduBlock
   
   ## Project Overview
   区块链学历证书管理系统
   
   ## Team
   - Name: lilinming
   - GitHub: @lilinming
   
   ## Technology Stack
   - Solidity, Foundry, React, IPFS
   EOF
   ```

4. **提交**
   ```bash
   git add .
   git commit -m "Application: EduBlock"
   git push origin main
   ```

### 网页操作

5. **创建 PR**
   ```
   访问: https://github.com/lilinming/Grant-Program
   点击: Contribute → Open Pull Request
   填写: 项目信息
   提交: Create Pull Request
   ```

---

## ⚠️ 注意事项

### ✅ DO (应该做)

- ✅ 仔细阅读比赛的提交要求
- ✅ 按照要求的目录结构组织文件
- ✅ 写清楚的 PR 描述
- ✅ 确保项目能正常构建和运行
- ✅ 删除敏感信息（私钥、API密钥等）
- ✅ 添加完整的 README 文档

### ❌ DON'T (不要做)

- ❌ 不要克隆比赛方的仓库再推送（权限不足）
- ❌ 不要忘记 Fork 这一步
- ❌ 不要提交 `node_modules`、`.env` 等
- ❌ 不要修改比赛方的其他文件
- ❌ 不要直接推送到比赛方仓库

---

## 🔍 常见问题

### Q1: 为什么要 Fork？

**A**: 你没有比赛方仓库的写权限，不能直接推送。Fork 创建一个你自己的副本，你有完全的控制权。

### Q2: PR 是什么？

**A**: Pull Request = 请求合并。你请求比赛方把你的代码合并到他们的仓库中。

### Q3: 如果我需要修改提交的内容怎么办？

**A**: 很简单！
```bash
# 在你 fork 的本地仓库修改
cd Final-Project
# 修改文件...

# 提交并推送
git add .
git commit -m "Update: 修复bug"
git push origin main

# PR 会自动更新！
```

### Q4: Fork 和 Clone 的区别？

**A**:
- **Fork**: 在 GitHub 网站上复制一个仓库到你的账号（网页操作）
- **Clone**: 把 GitHub 上的仓库下载到本地（命令行操作）

流程：`Fork（网页）→ Clone（命令行）→ 修改 → Push → PR（网页）`

---

## 🚀 快速使用脚本

我已经为你创建了自动化脚本：

```bash
# 编辑脚本中的比赛仓库地址
nano submit-to-competition.sh

# 运行脚本
bash submit-to-competition.sh
```

脚本会自动完成：
1. ✅ 克隆你的 fork
2. ✅ 复制项目文件
3. ✅ 创建 README
4. ✅ 提交并推送

你只需要在网页上创建 PR 即可！

---

## 📞 需要帮助？

如果遇到问题：

1. 检查比赛的提交文档
2. 查看其他参赛者的 PR 示例
3. 在比赛讨论区询问
4. 随时问我！

---

**祝你比赛顺利！** 🏆

