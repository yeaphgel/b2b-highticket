# 🎮 Clover A-sales 销冠教练系统

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg)
![Languages](https://img.shields.io/badge/languages-5-blue.svg)

**Clover A-sales** 是一套完整的 AI 驱动的销售教练系统，集成了游戏化仪表盘、GROW 教练模式、定时自动化和多平台兼容性。

## ✨ 核心特性

### 🎯 游戏化仪表盘
- **实时 KPI 显示**: 等级、积分、通话统计、徽章
- **十维度评估**: 破冰、识别需求、传达价值等深度量化
- **排行榜系统**: 周/月/年排行，激励团队竞争
- **成长曲线**: 可视化进度追踪

### 🧠 GROW 教练引擎  
- **个性化指导**: 基于用户弱项生成定制化教练建议
- **渐进式提问**: 每周最多 3 个问题，逐步完善上下文
- **智能触发**: 通话数据驱动，自动生成周度教练分析
- **行动计划**: 具体的周/月执行方案

### ⏰ 定时自动化
- **D1-D30 提醒**: 智能客户跟进节点（感谢→观察→案例→推进→收口）
- **周度 GROW 分析**: 自动生成个性化教练建议
- **月度等级评估**: 自动计算晋升，发送庆祝通知
- **每日早报**: 知识推送和待办提醒

### 🤝 OpenClaw 和 Hermes 集成
- **语音转写**: Hermes 自动转换通话为文字
- **自动复盘**: AI 快速分析通话，计算维度评分
- **客户档案同步**: 自动更新客户信息和跟进历史
- **Webhook 支持**: 接收 CRM（Salesforce、OpenClaw）的实时更新

### 📦 一键部署
- **通用安装脚本**: `bash install.sh` 一键安装
- **Docker 容器化**: 支持 Docker Compose 整体部署
- **多平台兼容**: OpenClaw、Hermes、Claude Code、Codex

### 🌍 多语言支持
- 简体中文 (中国大陆)
- 繁体中文 (香港、台湾)
- English (全球)
- 日本語 (日本)
- Français (法国)

## 🚀 快速开始

### 方案 1: 一键安装（推荐）

```bash
# Linux/macOS
bash <(curl -fsSL https://raw.githubusercontent.com/yeaphgel/clover-a-sales/main/install.sh)

# 或本地安装
git clone https://github.com/yeaphgel/clover-a-sales.git
cd clover-a-sales
bash install.sh
```

### 方案 2: Docker 部署

```bash
# 克隆仓库
git clone https://github.com/yeaphgel/clover-a-sales.git
cd clover-a-sales

# 复制环境文件
cp .env.example .env

# 编辑 .env 填入 API keys
vim .env

# 启动全部服务
docker-compose up -d

# 查看日志
docker-compose logs -f
```

### 方案 3: OpenClaw 集成

```bash
# 在 OpenClaw skills 目录安装
bash install-openclaw.sh

# 或手动设置
git clone https://github.com/yeaphgel/clover-a-sales.git ~/.agents/skills/clover-a-sales
cd ~/.agents/skills/clover-a-sales
npm install
```

## 📖 使用指南

### 1. 启动服务

```bash
# 启动所有服务
npm run start:all

# 或分别启动
npm run dashboard    # 仪表盘 API (端口 3000)
npm run scheduler    # 定时调度器
npm run hermes       # Hermes 集成 (端口 3001)
npm run webhook      # Webhook 处理 (端口 3002)
```

### 2. 访问仪表盘

打开浏览器访问:
```
http://localhost:3000
```

### 3. 使用 CLI 工具

```bash
# 查看用户仪表盘
node scripts/coach-cli.js dashboard <userId>

# 查看 GROW 教练建议
node scripts/coach-cli.js coach <userId>

# 查看排行榜
node scripts/coach-cli.js leaderboard weekly

# 列出所有用户
node scripts/coach-cli.js list-users

# 更新维度分数
node scripts/coach-cli.js update-progress <userId> <dimension> <score>
```

### 4. 配置 OpenClaw 集成

在 OpenClaw 中配置 Webhook:
```
POST http://localhost:3002/webhook/openclaw
Header: X-Source: openclaw, X-Signature: <HMAC-SHA256>
```

### 5. 配置 Hermes 集成

在 Hermes 中配置回调:
```
POST http://localhost:3001/webhook/hermes/call

Body:
{
  "callId": "call_123",
  "clientName": "客户名",
  "transcript": "通话转写文本",
  "userId": "user_123"
}
```

## 🏗️ 项目结构

```
clover-a-sales/
├── dashboard/                      # Web 仪表盘
│   ├── index.html
│   ├── css/style.css
│   └── js/
│       ├── app.js                 # 主程序
│       ├── api.js                 # API 调用
│       ├── charts.js              # 图表逻辑
│       └── i18n.js                # 多语言支持
├── scripts/                        # 核心脚本
│   ├── dashboard-api.js           # Dashboard API
│   ├── grow-coach.js              # GROW 教练引擎
│   ├── coach-cli.js               # CLI 工具
│   ├── scheduler.js               # 定时任务
│   ├── hermes-integration.js      # Hermes 集成
│   ├── webhook-handler.js         # Webhook 处理
│   ├── memory.js                  # 客户档案管理
│   ├── search.js                  # 语义搜索
│   └── index.js                   # 向量索引构建
├── data/                           # 数据目录
│   ├── clients/                   # 客户档案 (*.json)
│   ├── progress/                  # 用户进度
│   ├── knowledge/                 # 知识库 (*.md)
│   └── execution/                 # 执行指南
├── locales/                        # 多语言文件
│   ├── en/
│   ├── zh-Hans/
│   ├── zh-Hant/
│   ├── ja/
│   └── fr/
├── .env.example                    # 环境变量模板
├── install.sh                      # 通用安装脚本
├── install-openclaw.sh            # OpenClaw 专用安装
├── Dockerfile                      # Docker 镜像
├── docker-compose.yml             # Docker 编排
└── package.json                    # NPM 脚本
```

## 🔧 API 端点

### Dashboard API (端口 3000)

```
GET  /api/dashboard/:userId        获取仪表盘数据
GET  /api/leaderboard/weekly       获取周排行
GET  /api/leaderboard/monthly      获取月排行
GET  /api/dimension/:userId        获取十维度数据
POST /api/progress/:userId/update  更新进度
GET  /api/health                   健康检查
```

### Hermes Webhook (端口 3001)

```
POST /webhook/hermes/call          处理语音转写和自动复盘
GET  /health                       健康检查
```

### CRM Webhook (端口 3002)

```
POST /webhook/openclaw             OpenClaw 客户更新
POST /webhook/calendar             日历会议完成
POST /webhook/email                邮件发送追踪
GET  /health                       健康检查
```

## ⚙️ 环境配置

复制 `.env.example` 为 `.env` 并填入以下信息:

```bash
# 必需
ARK_API_KEY=your_api_key_here

# 可选（用于推送通知）
DINGTALK_WEBHOOK=https://oapi.dingtalk.com/robot/send?access_token=xxx
FEISHU_WEBHOOK=https://open.feishu.cn/open-apis/bot/v2/hook/xxx

# 可选（用于 CRM 集成）
OPENCLAW_SECRET=your_secret
HERMES_SECRET=your_secret
```

## 📊 十维度评估模型

| 维度 | 描述 | L1权重 | L5权重 |
|-----|------|--------|--------|
| 破冰 | 初次沟通和融洽建立 | 15% | 10% |
| 识别需求 | 需求发现和痛点挖掘 | 20% | 15% |
| 传达价值 | 方案和价值表达 | 15% | 10% |
| 建立信任 | 信心和信任建立 | 15% | 10% |
| 信任塑造 | 深化长期关系 | 10% | 25% |
| 定制解决 | 个性化方案设计 | 10% | 20% |
| 异议处理 | 客户反对意见应对 | 10% | 5% |
| 促成交易 | 交易推进和成交 | 5% | 5% |
| 关系维护 | 售后关系维护 | 5% | 15% |
| 钩子 | 后续跟进和持续联系 | 5% | 15% |

## 🎓 五级进阶系统

| 级别 | 名称 | 分数范围 | 特征 |
|-----|------|----------|------|
| 1 | 销售新人 | 0-40 | 学习基础知识和话术 |
| 2 | 初级销售 | 40-60 | 掌握销售步骤和流程 |
| 3 | 中级销售 | 60-75 | 能够独立完成销售周期 |
| 4 | 销冠 | 75-90 | 能够指导他人，稳定成交 |
| 5 | 销售大师 | 90-100 | 销售思想家，生态建设者 |

## 📱 平台兼容性

| 平台 | 仪表盘 | 自动化 | 集成度 |
|-----|--------|--------|--------|
| OpenClaw | ✅ | ✅ | 深度集成 |
| Hermes | ✅ | ✅ | 语音集成 |
| Claude Code | ✅ | ⚠️ | Web 仪表盘 |
| Codex | ⚠️ | ✅ | API 方式 |

## 📖 文档

- [安装指南](./docs/INSTALL.md) - 详细安装步骤
- [OpenClaw 集成](./docs/OPENCLAW.md) - OpenClaw 配置指南
- [Hermes 集成](./docs/HERMES.md) - Hermes 配置指南
- [API 文档](./docs/API.md) - REST API 参考
- [架构设计](./docs/ARCHITECTURE.md) - 系统架构详解
- [故障排除](./docs/TROUBLESHOOTING.md) - 常见问题解决

## 🌐 多语言版本

- [简体中文](./README.zh-Hans.md)
- [繁體中文](./README.zh-Hant.md)
- [English](./README.md)
- [日本語](./README.ja.md)
- [Français](./README.fr.md)

## 🤝 联系方式

### 培训定制和支持

**邮箱**: [yeaphgel@gmail.com](mailto:yeaphgel@gmail.com)  
**X (Twitter)**: [@yeaphgel](https://x.com/yeaphgel)  
**GitHub**: [yeaphgel/clover-a-sales](https://github.com/yeaphgel/clover-a-sales)

如需团队培训、定制开发或商务合作，欢迎联系。

## 📝 许可证

MIT License - 详见 [LICENSE](./LICENSE)

---

**Clover A-sales** © 2024 by [yeaphgel](https://github.com/yeaphgel)

Made with ❤️ for Sales Teams Worldwide
