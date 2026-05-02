# 📦 安装指南

## 系统要求

- **Node.js**: 18+ 版本
- **npm**: 8+ 版本
- **操作系统**: macOS, Linux, 或 Windows (WSL 推荐)
- **内存**: 2GB+ 推荐
- **网络**: 需要访问豆包 API (可选，用于向量索引)

## 方案 1: 一键安装（推荐）

### macOS / Linux

```bash
# 下载并运行安装脚本
bash <(curl -fsSL https://raw.githubusercontent.com/yeaphgel/clover-a-sales/main/install.sh)
```

### 本地安装

```bash
# 克隆仓库
git clone https://github.com/yeaphgel/clover-a-sales.git
cd clover-a-sales

# 运行安装脚本
bash install.sh
```

## 方案 2: Docker 部署

### 前置条件

- Docker 20.10+
- Docker Compose 2.0+

### 部署步骤

```bash
# 克隆仓库
git clone https://github.com/yeaphgel/clover-a-sales.git
cd clover-a-sales

# 复制环境文件
cp .env.example .env

# 编辑配置（可选）
# vim .env

# 构建镜像（首次运行）
npm run docker:build

# 或使用 docker 命令
docker build -t clover-a-sales:latest .

# 启动容器
npm run docker:up
# 或
docker-compose up -d

# 查看日志
npm run docker:logs

# 停止容器
npm run docker:down
```

## 方案 3: OpenClaw 集成

### 前置条件

- OpenClaw 已安装
- OpenClaw Skill 目录可写

### 安装步骤

```bash
# 使用专用脚本
bash <(curl -fsSL https://raw.githubusercontent.com/yeaphgel/clover-a-sales/main/install-openclaw.sh)

# 或本地安装
git clone https://github.com/yeaphgel/clover-a-sales.git
cd clover-a-sales
bash install-openclaw.sh
```

## 方案 4: Hermes 集成

### 前置条件

- Hermes AI 已配置
- Hermes API Key 已获取

### 安装步骤

```bash
# 标准安装
bash install.sh

# 配置 .env 文件
cp .env.example .env
vim .env  # 填入 HERMES_API_KEY 和 HERMES_SECRET

# 启动服务
npm run start:all
```

## 方案 5: 手动安装

### Step 1: 环境检查

```bash
node --version  # 应该 >= 18
npm --version   # 应该 >= 8
```

### Step 2: 克隆仓库

```bash
git clone https://github.com/yeaphgel/clover-a-sales.git
cd clover-a-sales
```

### Step 3: 安装依赖

```bash
npm install
```

### Step 4: 配置环境

```bash
# 复制模板
cp .env.example .env

# 编辑配置文件，填入必需的 API keys
vim .env

# 必需配置：
# - ARK_API_KEY: 用于向量索引和 AI 功能
# - DEFAULT_LANGUAGE: 默认语言 (zh-Hans/en/ja/fr)

# 可选配置：
# - DINGTALK_WEBHOOK: 钉钉通知
# - FEISHU_WEBHOOK: 飞书通知
# - OPENCLAW_SECRET: OpenClaw 集成
# - HERMES_SECRET: Hermes 集成
```

### Step 5: 初始化数据

```bash
# 创建数据目录
mkdir -p data/{clients,progress,progress/rankings,knowledge,execution}

# 构建向量索引（如果配置了 ARK_API_KEY）
npm run index
```

### Step 6: 启动服务

```bash
# 启动所有服务
npm run start:all

# 或分别启动：
npm run dashboard    # 仪表盘 API，访问 http://localhost:3000
npm run scheduler    # 定时调度器
npm run hermes       # Hermes 集成，Webhook 在 http://localhost:3001
npm run webhook      # CRM Webhook，处理在 http://localhost:3002
```

## 验证安装

### 检查服务状态

```bash
# 检查 Dashboard API
curl http://localhost:3000/api/health

# 检查 Hermes 集成
curl http://localhost:3001/health

# 检查 Webhook 处理
curl http://localhost:3002/health

# 返回 {"status": "ok"} 表示正常
```

### 访问仪表盘

打开浏览器访问:
```
http://localhost:3000
```

### 测试 CLI 工具

```bash
# 列出所有用户
node scripts/coach-cli.js list-users

# 查看某个用户的仪表盘
node scripts/coach-cli.js dashboard <userId>

# 查看 GROW 教练建议
node scripts/coach-cli.js coach <userId>
```

## 常见问题排查

### 问题 1: Node.js 版本过低

```
错误: Node.js 版本过低，需要 18+ 版本
```

**解决**:
```bash
# 升级 Node.js
# macOS (使用 Homebrew)
brew install node@18

# Linux (Ubuntu/Debian)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Windows
# 访问 https://nodejs.org 下载安装
```

### 问题 2: 缺少 API Key

```
错误: 未找到 ARK_API_KEY 环境变量
```

**解决**:
```bash
# 编辑 .env 文件
vim .env

# 添加以下行：
ARK_API_KEY=your_actual_api_key_here

# 保存并重启服务
npm run start:all
```

### 问题 3: 端口被占用

```
错误: listen EADDRINUSE: address already in use :::3000
```

**解决**:
```bash
# 查看占用该端口的进程
lsof -i :3000

# 杀死进程
kill -9 <PID>

# 或改变端口（在 .env 中修改）
DASHBOARD_PORT=3001
```

### 问题 4: Docker 构建失败

```
错误: ERROR [2/5] RUN npm ci --only=production
```

**解决**:
```bash
# 清理并重建
docker-compose down -v
docker system prune -a
npm run docker:build
npm run docker:up
```

## 卸载

### 完全卸载

```bash
# 停止所有服务
npm run docker:down

# 删除目录（如果使用 Docker）
rm -rf clover-a-sales/

# 或仅清空数据（保留应用代码）
rm -rf data/*
```

## 升级

```bash
# 进入项目目录
cd clover-a-sales

# 获取最新代码
git pull origin main

# 重新安装依赖（如有变化）
npm install

# 重新构建向量索引（可选）
npm run index

# 重启服务
npm run start:all
```

## 下一步

1. **配置集成**: 参考 [OpenClaw 集成指南](./OPENCLAW.md) 或 [Hermes 集成指南](./HERMES.md)
2. **添加知识库**: 将销售资料放入 `data/knowledge/` 目录
3. **创建用户档案**: 在 `data/clients/` 中添加客户 JSON 文件
4. **开始使用**: 访问 http://localhost:3000 开始使用仪表盘

有问题？联系 [yeaphgel@gmail.com](mailto:yeaphgel@gmail.com)
