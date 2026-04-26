# ToB 销售助手 Skill

基于豆包 Embedding 的语义搜索 + 私有知识库，为 ToB 销售人员提供三种能力：

1. **新手入门指南** — 系统性地帮新销售快速建立框架
2. **话术问答** — 针对具体销售场景给出可直接使用的话术
3. **阶段指导** — 分析当前销售项目局势，制定下一步行动计划

## 快速安装（在 OpenClaw 里运行）

```bash
# 克隆到 OpenClaw 的 skills 目录
git clone https://github.com/你的用户名/tob-sales-assistant.git ~/.agents/skills/tob-sales-assistant

# 进入脚本目录（无需安装任何 npm 包，使用 Node.js 内置模块）
cd ~/.agents/skills/tob-sales-assistant/scripts
```

## 首次使用

### 第一步：添加知识库内容

把销售书籍笔记和文章放入 `data/knowledge/` 目录，格式为 Markdown（`.md`）。

详见 [`data/knowledge/README.md`](data/knowledge/README.md)。

### 第二步：构建向量索引

```bash
cd ~/skills/tob-sales-assistant/scripts && node index.js
```

等待 1-3 分钟，索引构建完成后显示 `✅ 索引构建完成`。

### 第三步：在飞书使用

直接在飞书对话框里问问题：

- "我是新人，ToB 销售怎么入门？"
- "客户说我们产品太贵了，怎么回应？"
- "我在跟一个制造业客户谈，已经做完方案演示了，但对方一直没消息，该怎么推进？"

## 项目结构

```
tob-sales-assistant/
├── SKILL.md                        ← OpenClaw 读取的行动说明书
├── scripts/
│   ├── index.js                    ← 知识库向量化（首次运行 & 更新时运行）
│   ├── search.js                   ← 语义搜索（OpenClaw 自动调用）
│   └── package.json
├── prompts/
│   ├── new-starter-guide.md        ← 新手指南的输出格式
│   ├── answer-question.md          ← 话术问答的输出格式
│   └── sales-coaching.md          ← 销售阶段指导的输出格式
├── data/
│   ├── index.json                  ← 向量索引（自动生成，不要提交到 git）
│   └── knowledge/                  ← 放你的销售知识文件
│       └── README.md
└── .gitignore
```

## 环境要求

- OpenClaw 已配置豆包 API Key（`ARK_API_KEY` 环境变量）
- Node.js >= 18（OpenClaw 环境已内置）
- 无需安装任何 npm 包

## 更新知识库

向 `data/knowledge/` 添加或修改文件后，重新运行：

```bash
cd ~/.agents/skills/tob-sales-assistant/scripts && node index.js
```

## 更新 Skill 代码

```bash
git -C ~/.agents/skills/tob-sales-assistant pull
cd ~/.agents/skills/tob-sales-assistant/scripts && node index.js
```
