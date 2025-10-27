# 禁用 GitHub Actions CI

## 方法1: 重命名配置文件（临时禁用）

```bash
cd /home/li/web3/EduBlcok

# 重命名 CI 配置文件
mv .github/workflows/test.yml .github/workflows/test.yml.disabled

# 提交
git add .
git commit -m "Temporarily disable CI"
git push origin main
```

## 方法2: 删除配置文件（永久禁用）

```bash
cd /home/li/web3/EduBlcok

# 删除 CI 配置
rm .github/workflows/test.yml

# 提交
git add .
git commit -m "Remove CI workflow"
git push origin main
```

## 方法3: 修改配置只在特定分支运行

编辑 `.github/workflows/test.yml`，修改触发条件：

```yaml
on:
  push:
    branches:
      - develop  # 只在 develop 分支运行，不在 main 分支运行
  pull_request:
  workflow_dispatch:
```

---

## 重新启用 CI

如果之后想重新启用：

```bash
# 恢复文件名
mv .github/workflows/test.yml.disabled .github/workflows/test.yml

# 提交
git add .
git commit -m "Re-enable CI"
git push origin main
```

