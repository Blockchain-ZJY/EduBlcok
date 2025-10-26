# 将代码更新到GitHub的完整指南

## 📋 准备工作

### 1. 检查Git状态

在你的WSL终端或Git Bash中，运行以下命令：

```bash
# 进入项目目录
cd /home/li/web3/EduBlcok

# 检查Git状态
git status
```

### 2. 如果还没有初始化Git仓库

```bash
# 初始化Git仓库
git init

# 添加远程仓库（替换为你的GitHub仓库地址）
git remote add origin https://github.com/Blockchain-ZJY/EduBlcok.git
```

## 🔧 解决权限问题

如果遇到"dubious ownership"错误，运行：

```bash
git config --global --add safe.directory '%(prefix)//%f'
```

或者在WSL中运行：

```bash
git config --global --add safe.directory "*"
```

## 📝 提交代码的步骤

### 步骤1: 查看修改的文件

```bash
git status
```

这会显示所有修改过但未提交的文件。

### 步骤2: 添加文件到暂存区

**添加所有修改的文件：**

```bash
git add .
```

**或者只添加特定的文件：**

```bash
# 添加前端文件
git add academic-ledger-frontend/

# 添加合约文件
git add src/AcademicLedger.sol

# 添加特定文件
git add academic-ledger-frontend/src/components/ContractInterface.tsx
```

### 步骤3: 提交代码

```bash
git commit -m "更新：修复证书ID获取和状态显示问题

- 修复证书ID显示为0的问题
- 优化证书状态显示逻辑
- 添加权限检查功能
- 改进错误处理和用户提示
- 添加调试日志"
```

### 步骤4: 推送到GitHub

```bash
# 推送到主分支
git push origin main

# 或者如果是master分支
git push origin master
```

**如果第一次推送：**

```bash
git push -u origin main
```

## 🚀 完整操作示例

```bash
# 1. 进入项目目录
cd /home/li/web3/EduBlcok

# 2. 查看修改的文件
git status

# 3. 添加所有文件
git add .

# 4. 提交代码
git commit -m "更新：修复证书相关功能和权限检查"

# 5. 推送到GitHub
git push origin main
```

## 💡 实用技巧

### 查看提交历史

```bash
git log --oneline
```

### 撤销修改

```bash
# 撤销未暂存的修改
git checkout -- 文件名

# 撤销已暂存的修改
git reset HEAD 文件名
```

### 创建新分支

```bash
# 创建并切换到新分支
git checkout -b feature/certificate-fixes

# 提交并推送
git commit -m "功能更新"
git push origin feature/certificate-fixes
```

### 查看差异

```bash
# 查看修改的内容
git diff

# 查看已暂存的内容
git diff --staged
```

## ⚠️ 常见问题

### 1. 权限被拒绝

```bash
# 使用SSH而不是HTTPS
git remote set-url origin git@github.com:用户名/仓库名.git

# 或者更新GitHub token
git remote set-url origin https://你的token@github.com/用户名/仓库名.git
```

### 2. 需要先拉取远程更新

```bash
git pull origin main --rebase
git push origin main
```

### 3. 合并冲突

```bash
# 先拉取远程更新
git pull origin main

# 解决冲突后
git add .
git commit -m "解决合并冲突"
git push origin main
```

## 📦 推荐提交信息格式

```bash
git commit -m "类型: 简短描述

详细描述：
- 修复了什么问题
- 添加了什么功能
- 优化了什么逻辑"
```

**类型包括：**
- `fix`: 修复bug
- `feat`: 新功能
- `refactor`: 重构代码
- `docs`: 文档更新
- `style`: 代码格式调整
- `test`: 测试相关

## 🎯 快速命令参考

```bash
# 查看状态
git status

# 添加所有文件
git add .

# 提交
git commit -m "提交信息"

# 推送
git push origin main

# 拉取更新
git pull origin main

# 查看日志
git log

# 查看差异
git diff
```

## 🔐 设置Git用户信息

如果是第一次使用Git，需要设置用户信息：

```bash
git config --global user.name "lilinming"
git config --global user.email "2504097194@qq.com"
```

## 📚 更多资源

- [Git官方文档](https://git-scm.com/doc)
- [GitHub使用指南](https://docs.github.com/)
- [Git命令备忘单](https://education.github.com/git-cheat-sheet-education.pdf)

祝你推送成功！🚀
