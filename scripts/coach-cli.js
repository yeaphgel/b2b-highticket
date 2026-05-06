#!/usr/bin/env node
/**
 * coach-cli.js — 销冠教练系统CLI工具
 *
 * 用法:
 *   node coach-cli.js dashboard <userId>
 *   node coach-cli.js coach <userId>
 *   node coach-cli.js leaderboard [type]
 *   node coach-cli.js update-progress <userId> <dimensionKey> <score>
 */

const fs = require('fs');
const path = require('path');
const { getUserBadges, checkAndAward } = require('./badges');

const PROGRESS_DIR = path.join(__dirname, '..', 'data', 'progress');
const RANKINGS_DIR = path.join(PROGRESS_DIR, 'rankings');

// 确保目录存在
[PROGRESS_DIR, RANKINGS_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// ─── 工具函数 ─────────────────────────────────────────────────────

function getUserProgress(userId) {
  const file = path.join(PROGRESS_DIR, `${userId}.json`);
  if (!fs.existsSync(file)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(file, 'utf-8'));
}

function getFormattedLevel(avgScore) {
  if (avgScore >= 90) return { level: 5, name: '销售大师', emoji: '💎' };
  if (avgScore >= 75) return { level: 4, name: '销冠', emoji: '🏆' };
  if (avgScore >= 60) return { level: 3, name: '中级销售', emoji: '⭐' };
  if (avgScore >= 40) return { level: 2, name: '初级销售', emoji: '🚀' };
  return { level: 1, name: '销售新人', emoji: '👶' };
}

function colorize(text, color) {
  const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
  };
  return `${colors[color] || ''}${text}${colors.reset}`;
}

function printBox(title, content) {
  console.log('\n' + colorize('╔════════════════════════════════════════════════════════╗', 'cyan'));
  console.log(colorize('║', 'cyan') + ` ${title.padEnd(52)} ` + colorize('║', 'cyan'));
  console.log(colorize('╠════════════════════════════════════════════════════════╣', 'cyan'));
  if (Array.isArray(content)) {
    content.forEach(line => {
      console.log(colorize('║', 'cyan') + ` ${line.padEnd(52)} ` + colorize('║', 'cyan'));
    });
  } else {
    console.log(colorize('║', 'cyan') + ` ${content.padEnd(52)} ` + colorize('║', 'cyan'));
  }
  console.log(colorize('╚════════════════════════════════════════════════════════╝', 'cyan'));
}

// ─── 命令处理 ─────────────────────────────────────────────────────

const [, , command, userId, arg3, arg4] = process.argv;

if (!command) {
  console.log(`
${colorize('🎮 Clover A-sales 销冠教练系统 CLI', 'bright')}

用法:
  ${colorize('node coach-cli.js dashboard <userId>', 'green')}         查看用户仪表盘（终端彩色版）
  ${colorize('node coach-cli.js dashboard-md <userId>', 'green')}      查看仪表盘（聊天 Markdown 版）
  ${colorize('node coach-cli.js coach <userId>', 'green')}            查看GROW教练建议
  ${colorize('node coach-cli.js leaderboard [weekly|monthly]', 'green')}  查看排行榜
  ${colorize('node coach-cli.js update-progress <userId> <key> <score>', 'green')}  更新维度分数
  ${colorize('node coach-cli.js list-users', 'green')}               列出所有用户
  `);
  process.exit(0);
}

// ─── dashboard-md 命令（聊天窗口 Markdown 输出）──────────────────

