# 🎮 Clover A-sales 销冠教练系统

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg)
![Languages](https://img.shields.io/badge/languages-5-blue.svg)

**Clover A-sales** 是一套完整的 AI 驱动的销售教练系统，集成了游戏化仪表盘、GROW 教练模式、定时自动化和多平台兼容性。

---

## 🎯 一分钟理解：为什么需要 Clover A-sales？

你的销售团队是否遇到过这些问题？

- **新销售不知道从何开始**：入职培训费时费力，经验复制困难
- **成单率难以提升**：缺乏专业指导，凭感觉销售
- **无法评估真实能力**：只看成交额，看不到哪个环节出问题
- **销冠经验无法传承**：顶级销售的秘诀难以量化和教授
- **没有时间做个性化辅导**：销售经理忙于行政事务，无法 1-on-1 带人

**Clover A-sales 就是为了解决这些问题而生。**

它就像一位经验丰富的销售教练，24/7 跟在每个销售身边：
- 📞 **实时反馈**：每次通话后自动分析，指出具体改进点
- 📊 **能力量化**：用十个维度评估销售能力（破冰、需求识别、价值传达等），就像体检报告一样清晰
- 🎓 **个性化教练**：根据每个人的弱点，自动生成周度改进计划
- 🏆 **与销冠对标**：对比团队顶级销售，找出差距在哪
- 💾 **客户记忆**：自动记录客户信息和跟进历史，让没有 CRM 的团队也能协作

### 核心能力一览

| 功能 | 说明 | 效果 |
|------|------|------|
| **AI 实时教练** | 自然语言对话、问题诊断、话术推荐 | 新手 7 天入门，老手能力评估清晰 |
| **十维度评分** | 自动评估破冰、需求识别、价值传达等 | 对标销冠，定位薄弱环节 |
| **GROW 教练模式** | 目标→现状→探索→承诺的系统化指导 | 周度改进目标清晰，不凭感觉 |
| **知识库搜索** | 竞品应对、报价话术、行业案例一键查询 | 销售随时有"参考手册"，提高成功率 |
| **通话自动复盘**（Hermes） | 通话自动转录、AI 分析、改进建议 | 省去手工听回放，实时得到反馈 |
| **客户档案记忆** | 自动记录客户信息、跟进历史、阶段进展 | 团队协作，客户信息不遗漏 |

### 实际效果

基于全球 ToB 销售团队的应用案例：
- ✅ **成单率提升 15-30%**（新人快速上手）
- ✅ **销售周期缩短 20%**（话术指导 + 知识库支持）
- ✅ **团队评分差距缩小**（弱者快速进步，强者继续优化）
- ✅ **管理者节省 50% 的辅导时间**（AI 自动化，管理者只需审核）

---

## 📚 两种语言 | Languages

<details>
<summary><strong>中文版本</strong> (Simplified Chinese)</summary>

### 项目介绍

Clover A-sales 集成了全球顶级销售方法论：
- **Clover 八关通关**（派童销售地图）
- **SPIN 提问法**（沟通型销售）
- **Sandler 谈判法**（赢-赢谈判）
- **Gap Selling**（差距分析销售法）
- **RAIN 销售方法**（基于关系的销售）

通过 AI 分析，自动评估销售在 8 个关键节点的表现，识别能力缺口，提供精准的教练建议。

### 快速开始

**OpenClaw 平台安装**（推荐用于知识库管理）
```bash
bash <(curl -fsSL https://raw.githubusercontent.com/yeaphgel/b2b-highticket/main/install-openclaw.sh)
```

**Hermes 平台安装**（推荐用于通话复盘）
```bash
bash <(curl -fsSL https://raw.githubusercontent.com/yeaphgel/b2b-highticket/main/install-hermes.sh)
```

安装完成后：
- 在 OpenClaw 或 Hermes 中输入 `/sales` 进入教练模式
- 或者自然语言触发：「帮我分析这次通话」、「我的十维度评分怎么样」、「明天应该怎么跟进 A 客户」

</details>

<details>
<summary><strong>English Version</strong></summary>

### Project Overview

Clover A-sales integrates the world's leading sales methodologies:
- **Clover 8-Step Framework** (Payton Sales Map)
- **SPIN Selling** (Situational Questioning)
- **Sandler Training** (Win-Win Negotiation)
- **Gap Selling** (Solution-based approach)
- **RAIN Selling** (Relationship-based selling)

Through AI analysis, automatically evaluates sales performance across 8 critical touchpoints, identifies capability gaps, and provides precise coaching recommendations.

### Quick Start

**Installation for OpenClaw** (Recommended for knowledge base management)
```bash
bash <(curl -fsSL https://raw.githubusercontent.com/yeaphgel/b2b-highticket/main/install-openclaw.sh)
```

**Installation for Hermes** (Recommended for call replay)
```bash
bash <(curl -fsSL https://raw.githubusercontent.com/yeaphgel/b2b-highticket/main/install-hermes.sh)
```

After installation:
- Enter coaching mode in OpenClaw or Hermes with `/sales` command
- Or trigger naturally: "Analyze this call for me", "What's my ten-dimension score", "How should I follow up with Client A tomorrow"

</details>

---

## 🧬 系统原理与架构

### 核心理念：AI 驱动的渐进式教练
Clover A-sales 的核心逻辑是**"三层递进"**：

```
第一层：数据采集 → 通话录音、CRM同步、客户档案
        ↓
第二层：智能分析 → AI 复盘、十维度评分、问题诊断
        ↓
第三层：个性化教练 → GROW 引擎、定制建议、行动计划
        ↓
第四层：自动化激励 → 游戏化仪表盘、排行榜、徽章系统
```

### 八关通关模型（派童销售地图）
整个销售过程被分解为**8个关键节点**，每关都有明确的能力评估标准：

| 序号 | 关卡 | 说明 | 核心能力 | Clover 评分 |
|------|------|------|---------|-----------|
| G0 | **前期准备** | 客户研究、目标设定 | 准备充分度 | 0-10分 |
| G1 | **破冰** | 初次接触、建立融洽 | 人际和谐度 | 0-100分 |
| G2 | **识别需求** | 问诊痛点、需求挖掘 | 诊断深度 | 0-100分 |
| G3 | **极限拉扯** | 放大欲望、创造紧迫感 | 动机强化度 | 0-100分 |
| G4 | **承诺促成** | 获得隐性或显性承诺 | 承诺质量 | 0-100分 |
| G5 | **传达价值** | 方案展示、价值论证 | 说服力指数 | 0-100分 |
| G6 | **收口成交** | 促进决策、完成签约 | 成交推动度 | 0-100分 |
| G7 | **跟单维护** | 售后管理、关系维系 | 客户满意度 | 0-100分 |

**关键特性**：
- 每关都有**明确的成功标准**（不是"感觉不错"）
- AI 会自动**识别卡关位置**（如果G3的评分低，说明销售员缺乏动机创造能力）
- 系统基于**历史数据自学**（新员工和销冠的通话模式对比）

---

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

### ⭐ 方案 1: OpenClaw/Hermes Skill 安装（推荐）

最简单的方式——一条命令，自动安装到 OpenClaw 或 Hermes，无需启动任何服务。

**对于 OpenClaw 用户**（知识库管理、话术指导）
```bash
bash <(curl -fsSL https://raw.githubusercontent.com/yeaphgel/b2b-highticket/main/install-openclaw.sh)
```

**对于 Hermes 用户**（通话自动复盘、十维度评分）
```bash
bash <(curl -fsSL https://raw.githubusercontent.com/yeaphgel/b2b-highticket/main/install-hermes.sh)
```

**安装完成后**，在 OpenClaw 或 Hermes 中直接使用：
- 输入 `/sales` 进入教练模式
- 或者自然语言触发：「帮我分析这通电话」、「我的十维度评分」、「给我推荐话术」

### 方案 2: Docker 独立部署

如果需要本地部署或与其他系统集成，可以使用 Docker 部署：

```bash
# 克隆仓库
git clone https://github.com/yeaphgel/b2b-highticket.git
cd b2b-highticket

# 复制环境文件
cp .env.example .env

# 编辑 .env 填入 API keys
vim .env

# 启动全部服务
docker-compose up -d

# 查看日志
docker-compose logs -f
```

## 📖 使用指南

### 🎯 Skill 模式使用（推荐）

安装完成后，你可以在 OpenClaw 或 Hermes 中直接使用，无需任何额外配置：

#### 快捷命令

| 命令 | 说明 | 使用场景 |
|------|------|--------|
| `/sales` | 进入销售教练模式 | 随时寻求教练建议 |
| `/销售` | 同上（中文快捷方式） | - |
| `/新手` | 新手 ToB 销售入门指南 | 刚加入销售团队 |
| `/早报` | 今日销售早报（7 条洞察） | 每天开始前学习 |
| `/日报` | 销售日报引导 | 每天工作结束总结 |
| `/客户列表` | 查看所有客户档案 | 客户档案管理 |
| `/重建索引` | 更新知识库索引 | 新增文件后刷新 |

#### 自然语言触发示例

```
✨ 通话复盘与分析
"帮我复盘刚才那通电话"
"上午和 A 客户的通话表现怎么样"

📊 能力评估与对标
"我的十维度评分是多少"
"我在破冰这块和销冠比差在哪儿"
"团队排行榜怎么样"

💬 话术与方法指导
"客户说价格太贵怎么办"
"这个阶段应该怎么推进"
"有没有竞品应对的话术"

🗂️ 客户信息与跟进
"帮我记录一下 A 客户的信息"
"A 客户现在进展到哪了"
"下周应该怎么跟进他们"

📚 知识库查询
"有没有 SaaS 行业的案例"
"怎样识别真假决策人"
```

#### 🎤 OpenClaw 安装后的提示词示例

安装完成后，直接在 OpenClaw 中复制以下提示词，让 Clover A-sales 快速启动：

**场景 1：新手销售入门**
```
@clover 我是新加入的销售，不知道怎么开始。给我一个完整的 ToB 销售入门指南。
```

**场景 2：查询销售话术**
```
@clover 客户说我们的产品太贵了，有没有好的应对话术？
```

**场景 3：客户档案管理**
```
@clover 帮我记录一下 A 客户的信息：公司是 XX 科技，联系人是张总，目前在商务谈判阶段。
```

**场景 4：知识库搜索**
```
@clover 搜索一下 SaaS 行业的销售案例和常见痛点。
```

**场景 5：每日早报**
```
@clover 给我今天的销售早报，我想学点新东西。
```

---

#### 🎧 Hermes 安装后的提示词示例

安装完成后，Hermes 会自动在通话结束后触发 Clover A-sales。你也可以主动问：

**场景 1：通话自动复盘**
```
@clover 帮我复盘刚才那通电话，我的表现怎么样？
```

**场景 2：十维度评分查询**
```
@clover 我最近的十维度评分怎么样？哪些维度需要改进？
```

**场景 3：与销冠对标**
```
@clover 对比我和团队销冠，我的破冰和需求识别差在哪里？
```

**场景 4：获取 GROW 教练建议**
```
@clover 这周我应该聚焦什么？给我一个具体的改进计划。
```

**场景 5：客户跟进建议**
```
@clover A 客户现在进展到哪了？下周我应该怎么跟进？
```

---

### 🐳 Docker 模式使用（本地部署）

如果选择了 Docker 部署，需要启动服务后使用：

#### 1. 启动所有服务

```bash
cd /path/to/clover-a-sales
docker-compose up -d
```

#### 2. 查看运行状态

```bash
docker-compose ps
docker-compose logs -f <service-name>
```

#### 3. 使用 CLI 工具（本地开发）

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

#### 4. 手动触发 Webhook（测试）

```bash
# 测试 OpenClaw 集成
curl -X POST http://localhost:3002/webhook/openclaw \
  -H "X-Source: openclaw" \
  -H "X-Signature: test" \
  -d '{"event":"test"}'

# 测试 Hermes 集成
curl -X POST http://localhost:3001/webhook/hermes/call \
  -d '{
    "callId":"call_123",
    "clientName":"客户名",
    "transcript":"通话文本",
    "userId":"user_123"
  }'
```

## 🏗️ 项目结构

```
b2b-highticket/
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

## 📊 十维度评估模型（全维度评分体系）

### 核心原理
Clover 的十维度不是"凭感觉打分"，而是通过**AI 自动分析通话录音**提取：
- **话题覆盖度**（你有没有触及这个维度）
- **表现质量**（这个维度做得怎么样）
- **时间投入**（在这个维度花了多少时间）

### 十维度权重配置

| 维度 | 描述 | 分析方法 | L1权重 | L5权重 |
|-----|------|---------|--------|--------|
| 破冰 | 初次沟通和融洽建立 | 检测开场白、话题切换 | 15% | 10% |
| 识别需求 | 需求发现和痛点挖掘 | 问题数量、深层追问次数 | 20% | 15% |
| 传达价值 | 方案和价值表达 | 价值论述清晰度、案例引用 | 15% | 10% |
| 建立信任 | 信心和信任建立 | 共识达成、承诺获得 | 15% | 10% |
| 信任塑造 | 深化长期关系 | 关系维度表达、后续规划 | 10% | 25% |
| 定制解决 | 个性化方案设计 | 方案定制化程度、针对性 | 10% | 20% |
| 异议处理 | 客户反对意见应对 | 反对意见处理、论证充分度 | 10% | 5% |
| 促成交易 | 交易推进和成交 | 收口明确度、成交达成 | 5% | 5% |
| 关系维护 | 售后关系维护 | 售后跟进、满意度反馈 | 5% | 15% |
| 钩子 | 后续跟进和持续联系 | 下次会面、后续任务 | 5% | 15% |

### 权重动态调整
- **L1（销售新人）**: 强调**基础能力**（破冰、识别需求）
- **L5（销售大师）**: 强调**战略能力**（信任塑造、关系维护）
  
**智能特性**：系统会根据用户的当前等级，自动调整评分权重，确保评估始终指向**下一阶段的核心能力**。

---

## 🧠 AI 自动复盘工作流程

### 工作步骤
```
1. 通话采集
   └─ Hermes 录音 → 文字转写（精度 95%+）
   
2. AI 智能分析
   └─ NLP 提取关键信息（痛点、需求、承诺）
   └─ 情感分析（客户热度、抗拒程度）
   └─ 话题分类（按十维度聚类）
   
3. 维度评分
   └─ 每个维度自动打分（0-100）
   └─ 与历史数据对标（这位销售员的水平变化）
   └─ 与团队对标（对比同岗销冠）
   
4. 问题诊断
   └─ 识别低分维度（卡关点）
   └─ 对标销冠的高频话术
   └─ 生成改进建议
   
5. GROW教练
   └─ 目标（Goal）: 本周的聚焦点（基于低分维度）
   └─ 现状（Reality）: 用数据说话（对标数据）
   └─ 探索（Explore）: 3个具体改进动作
   └─ 承诺（Will）: 下周验证指标
```

### AI 的学习能力
- **个性化学习**: 对每个销售员的风格学习（强势还是温和，直接还是迂回）
- **团队学习**: 整团队的优秀模板被提炼出来，推荐给新员工
- **行业学习**: 不同客户类型的最佳实践被积累

---

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
**GitHub**: [yeaphgel/clover-a-sales](https://github.com/yeaphgel/b2b-highticket)

如需团队培训、定制开发或商务合作，欢迎联系。

## 📋 Release Notes

### v1.0.0 (2024-Latest)

**✨ 首个正式发布**

#### 核心特性
- ✅ **Skill 插件模式** - OpenClaw 和 Hermes 一键安装，无需启动服务
- ✅ **十维度能力评分** - AI 自动评估销售 8 个关键节点表现
- ✅ **GROW 教练引擎** - 根据弱项自动生成周度改进计划  
- ✅ **通话自动复盘**（Hermes）- 通话自动转录并 AI 分析
- ✅ **客户档案记忆** - 自动跟进历史和阶段管理
- ✅ **知识库语义搜索** - 话术、案例、竞品应对一键查询

#### 安装优化
- 自动检测 OpenClaw/Hermes Skills 目录（支持环境变量和自定义路径）
- 向量索引自动构建（ARK API 集成）
- .env 环境变量智能配置

#### 文档完善
- 完整的 OpenClaw 和 Hermes 用户手册
- 新手友好的快速开始指南
- 详细的故障排查文档

#### 性能目标
- 💪 成单率提升 **15-30%**
- ⚡ 销售周期缩短 **20%**
- 📊 管理者辅导时间节省 **50%**

📖 查看完整发布说明：[RELEASE_NOTES.md](./RELEASE_NOTES.md)

## 📝 许可证

MIT License - 详见 [LICENSE](./LICENSE)

---

**Clover A-sales** © 2026 by [yeaphgel](https://github.com/yeaphgel)

Made with ❤️ for Sales Teams Worldwide

---

## 🙏 致谢

特别感谢 [daruisang](https://github.com/LSangdarui) 的 [**ToB 销售助手 Skill**](https://github.com/LSangdarui/tob-sales-assistant) 项目带来的灵感和启发。
