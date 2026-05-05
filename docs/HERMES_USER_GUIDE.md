# 🎧 Clover A-sales for Hermes - 语音集成使用手册

**目标用户**：Hermes 平台用户、语音销售、销售团队  
**文档更新**：2026-05-05  
**支持邮箱**：yeaphgel@gmail.com

---

## 📚 目录

1. [快速开始](#快速开始)
2. [系统架构](#系统架构)
3. [配置指南](#配置指南)
4. [工作流程](#工作流程)
5. [数据分析](#数据分析)
6. [常见问题](#常见问题)
7. [故障排除](#故障排除)

---

## 🚀 快速开始

### 前置准备

✅ 已安装 Hermes 语音平台  
✅ 已安装 Clover A-sales Hermes 版本（通过 `bash install-hermes.sh`）  
✅ 配置了 `.env` 文件的 API Key  
✅ 配置了 `hermes-config.json`  
✅ 服务已启动：`npm run start:all`

### 五分钟快速体验

**第 1 步**：启动 Clover + Hermes 集成
```bash
npm run start:all
```

**第 2 步**：在 Hermes 中配置 Webhook 回调

在 Hermes 的设置中：
```
Webhook URL: http://your-domain:3001/webhook/hermes/call
Method: POST
Headers:
  Content-Type: application/json
  X-Hermes-Secret: [HERMES_SECRET from .env]
```

**第 3 步**：进行第一通电话

- 通过 Hermes 拨打电话或接听电话
- Hermes 自动录音并转写
- Clover 自动接收转写内容
- 几秒钟后，获得 AI 复盘报告

**第 4 步**：查看 AI 复盘

通过 Web Dashboard（http://localhost:3000）查看：
```
通话分析报告
├─ 通话时长：12:34
├─ 转写准确度：98%
├─ 十维度评分：
│  ├─ 破冰：75分
│  ├─ 识别需求：62分
│  ├─ ...
├─ AI 建议：
│  └─ "本通电话的最大问题是缺乏深层追问..."
└─ 改进计划：
   └─ "建议下周重点练习：识别需求（SPIN 问诊法）"
```

---

## 🧬 系统架构

### 工作流程图

```
Hermes 语音系统
    ↓
通话录音 + AI 转写
    ↓
发送 Webhook 回调到 Clover
    ├─ callId
    ├─ transcript（文字转写）
    ├─ clientName（客户名）
    ├─ duration（通话时长）
    └─ userId（销售员 ID）
    ↓
Clover AI 分析模块
    ├─ NLP 关键词提取
    │  ├─ 痛点识别
    │  ├─ 承诺识别
    │  └─ 反对意见识别
    ├─ 情感分析
    │  ├─ 客户热度分析
    │  └─ 销售员表现分析
    └─ 十维度评分
       ├─ 基于通话内容自动打分
       ├─ 与历史数据对标
       └─ 与团队对标
    ↓
生成 AI 复盘报告
    ├─ 通话摘要
    ├─ 维度评分
    ├─ 问题诊断
    ├─ 改进建议
    └─ GROW 教练计划
    ↓
保存到数据库 + 推送通知
    ├─ 销售员收到复盘报告
    ├─ 管理员可以查看团队数据
    └─ 数据进入知识库用于持续学习
```

### 数据处理流程

```
时间线：
0秒     : 通话结束，Hermes 立即开始录音上传
5秒     : Clover 接收到回调，开始转写和分析
10秒    : AI 完成初步分析（关键词、情感）
15秒    : AI 完成十维度评分
20秒    : 生成 GROW 教练建议
25秒    : 报告生成完成，推送给销售员
30秒    : 数据保存到数据库，进入知识库索引

总耗时：30 秒内完成从通话到教练建议的全流程
```

---

## ⚙️ 配置指南

### 环境变量配置（.env）

```bash
# Hermes 集成
HERMES_SECRET=your_hermes_secret_key
HERMES_API_ENDPOINT=https://hermes.example.com/api

# Clover 核心配置
ARK_API_KEY=your_ark_api_key
DASHBOARD_PORT=3000
HERMES_PORT=3001
WEBHOOK_PORT=3002

# 音频处理
ENABLE_AUDIO_STORAGE=true        # 是否保存原始音频文件
AUDIO_STORAGE_PATH=./data/audio  # 音频存储路径
RETENTION_DAYS=30                # 音频保留天数

# 转写配置
TRANSCRIPTION_PROVIDER=hermes    # 转写服务商
TRANSCRIPTION_TIMEOUT=60000      # 转写超时时间（毫秒）

# 通知配置
ENABLE_NOTIFICATIONS=true
DINGTALK_WEBHOOK=https://oapi.dingtalk.com/robot/send?access_token=xxx
FEISHU_WEBHOOK=https://open.feishu.cn/open-apis/bot/v2/hook/xxx
```

### Hermes 配置文件（hermes-config.json）

```json
{
  "hermes": {
    "apiEndpoint": "https://hermes.example.com/api",
    "webhookUrl": "http://your-domain:3001/webhook/hermes/call",
    "secret": "${HERMES_SECRET}",
    "timeout": 30000,
    "retryAttempts": 3,
    "retryBackoff": 2000
  },

  "transcription": {
    "provider": "hermes",
    "autoProcess": true,
    "languages": ["zh-CN", "en-US"],
    "minConfidence": 0.8,
    "timeout": 60000
  },

  "callTracking": {
    "enabled": true,
    "trackingFields": [
      "callId",
      "callDuration",
      "direction",
      "transcript",
      "clientName",
      "userId"
    ],
    "enrichData": {
      "extractPainPoints": true,
      "extractCommitments": true,
      "extractObjections": true,
      "analyzeEmotion": true
    }
  },

  "analysis": {
    "enableAIAnalysis": true,
    "dimensionScoring": true,
    "generateCoachingPlan": true,
    "compareWithChampion": true,
    "minCallDurationForScoring": 120
  },

  "notifications": {
    "enabled": true,
    "sendTo": ["seller", "manager"],
    "channels": ["dingtalk", "feishu", "email"],
    "triggers": [
      "call_completed",
      "analysis_done",
      "coaching_plan_ready"
    ]
  },

  "security": {
    "validateSignature": true,
    "encryptAudio": true,
    "allowedOrigins": ["https://hermes.example.com"],
    "rateLimitPerMinute": 100
  }
}
```

### 初始化配置步骤

```bash
# 1. 复制配置文件
cp .env.example .env
cp hermes-config.example.json hermes-config.json

# 2. 编辑 .env 文件，填写实际的 API Key 和端点
vim .env

# 3. 编辑 hermes-config.json，配置 Webhook 回调
vim hermes-config.json

# 4. 启动服务
npm run start:all

# 5. 验证配置
npm run start:all 2>&1 | grep -E "Hermes.*listening|Webhook.*registered"

# 6. 在 Hermes 中注册 Webhook 回调
# 在 Hermes 设置中添加:
# POST http://your-domain:3001/webhook/hermes/call
```

---

## 📊 工作流程

### 销售员日常工作流

**通话前**：
```
1. 打开 Hermes
2. 搜索客户（系统显示历史通话记录）
3. 查看上次通话的 AI 复盘（如果有过通话）
4. 根据上次的改进建议，准备本次通话要点
5. 拨打或接听电话
```

**通话中**：
```
1. Hermes 自动录音
2. Hermes 实时转写（如果启用）
3. 销售员专注于通话，无需额外操作
```

**通话后**：
```
1. 通话自动结束，Hermes 上传录音和转写
   （通常在 3-5 秒内完成）

2. Clover 接收到回调，开始 AI 分析
   （通常在 20-30 秒内完成）

3. 销售员收到复盘通知（钉钉/飞书/邮件）
   包含：
   ├─ 通话时长
   ├─ 十维度评分
   ├─ 主要问题诊断
   ├─ 3 个改进建议
   └─ 下周的 GROW 目标

4. 销售员查看详细报告（Web Dashboard）
   http://localhost:3000/analysis/[callId]

5. 根据建议，准备下次通话的改进计划
```

### 管理员工作流

**日常**：
```
🌅 早上 (09:00)
  └─ 查看昨天的团队通话总结
     ├─ 总通话数
     ├─ 平均评分
     ├─ 问题维度汇总
     └─ 需要重点关注的销售员

📊 每周 (周五 16:00)
  └─ 生成周度报告
     ├─ 个人表现排行
     ├─ 团队平均分
     ├─ 共性问题分析
     └─ 推荐的集体培训主题

📈 每月 (月末)
  └─ 生成月度分析
     ├─ 成员升级情况
     ├─ 技能改进情况
     ├─ 高频问题TOP 10
     └─ 下月改进计划
```

**进阶功能**：
```bash
# 生成团队对标报告
@clover admin:team-analysis

# 导出通话数据用于二次分析
@clover admin:export --format csv --type calls

# 定制化评分权重（不同销售类型有不同权重）
@clover admin:config set dimensions.weight.[dimension] [value]
```

---

## 🔍 数据分析

### 通话分析报告示例

```
📞 通话分析报告
═══════════════════════════════════════════════

基本信息
├─ 通话 ID：call_202605051430_user001_client789
├─ 销售员：张三 (user_001)
├─ 客户：ABC 公司采购经理
├─ 通话时长：15 分 32 秒
├─ 通话方向：呼出
├─ 转写准确度：98%
└─ 分析完成时间：30 秒

十维度评分
├─ 🎯 破冰：75/100 (销冠: 92，差距: -17)
├─ 🔍 识别需求：62/100 (销冠: 88，差距: -26) ⚠️
├─ 💡 传达价值：70/100 (销冠: 85，差距: -15)
├─ 🤝 建立信任：68/100 (销冠: 90，差距: -22)
├─ 💰 信任塑造：55/100 (销冠: 80，差距: -25) ⚠️⚠️
├─ 🛠️ 定制解决：60/100 (销冠: 85，差距: -25)
├─ 🚫 异议处理：72/100 (销冠: 82，差距: -10)
├─ ✅ 促成交易：65/100 (销冠: 88，差距: -23) ⚠️
├─ 🔗 关系维护：58/100 (销冠: 85，差距: -27) ⚠️
└─ 🪝 钩子：52/100 (销冠: 80，差距: -28) ⚠️⚠️

总体评分：64/100 (进步 ↑ 3分 from 上周)

关键信息提取
├─ 提问次数：3 次 (销冠平均: 6.2 次)
├─ 提问深度：浅层问题为主
├─ 客户热度：中等（63/100）
├─ 转折点：客户在 9:32 秒提到"预算有限"
├─ 承诺获得：暂无明确承诺，需要下次跟进
└─ 竞品提及：否

问题诊断
❌ 问题 1：识别需求不够深入（得分 62）
   现象：你问了"有什么问题吗？"但客户说完就没有深入追问
   对比销冠：销冠会继续问 "这个问题影响了哪些方面？"
   建议：学习 SPIN 提问法（见下方行动计划）

❌ 问题 2：没有识别隐性需求
   现象：客户说"预算有限"，你听到后就开始降价
   问题：你没有发现客户真正的顾虑可能不是价格
   对比销冠：销冠会问 "预算有限的话，你们最迫切需要的是什么？"
   建议：用 Gap Selling 的方法论，挖掘"理想状态"和"现实差距"

❌ 问题 3：后续跟进计划不清楚
   现象：通话结尾说"我再想想，有问题联系你"
   问题：没有明确的下次接触时间和形式
   建议：养成习惯，每通电话结尾都要确认 "下次什么时候联系"

💡 建议
1️⃣ 立即行动（这周）
   每通电话至少问 3 个"为什么"
   用 SPIN 框架：情景 → 困难 → 暗示 → 需求回顾
   示例话术：
   • "除了这个，还有其他痛点吗？"
   • "这个问题带来的成本大概是多少？"
   • "如果解决了这个问题，对你们意味着什么？"

2️⃣ 本周学习
   观看销冠李四的 3 个高分通话（识别需求 ≥85）
   命令：@clover search identify_needs --top 3 --by user_002
   重点关注：李四是如何深化提问的

3️⃣ 下周验证
   目标：识别需求维度达到 75+ 分
   衡量：每通电话的问题深层追问 ≥ 5 个
   关键承诺：客户对问题的量化（成本、影响范围等）

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

GROW 教练计划
═════════════════════════════════════════════

📌 Goal（目标）
   本周聚焦 "识别需求" 和 "钩子"（后续跟进）维度
   目标分数：识别需求 75+，钩子 65+

📊 Reality（现状）
   识别需求：62 分（与销冠差 26 分）
   钩子：52 分（与销冠差 28 分）
   根本原因：提问不够深，后续跟进没有计划

🔍 Explore（探索）
   ✅ 行动 1：学习 SPIN 提问法
      资源：data/knowledge/methodologies/spin-selling-deep-dive.md
      练习：在下周的 5 通电话中应用 SPIN 框架
      
   ✅ 行动 2：电话前做计划，电话后做总结
      模板：
      • 电话前：这个客户可能的 3 个需求点？需要问什么？
      • 电话后：客户提了几个痛点？成本多少？下次何时跟进？
      
   ✅ 行动 3：观看销冠视频示范
      观看：user_002（李四）的识别需求高分通话 ×3
      记笔记：他们如何从表面需求挖掘到深层需求

✅ Will（承诺）
   下周验证目标：
   ├─ 识别需求维度评分 75+
   ├─ 每通电话 ≥ 5 个深层追问
   ├─ 获得 ≥ 1 个"需求承诺"（客户明确表达改变意愿）
   └─ 下周五报告本周的学习收获

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

通话转写文本
═════════════════════════════════════════════

[00:00] 销售员：Hi 李总，我是张三，...
[00:15] 客户：哦，你好啊，什么事？
[00:20] 销售员：我们是 XYZ 公司...
...
[15:32] 销售员：那咱们就先这样，有什么问题...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

数据来源：Clover AI 分析引擎 v2.0
生成时间：2026-05-05 14:35:42
```

---

## ❓ 常见问题

### Q1: 为什么转写的文本有错误？

**A**: 转写准确度通常在 95-98%，偶尔的错误是正常的。

**常见原因**：
- 通话中有背景噪音（办公室环境）
- 客户或销售员的口音特别重
- 专业术语不在转写模型的词库中

**解决方案**：
```bash
# 1. 手动修正转写
# 在 Dashboard 中点击转写文本，可以手动编辑

# 2. 标记术语
# 告诉系统这个词应该怎么转写
@clover correction:add "XXX 公司" "xxx_company"

# 3. 升级转写准确度
# 配置 TRANSCRIPTION_PROVIDER 为更高级的服务
```

### Q2: AI 评分不准确怎么办？

**A**: AI 是基于通话内容自动评分，有时候不够准确。

**处理流程**：
```bash
# 1. 查看分析报告，确认问题所在
@clover analysis [callId]

# 2. 如果觉得评分有问题，反馈
@clover feedback:score [callId] [dimension]
# 例：@clover feedback:score call_123 identify_needs

# 3. 说明原因
# "这通电话的识别需求应该高分，因为我深层追问了5次..."

# 4. 管理员会审核反馈，调整评分
```

### Q3: 怎样快速查看所有通话？

**A**: 使用以下命令：

```bash
# 查看我的所有通话
http://localhost:3000/api/dashboard/[userId]

# 按时间排序
http://localhost:3000/api/calls?sort=date&order=desc

# 按评分排序（看哪些通话表现最好/最差）
http://localhost:3000/api/calls?sort=score&order=desc
```

### Q4: 如何批量导出通话数据？

**A**: 使用管理员命令：

```bash
# 导出 CSV 格式
npm run scripts/export.js --format csv --start-date 2026-05-01 --end-date 2026-05-05

# 导出 JSON 格式
npm run scripts/export.js --format json --user-id user_001
```

### Q5: Hermes 集成中断了怎么办？

**A**: 检查以下几点：

```bash
# 1. 检查 Hermes Webhook 配置
# 在 Hermes 设置中查看回调是否启用

# 2. 检查网络连接
curl -X POST http://localhost:3001/webhook/hermes/call \
  -H "Content-Type: application/json" \
  -d '{"test": true}'

# 3. 查看 Clover 日志
tail -f logs/hermes-integration.log

# 4. 重启 Hermes 服务
npm run hermes
```

---

## 🔧 故障排除

### 故障 1：通话没有被转写

**症状**：通话完成了，但找不到转写文本

**排查步骤**：
```bash
# 1. 检查通话是否被记录
@clover admin:calls --status pending

# 2. 检查 Hermes 连接
curl http://localhost:3001/health
# 应该返回 {"status": "ok"}

# 3. 查看 Webhook 日志
tail -f logs/webhook.log | grep -i "hermes"

# 4. 检查 HERMES_SECRET 是否正确
# 对比 .env 中的值和 Hermes 中的设置是否一致
```

**解决方案**：
```bash
# 重新注册 Webhook
npm run scripts/hermes-webhook-register.js

# 或手动在 Hermes 中重新配置:
# POST http://your-domain:3001/webhook/hermes/call
# 确保 X-Hermes-Secret header 正确
```

### 故障 2：通话转写超时

**症状**：通话完成后很长时间还没有转写

**排查步骤**：
```bash
# 1. 检查 AI 模型状态
curl http://localhost:3000/api/health

# 2. 查看处理队列
@clover admin:queue --status

# 3. 检查错误日志
tail -f logs/error.log | grep -i "transcription"

# 4. 检查磁盘空间（如果启用了音频存储）
df -h data/audio
```

**解决方案**：
```bash
# 增加处理超时时间（如果网络较慢）
# 编辑 .env:
TRANSCRIPTION_TIMEOUT=120000  # 改为 2 分钟

# 或关闭音频存储节省空间
# 编辑 .env:
ENABLE_AUDIO_STORAGE=false
```

### 故障 3：AI 分析崩溃

**症状**：通话转写完成，但没有生成分析报告

**排查步骤**：
```bash
# 1. 检查 API Key
echo $ARK_API_KEY  # 不应该为空

# 2. 验证 API Key 是否有效
curl -H "Authorization: Bearer $ARK_API_KEY" \
  http://localhost:3000/api/health

# 3. 查看分析日志
tail -f logs/analysis.log

# 4. 尝试手动分析一条通话
npm run scripts/analyze-call.js --callId call_123
```

**解决方案**：
```bash
# 更新 API Key
# 编辑 .env，填入正确的 ARK_API_KEY

# 重启服务
npm run start:all

# 重新处理失败的通话
npm run scripts/reprocess-calls.js --status failed
```

### 故障 4：通知无法发送

**症状**：分析完成了，但没有收到钉钉/飞书通知

**排查步骤**：
```bash
# 1. 检查通知配置
grep -i "DINGTALK\|FEISHU" .env

# 2. 测试通知连接
curl -X POST $DINGTALK_WEBHOOK \
  -H "Content-Type: application/json" \
  -d '{"msgtype": "text", "text": {"content": "test"}}'

# 3. 查看通知日志
tail -f logs/notification.log

# 4. 检查权限
# 确保 Webhook URL 是有效的且当前用户有权限发送
```

**解决方案**：
```bash
# 重新获取 Webhook URL
# 在钉钉/飞书中创建新的 Bot

# 编辑 .env，填入新的 Webhook URL

# 重启服务
npm run start:all
```

---

## 📞 获取帮助

**遇到问题？**

1. **查看本手册**：大多数问题都有解答
2. **查看日志**：通常可以找到问题的根本原因
   ```bash
   tail -f logs/*.log
   ```
3. **联系支持**：
   - 📧 邮件：yeaphgel@gmail.com
   - 𝕏 Twitter：@yeaphgel
   - 📝 问题报告：创建 GitHub Issue

---

## 📋 快速参考

### 常用命令速查

```bash
# 查看完整命令列表
npm run help

# 查看特定命令的帮助
npm run help [command]

# 启动服务
npm run start:all          # 启动所有服务
npm run hermes             # 仅启动 Hermes 集成

# 管理和维护
npm run index              # 构建知识库索引
npm run clean              # 清理过期数据
npm run backup             # 备份数据库

# 开发和调试
npm run dev                # 开发模式（热重载）
npm run test               # 运行测试
npm run test:debug         # 调试测试
```

---

**Clover A-sales + Hermes** © 2024 by [yeaphgel](https://github.com/yeaphgel)  
Made with ❤️ for Sales Teams Worldwide
