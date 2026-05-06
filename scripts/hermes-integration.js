#!/usr/bin/env node
/**
 * hermes-integration.js — Hermes AI 集成模块
 *
 * 功能:
 * - 接收语音转写和自动复盘
 * - 更新客户档案
 * - 触发 GROW 教练分析
 * - 定时通知
 *
 * 用法: node hermes-integration.js [--listen]
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const { execSync } = require('child_process');

const CLIENTS_DIR = path.join(__dirname, '..', 'data', 'clients');
const PROGRESS_DIR = path.join(__dirname, '..', 'data', 'progress');
const PORT = process.env.HERMES_PORT || 3001;

// ─── 配置 ─────────────────────────────────────────────────────

const AI_REVIEW_TEMPLATE = `
你是销售教练。请根据通话转写内容，分析销售人员在以下十个维度的表现，并给出改进建议。

十维度评分标准 (1-10分):
- 破冰 (Ice Breaking): 初次沟通和快速建立融洽度
- 识别需求 (Identify Needs): 发现客户真实需求和痛点
- 传达价值 (Deliver Value): 有效表达产品/方案的价值
- 建立信任 (Build Trust): 建立客户的信心和信任
- 信任塑造 (Trust Shaping): 深化和维持信任关系
- 定制解决 (Custom Solutions): 提供定制化的解决方案
- 异议处理 (Objection Handling): 有效应对客户异议
- 促成交易 (Close Deal): 推进交易成交
- 关系维护 (Relationship Maintenance): 维持长期客户关系
- 钩子 (Hooks): 后续跟进和持续联系

请输出JSON格式:
{
  "callSummary": "通话摘要",
  "dimensionScores": {
    "ice_breaking": 7,
    ...
  },
  "strengths": ["优势1", "优势2"],
  "improvements": ["改进1", "改进2"],
  "nextActions": ["后续行动1", "后续行动2"],
  "customerIntent": "high/medium/low"
}
`;

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

function getClientPath(clientName) {
  const safeName = clientName.replace(/[/\\?%*:|"<>]/g, '_').trim();
  return path.join(CLIENTS_DIR, `${safeName}.json`);
}

function loadClient(clientName) {
  const file = getClientPath(clientName);
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, 'utf-8'));
}

function saveClient(clientName, data) {
  if (!fs.existsSync(CLIENTS_DIR)) {
    fs.mkdirSync(CLIENTS_DIR, { recursive: true });
  }
  fs.writeFileSync(getClientPath(clientName), JSON.stringify(data, null, 2), 'utf-8');
}

function getProgress(userId) {
  const file = path.join(PROGRESS_DIR, `${userId}.json`);
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, 'utf-8'));
}

function saveProgress(userId, data) {
  if (!fs.existsSync(PROGRESS_DIR)) {
    fs.mkdirSync(PROGRESS_DIR, { recursive: true });
  }
  fs.writeFileSync(path.join(PROGRESS_DIR, `${userId}.json`), JSON.stringify(data, null, 2), 'utf-8');
}

function today() {
  return new Date().toISOString().split('T')[0];
}

// ─── 通话转写处理 ────────────────────────────────────────────

async function processCallTranscription(data) {
  const {
    callId,
    clientName,
    transcript,
    duration,
    timestamp,
    userId
  } = data;

  log('INFO', `处理通话: ${clientName} (${callId})`);

  try {
    // 1. 自动复盘
    const review = await generateAutoReview(transcript);
    log('SUCCESS', `${callName} 复盘完成`);

    // 2. 提取维度评分
    const scores = extractDimensionScores(review);
    log('SUCCESS', `维度评分已提取`);

    // 3. 更新客户档案
    updateClientProfile(clientName, {
      transcript,
      review,
      scores,
      duration,
      timestamp
    });
    log('SUCCESS', `${clientName} 档案已更新`);

    // 4. 更新用户进度
    if (userId) {
      updateUserProgress(userId, scores);
      log('SUCCESS', `${userId} 进度已更新`);
    }

    // 5. 触发 GROW 分析（如果数据足够）
    if (userId && shouldTriggerCoaching(userId)) {
      const coaching = generateGrowCoaching(userId);
      notifyCoaching(userId, coaching);
      log('SUCCESS', `${userId} 教练建议已生成`);
    }

    return {
      success: true,
      callId,
      clientName,
      review,
      scores
    };
  } catch (err) {
    log('ERROR', `处理通话失败: ${err.message}`);
    throw err;
  }
}

// ─── 自动复盘 ────────────────────────────────────────────

async function generateAutoReview(transcript) {
  try {
    // 这里应该调用 AI API（Claude, ChatGPT 等）
    // 这是一个模拟实现
    const mockReview = {
      callSummary: '讨论了产品功能和价格',
      dimensionScores: {
        ice_breaking: 6,
        identify_needs: 7,
        deliver_value: 6,
        build_trust: 7,
        trust_shaping: 5,
        custom_solutions: 6,
        objection_handling: 6,
        close_deal: 5,
        relationship_maintenance: 6,
        hooks: 7
      },
      strengths: ['清晰表达', '积极倾听'],
      improvements: ['更深入的需求挖掘', '更强的价值传达'],
      nextActions: ['发送产品资料', '安排下次会议'],
      customerIntent: 'medium'
    };

    return mockReview;
  } catch (err) {
    log('ERROR', `自动复盘失败: ${err.message}`);
    throw err;
  }
}

function extractDimensionScores(review) {
  return review.dimensionScores || {};
}

// ─── 客户档案更新 ────────────────────────────────────────────

function updateClientProfile(clientName, callData) {
  let client = loadClient(clientName) || {
    name: clientName,
    company: '',
    industry: '',
    stage: '初次接触',
    painPoints: [],
    keyInsights: [],
    history: [],
    createdAt: today()
  };

  // 添加通话记录
  client.history = client.history || [];
  client.history.push({
    date: today(),
    callId: callData.timestamp || today(),
    transcript: callData.transcript,
    review: callData.review,
    dimensionScores: callData.scores,
    duration: callData.duration
  });

  // 只保留最近 30 条
  if (client.history.length > 30) {
    client.history = client.history.slice(-30);
  }

  // 更新最后通话时间
  client.latestCallDate = callData.timestamp || today();
  client.updatedAt = today();

  // 更新阶段（基于 customer intent）
  if (callData.review?.customerIntent === 'high') {
    client.stage = '意向客户';
  } else if (callData.review?.customerIntent === 'medium') {
    client.stage = '沟通中';
  }

  saveClient(clientName, client);
}

// ─── 用户进度更新 ────────────────────────────────────────────

function updateUserProgress(userId, scores) {
  let progress = getProgress(userId) || {
    userId,
    level: 1,
    points: 0,
    dimensionScores: {},
    callCount: 0,
    createdAt: today()
  };

  // 更新维度评分（运行平均）
  Object.entries(scores).forEach(([key, score]) => {
    const oldScore = progress.dimensionScores[key] || 5;
    progress.dimensionScores[key] = (oldScore + score) / 2;
  });

  // 更新通话数
  progress.callCount = (progress.callCount || 0) + 1;

  // 计算平均分
  const avgScore = Object.values(progress.dimensionScores || {})
    .reduce((a, b) => a + b, 0) / 10;

  // 计算积分
  progress.points = Math.round(avgScore * 100);

  // 计算等级
  if (avgScore >= 90) progress.level = 5;
  else if (avgScore >= 75) progress.level = 4;
  else if (avgScore >= 60) progress.level = 3;
  else if (avgScore >= 40) progress.level = 2;
  else progress.level = 1;

  progress.updatedAt = today();

  saveProgress(userId, progress);
}

// ─── 教练触发 ────────────────────────────────────────────

function shouldTriggerCoaching(userId) {
  const progress = getProgress(userId);
  if (!progress) return false;

  // 至少有 5 通通话记录才触发
  return (progress.callCount || 0) >= 5 && (progress.callCount % 5 === 0);
}

function generateGrowCoaching(userId) {
  try {
    // 调用 grow-coach.js
    const result = execSync(`node ${path.join(__dirname, 'grow-coach.js')} ${userId}`, {
      encoding: 'utf-8'
    });
    return JSON.parse(result);
  } catch (err) {
    log('WARNING', `生成 GROW 分析失败: ${err.message}`);
    return null;
  }
}

// ─── 通知系统 ────────────────────────────────────────────

function notifyCoaching(userId, coaching) {
  if (!coaching) return;

  const dingtalkWebhook = process.env.DINGTALK_WEBHOOK;
  const feishuWebhook = process.env.FEISHU_WEBHOOK;

  const message = `
🎯 ${userId} 的周度 GROW 分析已生成

📌 目标: ${coaching.growFramework?.goal?.weeklyTarget}
🔍 现状: 平均分 ${coaching.userLevel?.avgScore}/10
💡 选项: ${coaching.growFramework?.options?.topImprovementAreas?.length || 0} 个改进方向
✅ 行动: 下周一开始执行

点击查看详情: http://localhost:3000/dashboard?userId=${userId}
  `;

  // 这里可以实现钉钉/飞书通知
  log('INFO', `${userId} 的教练通知已准备`);
}

// ─── HTTP 服务器 ────────────────────────────────────────────

function startServer() {
  const server = http.createServer((req, res) => {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    if (req.method === 'POST' && req.url === '/webhook/hermes/call') {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      req.on('end', async () => {
        try {
          const data = JSON.parse(body);
          const result = await processCallTranscription(data);
          res.writeHead(200);
          res.end(JSON.stringify(result));
        } catch (err) {
          log('ERROR', `Webhook 处理失败: ${err.message}`);
          res.writeHead(400);
          res.end(JSON.stringify({ error: err.message }));
        }
      });
      return;
    }

    if (req.url === '/health') {
      res.writeHead(200);
      res.end(JSON.stringify({ status: 'ok', service: 'hermes-integration' }));
      return;
    }

    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Not Found' }));
  });

  const HOST = process.env.HOST || '0.0.0.0';
  server.listen(PORT, HOST, () => {
    const displayHost = HOST === '0.0.0.0' ? 'localhost' : HOST;
    log('SUCCESS', `Hermes 集成服务启动在 http://${displayHost}:${PORT}`);
    log('INFO', `本地访问: http://localhost:${PORT}/health`);
    if (HOST === '0.0.0.0') {
      log('INFO', `外网访问: http://{你的服务器IP}:${PORT}/health`);
    }
    log('INFO', `Webhook 地址: POST http://${displayHost}:${PORT}/webhook/hermes/call`);
  });

  process.on('SIGINT', () => {
    log('INFO', '关闭服务');
    server.close();
    process.exit(0);
  });
}

// ─── 主程序 ────────────────────────────────────────────

const args = process.argv.slice(2);

if (args.includes('--listen') || args.length === 0) {
  startServer();
} else {
  log('INFO', 'Hermes 集成模块已加载');
}

module.exports = {
  processCallTranscription,
  generateAutoReview,
  updateClientProfile,
  updateUserProgress
};