if (command === 'dashboard-md') {
  if (!userId) {
    console.error('❌ 缺少 userId 参数');
    process.exit(1);
  }

  const progress = getUserProgress(userId);
  if (!progress) {
    console.log(`❌ 未找到用户 **${userId}** 的进度数据。\n\n首次使用需要先完成一次通话复盘，系统会自动创建你的档案。`);
    process.exit(0);
  }

  // 检查并颁发新徽章
  const newBadges = checkAndAward(progress);
  if (newBadges.length > 0) {
    fs.writeFileSync(path.join(PROGRESS_DIR, `${userId}.json`), JSON.stringify(progress, null, 2));
  }

  const scores = progress.dimensionScores || {};
  const vals = Object.values(scores);
  const avgScore = vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
  const levelInfo = getFormattedLevel(avgScore);

  const NEXT_LEVEL_SCORES = [0, 40, 60, 75, 90, 100];
  const nextThreshold = NEXT_LEVEL_SCORES[levelInfo.level] || 100;
  const prevThreshold = NEXT_LEVEL_SCORES[levelInfo.level - 1] || 0;
  const progress_pct = Math.round(((avgScore - prevThreshold) / (nextThreshold - prevThreshold)) * 100);
  const progressBar = '█'.repeat(Math.round(progress_pct / 10)) + '░'.repeat(10 - Math.round(progress_pct / 10));

  const DIMENSIONS = [
    { key: 'ice_breaking',           name: '破冰' },
    { key: 'identify_needs',         name: '识别需求' },
    { key: 'deliver_value',          name: '传达价值' },
    { key: 'build_trust',            name: '建立信任' },
    { key: 'trust_shaping',          name: '信任塑造' },
    { key: 'custom_solutions',       name: '定制解决' },
    { key: 'objection_handling',     name: '异议处理' },
    { key: 'close_deal',             name: '促成交易' },
    { key: 'relationship_maintenance', name: '关系维护' },
    { key: 'hooks',                  name: '钩子' },
  ];

  const weakest = DIMENSIONS
    .map(d => ({ ...d, score: scores[d.key] || 0 }))
    .sort((a, b) => a.score - b.score)
    .slice(0, 2);

  const badgeList = getUserBadges(progress);
  const badgesStr = badgeList.length > 0
    ? badgeList.map(b => `${b.icon} ${b.name}`).join(' · ')
    : '暂无徽章，继续加油！';

  const newBadgesStr = newBadges.length > 0
    ? `\n\n🎉 **本次新解锁徽章**：${newBadges.map(b => `${b.icon} ${b.name}`).join(' · ')}` : '';

  const lines = [
    `## 🏆 销售进度仪表盘 — ${userId}`,
    ``,
    `**等级**：${levelInfo.emoji} **${levelInfo.name}**（L${levelInfo.level}）`,
    `**升级进度**：${progressBar} ${progress_pct}%（当前 ${avgScore.toFixed(1)} 分 → 下一级需 ${nextThreshold} 分）`,
    `**积分**：${progress.points || 0} | **通话数**：${progress.callCount || 0} | **徽章**：${badgeList.length} 枚`,
    ``,
    `### 📊 十维度评分`,
    ``,
  ];

  DIMENSIONS.forEach(d => {
    const s = scores[d.key] || 0;
    const bar = '█'.repeat(Math.round(s)) + '░'.repeat(10 - Math.round(s));
    const tag = weakest.some(w => w.key === d.key) ? ' ← 待提升' : '';
    lines.push(`**${d.name.padEnd(6)}** \`${bar}\` ${s.toFixed(1)}/10${tag}`);
  });

  lines.push(``);
  lines.push(`### 🏅 已获徽章`);
  lines.push(``);
  lines.push(badgesStr);
  lines.push(``);
  lines.push(`### 🎯 本周建议`);
  lines.push(``);
  lines.push(`重点提升：**${weakest.map(w => w.name).join('** 和 **')}**`);
  lines.push(`目标：本周通话中刻意练习这两个维度，争取各提升 1-2 分。`);

  if (newBadgesStr) lines.push(newBadgesStr);

  console.log(lines.join('\n'));
  process.exit(0);
}

// ─── dashboard 命令 ──────────────────────────────────────────────

