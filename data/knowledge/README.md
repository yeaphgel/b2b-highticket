# 知识库说明

把你的销售学习资料放在这个目录下，支持 `.md` 格式。

## 推荐的文件组织方式

```
knowledge/
├── books/                    ← 书籍内容（从微信读书导出的笔记/热门标注）
│   ├── spin-sales.md         ← SPIN 销售（尼尔·雷克汉姆）
│   ├── sales-army.md         ← 销售铁军（贺学友）
│   └── new-sales.md          ← 新销售（崔建中）
├── articles/                 ← 公众号文章（粘贴或复制过来）
│   ├── price-objection.md    ← 价格异议处理
│   └── closing-tips.md       ← 促成签单技巧
└── sop/                      ← 你自己整理的销售 SOP
    └── my-sales-process.md   ← 个人销售流程
```

## Markdown 格式建议

好的格式让搜索效果更准确：

```markdown
# 书名 / 文章标题

## 第一章：章节标题

核心内容写在这里，每段不要太长。
用换行分开不同的知识点。

## 第二章：另一个章节

继续写...
```

## 内容来源建议

| 来源 | 获取方式 |
|------|---------|
| 微信读书书籍 | 安装「微信读书工具箱」Chrome插件，导出「热门标注」为 Markdown |
| 微信公众号文章 | 直接复制文章内容，粘贴为 Markdown 文件 |
| 自己的经验总结 | 直接写 Markdown，用标题分段 |

## 更新知识库

每次添加或修改文件后，在 OpenClaw 里运行：

```bash
cd ~/skills/tob-sales-assistant/scripts && node index.js
```

大约需要 1-3 分钟（取决于文件数量）。
