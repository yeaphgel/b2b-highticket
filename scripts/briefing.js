#!/usr/bin/env node
/**
 * briefing.js — 每日销售早报（7 条）
 *
 * 用法（由 OpenClaw 调用）：
 *   node briefing.js
 *   node briefing.js --count 5      # 自定义条数
 *
 * 从 data/index.json 里随机抽取片段，
 * 不重复，按来源分散（不同书/文章各取 1-2 条）。
 */

const fs   = require('fs');
const path = require('path');

const INDEX_FILE = path.join(__dirname, '..', 'data', 'index.json');
const COUNT_ARG  = process.argv.indexOf('--count');
const COUNT      = COUNT_ARG !== -1 ? parseInt(process.argv[COUNT_ARG + 1], 10) : 7;

if (!fs.existsSync(INDEX_FILE)) {
  console.log(JSON.stringify({
    error: true,
    message: '知识库索引不存在，请先运行 node scripts/index.js 建立索引',
  }));
  process.exit(1);
}

const indexData = JSON.parse(fs.readFileSync(INDEX_FILE, 'utf-8'));
const chunks = indexData.chunks || [];

if (chunks.length === 0) {
  console.log(JSON.stringify({ error: true, message: '知识库为空' }));
  process.exit(1);
}

// ── 按来源分组，尽量分散 ──────────────────────────────────────

function formatSourceName(filename) {
  let name = filename;
  name = name.replace(/\.(md|txt|pdf)$/i, '');
  name = name.replace(/[-_]/g, ' ');
  // 删除常见无意义前缀
  name = name.replace(/^(ai大纲|大纲|outline)\s*/i, '');
  name = name.replace(/\s+(ai大纲|大纲|outline)$/i, '');
  return name.trim() || filename;
}

/** 用当天日期作为随机种子，保证同一天看到相同的早报 */
function seededRandom(seed) {
  let s = seed;
  return function () {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

const dateStr  = new Date().toISOString().slice(0, 10).replace(/-/g, '');
const rand     = seededRandom(parseInt(dateStr, 10));

// 按来源归组
const bySource = {};
for (const chunk of chunks) {
  const src = chunk.source || 'unknown';
  if (!bySource[src]) bySource[src] = [];
  bySource[src].push(chunk);
}

const sources = Object.keys(bySource);

// 打乱来源顺序
const shuffledSources = sources
  .map(s => ({ s, r: rand() }))
  .sort((a, b) => a.r - b.r)
  .map(x => x.s);

// 从每个来源轮流取块，直到够 COUNT 条
const selected = [];
let round = 0;
outer: while (selected.length < COUNT) {
  for (const src of shuffledSources) {
    const pool = bySource[src];
    // 从该来源按 round 轮次取一条
    const idx = Math.floor(rand() * pool.length);
    const chunk = pool[idx];
    // 避免重复内容
    if (!selected.find(c => c.content === chunk.content)) {
      selected.push(chunk);
      if (selected.length >= COUNT) break outer;
    }
  }
  round++;
  if (round > 10) break; // 防死循环
}

// ── 格式化输出 ──────────────────────────────────────────────

const today = new Date().toLocaleDateString('zh-CN', {
  year: 'numeric', month: 'long', day: 'numeric', weekday: 'long',
});

const items = selected.map((chunk, i) => ({
  no: i + 1,
  source: chunk.docTitle || formatSourceName(chunk.source || ''),
  section: chunk.sectionTitle || '',
  content: chunk.content,
}));

console.log(JSON.stringify({
  date: today,
  count: items.length,
  items,
}));