if (command === 'dashboard') {
  if (!userId) {
    console.error(colorize('❌ 缺少 userId 参数', 'red'));
    process.exit(1);
  }

  const progress = getUserProgress(userId);
  if (!progress) {
    console.error(colorize(`❌ 未找到用户 "${userId}" 的数据`, 'red'));
    process.exit(1);
  }

  // 检查并颁发新徽章
  const newBadges = checkAndAward(progress);
  if (newBadges.length > 0) {
    fs.writeFileSync(path.join(PROGRESS_DIR, `${userId}.json`), JSON.stringify(progress, null, 2));
    newBadges.forEach(b => console.log(colorize(`🎉 新徽章解锁：${b.icon} ${b.name} — ${b.desc}`, 'yellow')));
  }

  const avgScore = Object.values(progress.dimensionScores || {}).reduce((a, b) => a + b, 0) / 10;
  const levelInfo = getFormattedLevel(avgScore);
  const badgeList = getUserBadges(progress);

  printBox('📊 仪表盘', [
    `用户ID: ${userId}`,
    `等级: ${levelInfo.emoji} ${levelInfo.name} (L${levelInfo.level})`,
    `总分: ${avgScore.toFixed(1)}/10`,
    `积分: ${progress.points}`,
    `通话数: ${progress.callCount}`,
    `徽章数: ${badgeList.length}（${badgeList.map(b => b.icon).join('')}）`
  ]);

  console.log(colorize('\n📊 十维度评分:\n', 'blue'));
  const dimensions = [
    { key: 'ice_breaking', name: '破冰' },
    { key: 'identify_needs', name: '识别需求' },
    { key: 'deliver_value', name: '传达价值' },
    { key: 'build_trust', name: '建立信任' },
    { key: 'trust_shaping', name: '信任塑造' },
    { key: 'custom_solutions', name: '定制解决' },
    { key: 'objection_handling', name: '异议处理' },
    { key: 'close_deal', name: '促成交易' },
    { key: 'relationship_maintenance', name: '关系维护' },
    { key: 'hooks', name: '钩子' }
  ];

  dimensions.forEach(dim => {
    const score = progress.dimensionScores[dim.key] || 0;
    const bar = '█'.repeat(Math.round(score)) + '░'.repeat(10 - Math.round(score));
    const color = score >= 8 ? 'green' : score >= 6 ? 'blue' : score >= 4 ? 'yellow' : 'red';
    console.log(`  ${dim.name.padEnd(12)} ${colorize(bar, color)} ${score.toFixed(1)}/10`);
  });

  process.exit(0);
}

// ─── coach 命令 ──────────────────────────────────────────────────

if (command === 'coach') {
  if (!userId) {
    console.error(colorize('❌ 缺少 userId 参数', 'red'));
    process.exit(1);
  }

  const progress = getUserProgress(userId);
  if (!progress) {
    console.error(colorize(`❌ 未找到用户 "${userId}" 的数据`, 'red'));
    process.exit(1);
  }

  const avgScore = Object.values(progress.dimensionScores || {}).reduce((a, b) => a + b, 0) / 10;
  const levelInfo = getFormattedLevel(avgScore);

  // 找出最弱的维度
  const sorted = Object.entries(progress.dimensionScores)
    .sort((a, b) => a[1] - b[1])
    .slice(0, 3);

  const DIM_NAMES = {
    ice_breaking: '破冰', identify_needs: '识别需求', deliver_value: '传达价值',
    build_trust: '建立信任', trust_shaping: '信任塑造', custom_solutions: '定制解决',
    objection_handling: '异议处理', close_deal: '促成交易',
    relationship_maintenance: '关系维护', hooks: '钩子'
  };

  printBox('🎯 GROW教练建议', `${levelInfo.emoji} ${levelInfo.name} 水平`);

  console.log(colorize('\n📌 目标 (Goal)\n', 'bright'));
  console.log(`  提升${sorted.map(([k]) => DIM_NAMES[k]).join('、')}能力，特别关注${DIM_NAMES[sorted[0][0]]}`);
  console.log(`  预期改进: 本周维度平均分提升 2-3 分`);

  console.log(colorize('\n🔍 现状 (Reality)\n', 'bright'));
  console.log(`  整体分数: ${avgScore.toFixed(1)}/10`);
  console.log(`  最需改进: ${sorted.map(([k, v]) => `${DIM_NAMES[k]} (${v.toFixed(1)}分)`).join('、')}`);

  console.log(colorize('\n💡 选项 (Options)\n', 'bright'));
  sorted.forEach((item, idx) => {
    const dimName = DIM_NAMES[item[0]];
    console.log(`  ${idx + 1}. 专项训练: ${dimName}`);
    console.log(`     当前分数: ${item[1].toFixed(1)} → 目标: ${Math.min(item[1] + 3, 10).toFixed(1)}`);
  });

  console.log(colorize('\n✅ 行动 (Way Forward)\n', 'bright'));
  console.log(`  本周行动:`);
  console.log(`    • 周一-周三: 专项练习${DIM_NAMES[sorted[0][0]]}`);
  console.log(`    • 周四: 与团队成员进行同行评审`);
  console.log(`    • 周五: 总结本周改进点，制定下周计划`);
  console.log(`  下次复盘: 下周一`);

  process.exit(0);
}

