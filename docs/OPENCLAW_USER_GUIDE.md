# 🎮 Clover A-sales for OpenClaw - 用户手册

**目标用户**：OpenClaw 平台用户、销售团队、销售管理者  
**文档更新**：2026-05-05  
**支持邮箱**：yeaphgel@gmail.com

---

## 📚 目录

1. [快速开始](#快速开始)
2. [核心功能](#核心功能)
3. [常用命令](#常用命令)
4. [工作流程](#工作流程)
5. [数据解读](#数据解读)
6. [常见问题](#常见问题)
7. [故障排除](#故障排除)

---

## 🚀 快速开始

### 前置准备

✅ 已安装 OpenClaw 平台  
✅ 已安装 Clover A-sales（通过 `bash install-openclaw.sh`）  
✅ 配置了 `.env` 文件的 API Key  
✅ 服务已启动：`npm run start:all`

### 第一次使用（5分钟快速体验）

```bash
# 1. 在 OpenClaw 中添加 Clover Skill
Settings → Skills → Add Skill
├─ 名称: Clover A-sales
├─ 类型: Local Integration
├─ 端口: 3000
└─ Webhook: http://localhost:3000/webhook/openclaw

# 2. 在 OpenClaw 的 Skill Marketplace 中找到 Clover
# 或直接在聊天中输入以下命令

# 3. 查看你的个人仪表板
@clover dashboard
```

**预期结果**：Clover 会返回你的个人仪表板截图，包括：
- 📊 当前等级和总分
- 📈 十维度评分
- 🏆 徽章和成就

---

## 🎯 核心功能

### 1️⃣ 个人仪表板（Dashboard）

**命令**：
```bash
@clover dashboard [userId]
# 或
@clover dashboard  # 显示你自己的仪表板
```

**返回信息**：
```
🎮 仪表板 - 张三

等级: ⭐⭐ 初级销售 (L2)
总分: 58 / 100

十维度评分:
├─ 🎯 破冰: 70/100 ▰▰▰▰▰▰▰░░░ (进步 ↑5)
├─ 🔍 识别需求: 55/100 ▰▰▰▰▰░░░░░ (待提升)
├─ 💡 传达价值: 60/100 ▰▰▰▰▰▰░░░░
├─ 🤝 建立信任: 65/100 ▰▰▰▰▰▰▰░░░
└─ ...

徽章: 🏅 首次通话, 🏅 坚持者, 🏅 破冰高手

本周: 3 通电话 | 本月: 12 通电话
```

**解读指南**：
- **绿色上升箭头** ↑：这周有进步
- **红色下降箭头** ↓：这周有下滑
- **灰色箭头** →：保持稳定

### 2️⃣ 排行榜（Leaderboard）

**命令**：
```bash
@clover leaderboard [weekly|monthly|yearly]
# 示例
@clover leaderboard weekly   # 周排行
@clover leaderboard monthly  # 月排行
```

**返回信息**：
```
📊 周排行榜 (本周通话数)

🥇 第1名: 李四 (L3) - 5 通电话
   └─ 总分: 72 分 | 破冰: 85 | 识别需求: 78

🥈 第2名: 张三 (L2) - 3 通电话
   └─ 总分: 58 分 | 破冰: 70 | 识别需求: 55

🥉 第3名: 王五 (L1) - 2 通电话
   └─ 总分: 42 分 | 破冰: 58 | 识别需求: 40
```

**关键信息**：
- **周排行**：按这周的通话数排序（鼓励多跟进）
- **月排行**：按总分排序（鼓励质量）
- **年排行**：按长期表现排序（看谁更稳定）

### 3️⃣ GROW 教练建议（Coaching）

**命令**：
```bash
@clover coach [userId]
# 或
@clover coach  # 获取你自己的教练建议
```

**返回信息**：
```
🧠 GROW 教练建议 - 张三 (本周)

📌 Goal（目标）
   本周聚焦 "识别需求" 维度，目标分数 65+
   
📊 Reality（现状）
   当前 "识别需求" 评分 55 分
   与销冠差距: 33 分（销冠评分 88）
   
   数据对比:
   ├─ 你的平均提问数: 2.5 个/通话
   ├─ 销冠平均提问数: 6.2 个/通话
   └─ 差距: 需要增加提问深度和数量

🔍 Explore（探索）
   1️⃣ 学习销冠的提问话术
      "除了效率问题，还有其他痛点吗？"
      "这个问题对你的影响有多大？"
   
   2️⃣ 电话前准备
      列出这个客户的 3 个可能需求点
      准备 5 个深层追问题
   
   3️⃣ 电话后复盘
      记录你问了多少个问题
      是否触及了客户的核心需求

✅ Will（承诺）
   下周验证：
   ├─ "识别需求" 维度评分上升到 65+ 分
   ├─ 平均提问数达到 4+ 个/通话
   └─ 获得至少 1 个"需求承诺"（客户明确说出改变意愿）
```

**如何使用教练建议**：
1. **周一上午**：获取本周的 GROW 教练建议
2. **整周执行**：按照"Explore"的 3 个行动步骤做准备和复盘
3. **下周验证**：看看"Will"中的承诺是否达成

### 4️⃣ 通话搜索（Search）

**命令**：
```bash
@clover search [关键词]
# 示例
@clover search "预算"     # 搜索涉及预算的通话
@clover search "竞品"     # 搜索与竞品相关的通话
@clover search "成交"     # 搜索成交相关的通话
```

**使用场景**：
- 🔎 找出团队中如何处理"价格异议"的最好案例
- 🔎 找出销冠是如何识别客户需求的
- 🔎 找出常见的客户反对意见和成功回应

### 5️⃣ 获取深度分析（Insights）

**命令**：
```bash
@clover insights [分析类型] [参数]
# 示例
@clover insights bottleneck user_001    # 找出这位销售的卡关维度
@clover insights comparison user_001 user_002  # 对比两位销售
@clover insights improvement user_001  # 看这位销售的进步轨迹
```

**分析类型**：

| 类型 | 说明 | 示例 |
|------|------|------|
| `bottleneck` | 找出最低分的维度 | 发现某销售员缺乏"异议处理"能力 |
| `comparison` | 对比两人的能力差异 | 对比销冠和新人的破冰方式 |
| `improvement` | 看某人的进步轨迹 | 这个月是否在进步 |
| `recommendation` | 推荐学习对象 | 在"破冰"能力上，应该学谁 |

---

## 💬 常用命令列表

### 基础命令

```bash
# 查看帮助
@clover help
@clover help [命令名]  # 查看某个命令的详细说明

# 个人中心
@clover dashboard      # 我的仪表板
@clover profile        # 我的个人信息
@clover stats          # 我的统计数据
```

### 查看数据

```bash
# 排行榜
@clover leaderboard weekly      # 周排行
@clover leaderboard monthly     # 月排行
@clover leaderboard yearly      # 年排行

# 十维度
@clover dimensions              # 我的十维度详情
@clover dimension identify_needs  # 查看某个维度的详细分析

# 徽章和成就
@clover badges                  # 我的徽章
@clover achievements            # 我的成就
```

### 教练和建议

```bash
# GROW 教练
@clover coach                   # 我的本周教练建议
@clover coach user_001          # 查看别人的教练建议

# 搜索和学习
@clover search 破冰             # 搜索与破冰相关的通话
@clover search 成交  --top 3   # 找出最好的3个成交案例
@clover learn from user_001    # 学习某人的最佳实践

# 对标和分析
@clover compare with user_001  # 与某人对比我的能力
@clover gap analyze            # 分析我与销冠的差距
```

### 管理和设置（仅管理员）

```bash
# 数据管理
@clover admin:import [文件]    # 导入用户数据
@clover admin:reset            # 重置所有数据

# 配置
@clover admin:config get       # 查看配置
@clover admin:config set [参数] [值]  # 修改配置

# 系统
@clover admin:health           # 系统健康检查
@clover admin:logs             # 查看系统日志
```

---

## 📊 工作流程

### 每日工作流（销售员）

```
🌅 早上 (7:00-8:00)
  └─ 查看每日早报
     @clover briefing
  └─ 查看本周排行
     @clover leaderboard weekly
  
📞 工作时间 (8:00-17:00)
  └─ 进行通话
  └─ Hermes 自动录音和转写
  
🌆 下午 (16:00-17:00)
  └─ 查看通话复盘
     @clover analysis [callId]
  └─ 看看有没有新建议
  
🌙 晚上 (19:00-20:00)
  └─ 回顾本周 GROW 教练建议
     @clover coach
  └─ 准备明天的关键点
```

### 每周工作流（销售员）

```
📅 周一 (09:00-10:00)
  └─ 获取本周 GROW 教练建议
     @clover coach
  └─ 查看上周的排行和成绩
     @clover leaderboard weekly
  └─ 制定本周的改进计划
  
📅 周二-周五 (18:00)
  └─ 每天复盘
  └─ 按照 GROW 的 Explore 部分执行
  
📅 周五 (16:00-17:00)
  └─ 自我评估本周的改进
     "这周有没有达成 Will 中的承诺？"
  └─ 记录本周的学习点
  
📅 周末
  └─ 预习下周可能的客户
  └─ 学习销冠的案例
     @clover search [相关关键词]
```

### 每月工作流（管理者）

```
📅 月初 (1-3号)
  └─ 查看上月排行和成绩
     @clover leaderboard monthly
  └─ 分析团队的问题
     @clover insights bottleneck [整个团队]
  
📅 月中 (15号)
  └─ 选出本月的学习对象
  └─ 组织团队学习分享
  
📅 月末 (28-30号)
  └─ 评估月度成绩
  └─ 生成月度报告
  └─ 制定下月改进计划
```

---

## 📖 数据解读指南

### 等级系统（五级进阶）

| 等级 | 名称 | 总分范围 | 特征 | 目标 |
|-----|------|---------|------|------|
| L1 | 销售新人 | 0-40分 | 学习基础知识和话术 | 掌握 8 个通关步骤 |
| L2 | 初级销售 | 40-60分 | 掌握销售步骤和流程 | 能够独立完成销售周期 |
| L3 | 中级销售 | 60-75分 | 能够独立完成销售周期 | 能够指导他人，稳定成交 |
| L4 | 销冠 | 75-90分 | 能够指导他人，稳定成交 | 深化战略思维，开拓新方向 |
| L5 | 销售大师 | 90-100分 | 销售思想家，生态建设者 | 引领行业，建立方法论 |

**升级路径**：
- L1→L2：通话数 ≥20，基础维度 ≥50
- L2→L3：通话数 ≥40，平均分 ≥60
- L3→L4：通话数 ≥80，平均分 ≥75，且有指导过他人
- L4→L5：通话数 ≥150，平均分 ≥90，且有行业认可

### 十维度评分解读

**当前维度分数 < 50分**：这是你的明显弱项，需要重点改进

```
例如: 识别需求 = 45分

可能的问题:
❌ 提问不够深入（只问了表面需求）
❌ 没有量化客户的痛点（"我们有问题"→ 多大问题？成本多少？）
❌ 没有识别出隐性需求（客户自己还没意识到的问题）

改进方向:
✅ 使用 SPIN 提问法（情景题 → 困难题 → 暗示题）
✅ 每通电话至少问 3 个为什么
✅ 用数字量化客户的痛点
```

**当前维度分数 50-75分**：这是你的常规维度，有空间改进

```
例如: 破冰 = 65分

改进思路:
✅ 学习销冠的破冰开场（他们如何快速建立融洽？）
✅ 对标销冠: @clover compare with [销冠ID]
✅ 看销冠如何找到共同点、建立信任
```

**当前维度分数 > 75分**：这是你的优势维度，可以教别人

```
例如: 破冰 = 85分

你可以:
🏆 帮新人训练这个维度
🏆 在团队分享会上讲讲你的破冰技巧
🏆 成为这个维度的 Mentor
```

### 徽章系统

Clover 会自动颁发徽章来认可你的成就：

| 徽章 | 获得条件 | 意义 |
|-----|---------|------|
| 🏅 首次通话 | 完成第一通电话 | 开始了销售之旅 |
| 🏅 坚持者 | 连续 7 天有通话 | 持续行动者 |
| 🏅 破冰高手 | 破冰维度 ≥80 | 擅长初次沟通 |
| 🏅 需求掘金者 | 识别需求维度 ≥80 | 善于发现问题 |
| 🏅 说客 | 传达价值维度 ≥80 | 善于表达价值 |
| 🏅 信任使者 | 建立信任维度 ≥80 | 善于建立信任 |
| 🏅 成交者 | 促成交易维度 ≥80 | 善于推动成交 |
| 🏅 策略家 | 总分 ≥75 | 综合能力强 |
| 🏅 领导者 | 指导过 3 人升级 | 带领团队成长 |
| 🏅 传奇 | 总分 = 100 | 销售大师境界 |

---

## ❓ 常见问题

### Q1: 为什么我的维度分数下降了？

**A**: 有以下几种可能：

1. **通话质量下降** - 最近的通话可能表现不如之前
2. **维度权重变化** - 随着等级提升，权重会动态调整
3. **数据计算** - 新的通话数据被纳入平均分计算

**解决方案**：
```bash
# 查看最近的通话分析
@clover analysis recent

# 对比你最近和之前的通话
@clover compare --detail

# 获取改进建议
@clover coach
```

### Q2: 怎样快速提升某个维度的分数？

**A**: 有针对性地改进：

```bash
# 1. 了解你在这个维度的问题
@clover insights bottleneck [维度]

# 2. 学习销冠在这个维度的做法
@clover search [维度相关关键词] --top 3

# 3. 查看改进建议
@clover coach

# 4. 执行行动计划（整周坚持）

# 5. 下周验证改进
@clover dashboard  # 看分数有没有上升
```

**经验值**：通常坚持 1-2 周会看到明显改进。

### Q3: 排行榜的排名怎样计算？

**A**: 

- **周排行**：按本周通话数排序
  - 目的：鼓励多跟进客户
  - 如果通话数相同，则按该周平均分排序

- **月排行**：按总分（所有通话的平均分）排序
  - 目的：鼓励提升质量
  
- **年排行**：按长期稳定性排序
  - 考虑：总分 + 稳定性（波动小的排名高）

### Q4: GROW 教练建议每周都一样吗？

**A**: 不一样。Clover 会根据：
- 你上周的表现
- 你目前最低分的维度
- 整个团队的普遍问题

来生成**个性化的教练建议**。

### Q5: 我想学习销冠的方法怎么办？

**A**: 几种方式：

```bash
# 1. 查看销冠在某个维度的高分通话
@clover search [关键词] --by user_champion

# 2. 直接对标销冠
@clover compare with user_champion

# 3. 让系统推荐你的学习对象
@clover recommendation [维度]
# 返回："在'破冰'维度上，你应该学习 user_003（评分92）"

# 4. 安排一对一辅导
@clover mentor:request user_champion [维度]
```

### Q6: 如果我觉得评分不准确怎么办？

**A**: 可以反馈：

```bash
@clover feedback [callId]
# 内容: "这通电话的'识别需求'评分，我觉得应该高一些，因为..."

# 管理员会定期审核和调整
# 通常 1-2 个工作日会有回复
```

---

## 🔧 故障排除

### 问题 1: 无法连接到 Clover 服务

**症状**：输入 `@clover dashboard` 后没有反应

**解决步骤**：
```bash
# 1. 检查服务是否启动
npm run start:all

# 2. 检查端口是否在线
curl http://localhost:3000/api/health

# 3. 如果返回 {"status": "ok"}，说明服务正常

# 4. 检查 OpenClaw 中的 Skill 配置
Settings → Skills → Clover A-sales
# 确保 API 端口是 3000
```

### 问题 2: 数据显示不准确（与实际通话不符）

**症状**：评分比我预期的低；通话数不对

**解决步骤**：
```bash
# 1. 检查通话是否被正确记录
@clover admin:logs --filter "call_recorded"

# 2. 重新索引知识库
npm run index

# 3. 刷新缓存
@clover admin:cache clear

# 4. 重新计算用户数据
@clover admin:recalculate user_[yourId]
```

### 问题 3: GROW 教练建议不适用

**症状**："Explore"中的建议不符合你的实际情况

**解决步骤**：
```bash
# 1. 反馈这个建议
@clover feedback suggestion [suggestionId]

# 2. 告诉系统你的实际情况
@clover profile:update
# 填写你的销售类型（ToB/ToC）、客户类型等

# 3. 系统会根据你的情况优化建议
```

### 问题 4: 无法搜索到相关通话

**症状**：`@clover search` 返回"没有匹配的通话"

**解决步骤**：
```bash
# 1. 检查通话是否被录音和转写
@clover admin:transcription --status

# 2. 尝试用其他关键词搜索
@clover search "破冰"  # 更宽泛的搜索

# 3. 检查 Hermes 集成是否正常
@clover admin:hermes --status

# 4. 如果通话很新，等待 5-10 分钟再搜索（需要处理时间）
```

---

## 📞 获取帮助

**遇到问题？**

1. **查看本手册**：大多数问题都有解答
2. **查看 FAQ 命令**：`@clover faq`
3. **联系支持**：
   - 📧 邮件：yeaphgel@gmail.com
   - 𝕏 Twitter：@yeaphgel
   - 🐛 反馈 Bug：@clover feedback [描述]

---

**Clover A-sales** © 2024 by [yeaphgel](https://github.com/yeaphgel)  
Made with ❤️ for Sales Teams Worldwide
