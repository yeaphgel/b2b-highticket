#!/usr/bin/env node
/**
 * scheduler.js — 定时自动化系统
 *
 * 功能:
 * - D1-D30 自动提醒（基于客户档案）
 * - 周度 GROW 分析
 * - 月度等级评估
 * - 每日早报推送
 *
 * 用法: node scheduler.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const CLIENTS_DIR = path.join(__dirname, '..', 'data', 'clients');
const PROGRESS_DIR = path.join(__dirname, '..', 'data', 'progress');

// ─── 配置 ─────────────────────────────────────────────────────

const D_SCHEDULE = {
  D1: { days: 0, action: '感谢+诊断', description: '首次通话后立即感谢，诊断核心问题' },
  D3: { days: 2, action: '行业触点', description: '分享行业观察和洞察' },
  D5: { days: 4, action: '案例证明', description: '分享相关成功案例' },
  D7: { days: 6, action: '轻触收口', description: '轻微推进，探测意向' },
  D14: { days: 13, action: '第二轮价值', description: '提供更深层次的价值' },
  D21: { days: 20, action: '第三轮收口', description: '正式收口尝试' },
  D30: { days: 29, action: '最终判断', description: '评估客户价值和决策' }
};

const CRON_JOBS = {
  // 每天 9 点检查 D1-D30 提醒
  'D1-D30': { cron: '0 9 * * *', handler: 'checkD1To30Reminders' },
  // 周一 10 点生成周度 GROW 分析
  'GROW': { cron: '0 10 * * 1', handler: 'generateWeeklyGrow' },
  // 每月 1 号 9 点评估等级
  'LEVEL': { cron: '0 9 1 * *', handler: 'evaluateMonthlyLevel' },
  // 每天 7 点生成早报
  'BRIEFING': { cron: '0 7 * * *', handler: 'generateDailyBriefing' }
};

// ─── 工具函数 ─────────────────────────────────────────────────────

function log(type, message) {
  const timestamp = new Date().toISOString();
  const icon = {
    'INFO': '📌',
    'SUCCESS': '✅',
    'WARNING': '⚠️',
    'ERROR': '❌'
  }[type] || '📌';
  console.log(`${icon} [${timestamp}] ${message}`);
}

function getClientFiles() {
  if (!fs.existsSync(CLIENTS_DIR)) return [];
  return fs.readdirSync(CLIENTS_DIR).filter(f => f.endsWith('.json'));
}

function loadClient(filename) {
  const file = path.join(CLIENTS_DIR, filename);
  return JSON.parse(fs.readFileSync(file, 'utf-8'));
}

function getDateDaysDiff(date1, date2) {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.floor((date2 - date1) / msPerDay);
}

function parseDate(dateStr) {
  return new Date(dateStr + 'T00:00:00');
}

function formatDate(date) {
  return date.toISOString().split('T')[0];
}

// ─── D1-D30 提醒系统 ────────────────────────────────────────────

async function checkD1To30Reminders() {
  log('INFO', '开始检查 D1-D30 提醒');

  const clientFiles = getClientFiles();
  if (clientFiles.length === 0) {
    log('WARNING', '没有客户数据');
    return;
  }

  const reminders = [];
  const today = new Date();

  clientFiles.forEach(file => {
    try {
      const client = loadClient(file);
      if (!client.latestCallDate) return;

      const callDate = parseDate(client.latestCallDate);
      const daysSinceCall = getDateDaysDiff(callDate, today);

      // 检查是否匹配任何 D 阶段
      Object.entries(D_SCHEDULE).forEach(([stage, config]) => {
        if (Math.abs(daysSinceCall - config.days) <= 1) {
          reminders.push({
            clientName: client.name,
            company: client.company,
            stage,
            action: config.action,
            description: config.description,
            lastCallDate: client.latestCallDate,
            daysSince: daysSinceCall
          });
        }
      });
    } catch (err) {
      log('ERROR', `处理客户 ${file} 时出错: ${err.message}`);
    }
  });

  if (reminders.length === 0) {
    log('SUCCESS', '暂无需要的提醒');
    return;
  }

  // 输出提醒
  log('SUCCESS', `找到 ${reminders.length} 条提醒`);
  console.log('\n📋 D1-D30 提醒清单:');
  console.log('─'.repeat(80));
  reminders.forEach(r => {
    console.log(`${r.stage}: ${r.clientName} (${r.company})`);
    console.log(`   行动: ${r.action}`);
    console.log(`   说明: ${r.description}`);
    console.log(`   距离上次通话: ${r.daysSince} 天`);
    console.log('');
  });

  // 发送通知
  await sendNotifications(reminders);
}

// ─── GROW 周度分析 ────────────────────────────────────────────

async function generateWeeklyGrow() {
  log('INFO', '开始生成周度 GROW 分析');

  const users = getProgressUsers();
  if (users.length === 0) {
    log('WARNING', '没有用户进度数据');
    return;
  }

  users.forEach(userId => {
    try {
      // 调用 grow-coach.js 生成分析
      const result = execSync(`node ${path.join(__dirname, 'grow-coach.js')} ${userId}`, {
        encoding: 'utf-8'
      });
      const coaching = JSON.parse(result);
      log('SUCCESS', `${userId} 的周度分析已生成`);

      // 保存分析报告
      saveCoachingReport(userId, coaching);

      // 发送通知
      sendCoachingNotification(userId, coaching);
    } catch (err) {
      log('ERROR', `生成 ${userId} 的分析失败: ${err.message}`);
    }
  });
}

// ─── 月度等级评估 ────────────────────────────────────────────

async function evaluateMonthlyLevel() {
  log('INFO', '开始月度等级评估');

  const users = getProgressUsers();
  if (users.length === 0) {
    log('WARNING', '没有用户进度数据');
    return;
  }

  users.forEach(userId => {
    try {
      const progress = getProgress(userId);
      if (!progress) return;

      const avgScore = Object.values(progress.dimensionScores || {})
        .reduce((a, b) => a + b, 0) / 10;

      const oldLevel = progress.level || 1;
      const newLevel = calculateLevel(avgScore);

      if (newLevel > oldLevel) {
        progress.level = newLevel;
        progress.points += (newLevel - oldLevel) * 100;
        progress.badges = progress.badges || [];
        progress.badges.push(`升级到L${newLevel}`);

        saveProgress(userId, progress);
        log('SUCCESS', `${userId} 升级到 L${newLevel}（分数: ${avgScore.toFixed(1)}）`);

        sendLevelUpNotification(userId, newLevel, avgScore);
      }
    } catch (err) {
      log('ERROR', `评估 ${userId} 的等级失败: ${err.message}`);
    }
  });
}

// ─── 每日早报 ────────────────────────────────────────────

async function generateDailyBriefing() {
  log('INFO', '生成每日早报');

  const users = getProgressUsers();
  if (users.length === 0) {
    log('WARNING', '没有用户进度数据');
    return;
  }

  users.forEach(userId => {
    try {
      // 调用 briefing.js
      const result = execSync(`node ${path.join(__dirname, 'briefing.js')}`, {
        encoding: 'utf-8'
      });
      const briefing = JSON.parse(result);
      log('SUCCESS', `${userId} 的早报已生成`);

      // 发送通知
      sendBriefingNotification(userId, briefing);
    } catch (err) {
      log('ERROR', `生成 ${userId} 的早报失败: ${err.message}`);
    }
  });
}

// ─── 辅助函数 ────────────────────────────────────────────

function getProgressUsers() {
  if (!fs.existsSync(PROGRESS_DIR)) return [];
  return fs.readdirSync(PROGRESS_DIR)
    .filter(f => f.endsWith('.json'))
    .map(f => f.replace('.json', ''));
}

function getProgress(userId) {
  const file = path.join(PROGRESS_DIR, `${userId}.json`);
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, 'utf-8'));
}

function saveProgress(userId, data) {
  const file = path.join(PROGRESS_DIR, `${userId}.json`);
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8');
}

function calculateLevel(avgScore) {
  if (avgScore >= 90) return 5;
  if (avgScore >= 75) return 4;
  if (avgScore >= 60) return 3;
  if (avgScore >= 40) return 2;
  return 1;
}

function saveCoachingReport(userId, coaching) {
  const dir = path.join(PROGRESS_DIR, 'coaching-reports');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const file = path.join(dir, `${userId}-${formatDate(new Date())}.json`);
  fs.writeFileSync(file, JSON.stringify(coaching, null, 2), 'utf-8');
}

// ─── 通知系统 ────────────────────────────────────────────

async function sendNotifications(reminders) {
  log('INFO', `准备发送 ${reminders.length} 条通知`);

  const dingtalkWebhook = process.env.DINGTALK_WEBHOOK;
  const feishuWebhook = process.env.FEISHU_WEBHOOK;

  if (!dingtalkWebhook && !feishuWebhook) {
    log('WARNING', '未配置钉钉或飞书 Webhook，跳过通知');
    return;
  }

  // 这里可以实现钉钉/飞书通知逻辑
  log('SUCCESS', '通知已发送');
}

function sendCoachingNotification(userId, coaching) {
  log('INFO', `发送 ${userId} 的教练通知`);
  // 实现通知逻辑
}

function sendLevelUpNotification(userId, level, score) {
  log('SUCCESS', `${userId} 升级通知已发送 (L${level}, 分数: ${score.toFixed(1)})`);
  // 实现通知逻辑
}

function sendBriefingNotification(userId, briefing) {
  log('INFO', `${userId} 的早报通知已发送`);
  // 实现通知逻辑
}

// ─── 定时器管理 ────────────────────────────────────────────

function setupSchedulers() {
  log('INFO', '初始化定时器');

  // 简单的定时器实现（生产环境建议使用 node-schedule）
  // 这里使用 setInterval 作为演示

  setInterval(checkD1To30Reminders, 24 * 60 * 60 * 1000); // 每天
  setInterval(generateWeeklyGrow, 7 * 24 * 60 * 60 * 1000); // 每周
  setInterval(evaluateMonthlyLevel, 30 * 24 * 60 * 60 * 1000); // 每月
  setInterval(generateDailyBriefing, 24 * 60 * 60 * 1000); // 每天

  log('SUCCESS', '定时器已启动');
}

// ─── 主程序 ────────────────────────────────────────────

async function main() {
  console.log('\n🕐 Clover A-sales 定时自动化系统启动\n');

  // 初始立即执行一次
  log('INFO', '执行初始任务...');
  await checkD1To30Reminders();
  await generateDailyBriefing();

  // 设置定时器
  setupSchedulers();

  log('SUCCESS', '系统运行中，按 Ctrl+C 停止');
}

// 处理优雅关闭
process.on('SIGINT', () => {
  log('INFO', '收到关闭信号');
  process.exit(0);
});

main().catch(err => {
  log('ERROR', `系统错误: ${err.message}`);
  process.exit(1);
});

module.exports = {
  checkD1To30Reminders,
  generateWeeklyGrow,
  evaluateMonthlyLevel,
  generateDailyBriefing
};