// ─── leaderboard 命令 ──────────────────────────────────────────────

if (command === 'leaderboard') {
  const type = userId || 'weekly';
  const file = path.join(RANKINGS_DIR, `${type}_${new Date().toISOString().slice(0, 10)}.json`);

  if (!fs.existsSync(file)) {
    console.warn(colorize('⚠️  还没有排行榜数据，请运行 dashboard-api.js 后再试', 'yellow'));
    process.exit(0);
  }

  const rankings = JSON.parse(fs.readFileSync(file, 'utf-8'));

  printBox(`🏆 ${type === 'monthly' ? '月度' : '周度'}排行榜`, `Top ${Math.min(10, rankings.rankings?.length || 0)}`);

  console.log('\n排 用户ID              等级         分数   积分');
  console.log(colorize('─'.repeat(55), 'cyan'));

  (rankings.rankings || []).slice(0, 10).forEach((item, idx) => {
    const emoji = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '  ';
    const rankStr = `${item.rank}`.padEnd(2);
    const userStr = (item.userId || '未知').padEnd(18);
    const levelStr = (item.levelName || '').padEnd(12);
    const scoreStr = (item.avgScore?.toFixed(1) || '0').padStart(5);
    const pointsStr = (item.points || 0).toString().padStart(5);
    console.log(`${emoji}${rankStr} ${userStr} ${levelStr} ${scoreStr} ${pointsStr}`);
  });

  process.exit(0);
}

// ─── update-progress 命令 ──────────────────────────────────────────

if (command === 'update-progress') {
  if (!userId || !arg3 || !arg4) {
    console.error(colorize('❌ 缺少参数: node coach-cli.js update-progress <userId> <key> <score>', 'red'));
    process.exit(1);
  }

  const progress = getUserProgress(userId) || {
    userId,
    level: 1,
    points: 0,
    dimensionScores: {},
    callCount: 0
  };

  progress.dimensionScores[arg3] = Math.min(10, Math.max(0, parseFloat(arg4)));
  progress.updatedAt = new Date().toISOString();

  fs.writeFileSync(
    path.join(PROGRESS_DIR, `${userId}.json`),
    JSON.stringify(progress, null, 2),
    'utf-8'
  );

  console.log(colorize(`✅ 已更新 ${userId} 的 ${arg3} 为 ${arg4}`, 'green'));
  process.exit(0);
}

// ─── list-users 命令 ──────────────────────────────────────────────

if (command === 'list-users') {
  if (!fs.existsSync(PROGRESS_DIR)) {
    console.log(colorize('暂无用户数据', 'yellow'));
    process.exit(0);
  }

  const files = fs.readdirSync(PROGRESS_DIR).filter(f => f.endsWith('.json'));

  if (files.length === 0) {
    console.log(colorize('暂无用户数据', 'yellow'));
    process.exit(0);
  }

  printBox('👥 用户列表', `共 ${files.length} 个用户`);

  files.forEach(file => {
    const userId = file.replace('.json', '');
    const progress = JSON.parse(fs.readFileSync(path.join(PROGRESS_DIR, file), 'utf-8'));
    const avgScore = Object.values(progress.dimensionScores || {}).reduce((a, b) => a + b, 0) / 10 || 0;
    const levelInfo = getFormattedLevel(avgScore);
    console.log(`  ${levelInfo.emoji} ${userId.padEnd(20)} L${levelInfo.level} ${avgScore.toFixed(1)}/10`);
  });

  process.exit(0);
}

console.error(colorize(`❌ 未知命令: ${command}`, 'red'));
console.log(`\n使用 ${colorize('node coach-cli.js', 'green')} 查看帮助\n`);
process.exit(1);
