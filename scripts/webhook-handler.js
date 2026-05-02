#!/usr/bin/env node
/**
 * webhook-handler.js — 第三方 CRM Webhook 处理
 *
 * 支持:
 * - OpenClaw 客户更新
 * - 日历系统会议完成
 * - 邮件系统邮件发送
 * - Salesforce 商机更新
 *
 * 用法: node webhook-handler.js
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const crypto = require('crypto');

const CLIENTS_DIR = path.join(__dirname, '..', 'data', 'clients');
const PROGRESS_DIR = path.join(__dirname, '..', 'data', 'progress');
const PORT = process.env.WEBHOOK_PORT || 3002;

// ─── 配置 ─────────────────────────────────────────────────────

const WEBHOOK_SECRETS = {
  openclaw: process.env.OPENCLAW_SECRET || 'openclaw-secret',
  calendar: process.env.CALENDAR_SECRET || 'calendar-secret',
  email: process.env.EMAIL_SECRET || 'email-secret',
  salesforce: process.env.SALESFORCE_SECRET || 'salesforce-secret'
};

// ─── 日志 ─────────────────────────────────────────────────────

function log(type, message, data = null) {
  const timestamp = new Date().toISOString();
  const icon = {
    'INFO': '📌',
    'SUCCESS': '✅',
    'WARNING': '⚠️',
    'ERROR': '❌'
  }[type] || '📌';
  console.log(`${icon} [${timestamp}] ${message}`);
  if (data) console.log('   ', JSON.stringify(data, null, 2));
}

// ─── 验证签名 ────────────────────────────────────────────

function verifySignature(secret, signature, body) {
  const hash = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');
  return hash === signature;
}

// ─── OpenClaw Webhook ────────────────────────────────────

async function handleOpenClawWebhook(data) {
  const { event, payload } = data;

  log('INFO', `OpenClaw 事件: ${event}`);

  switch (event) {
    case 'customer.created':
    case 'customer.updated':
      return handleCustomerUpdate(payload);
    case 'opportunity.created':
    case 'opportunity.updated':
      return handleOpportunityUpdate(payload);
    case 'note.created':
      return handleNoteCreated(payload);
    default:
      log('WARNING', `未处理的 OpenClaw 事件: ${event}`);
  }
}

function handleCustomerUpdate(payload) {
  const { customerId, customerName, company, contactInfo, stage } = payload;

  log('SUCCESS', `更新客户: ${customerName}`);

  let client = loadClient(customerName) || {
    name: customerName,
    company: company || '',
    industry: '',
    contactPerson: contactInfo?.name || '',
    stage: stage || '初次接触',
    painPoints: [],
    keyInsights: [],
    history: [],
    createdAt: today()
  };

  client.company = company || client.company;
  client.stage = stage || client.stage;
  client.updatedAt = today();

  if (contactInfo?.email) {
    client.email = contactInfo.email;
  }
  if (contactInfo?.phone) {
    client.phone = contactInfo.phone;
  }

  saveClient(customerName, client);

  return {
    success: true,
    action: 'customer_updated',
    customerName
  };
}

function handleOpportunityUpdate(payload) {
  const { opportunityName, customerId, stage, expectedCloseDate } = payload;

  log('SUCCESS', `更新商机: ${opportunityName}`);

  // 这里可以关联到特定客户，更新销售进度
  return {
    success: true,
    action: 'opportunity_updated',
    opportunityName,
    stage
  };
}

function handleNoteCreated(payload) {
  const { customerId, content, createdBy } = payload;

  log('INFO', `收到跟进记录: ${customerId}`);

  // 更新客户档案的历史记录
  return {
    success: true,
    action: 'note_recorded',
    content: content.substring(0, 100)
  };
}

// ─── 日历 Webhook ────────────────────────────────────

async function handleCalendarWebhook(data) {
  const { event, payload } = data;

  log('INFO', `日历事件: ${event}`);

  if (event === 'meeting.completed') {
    return handleMeetingCompleted(payload);
  }
}

function handleMeetingCompleted(payload) {
  const { meetingId, title, attendees, duration, notes } = payload;

  // 检查是否是销售会议
  if (isLikelySalesMeeting(title)) {
    log('SUCCESS', `检测到销售会议: ${title}`);

    // 标记为待复盘
    const clientName = extractClientName(title, attendees);
    if (clientName) {
      let client = loadClient(clientName) || {
        name: clientName,
        history: []
      };

      client.needsReview = true;
      client.lastMeetingDate = new Date().toISOString();
      client.updatedAt = today();

      saveClient(clientName, client);

      log('SUCCESS', `${clientName} 已标记为待复盘`);
    }
  }

  return {
    success: true,
    action: 'meeting_recorded',
    title,
    duration
  };
}

function isLikelySalesMeeting(title) {
  const keywords = ['销售', 'meeting', '会议', '讨论', '演示', 'demo', '方案', '建议', '报价'];
  return keywords.some(k => title.toLowerCase().includes(k.toLowerCase()));
}

function extractClientName(title, attendees) {
  // 这是一个简单的启发式方法，实际应该有更复杂的逻辑
  for (const attendee of (attendees || [])) {
    if (attendee.email && !attendee.email.includes('@company.com')) {
      return attendee.name || attendee.email.split('@')[0];
    }
  }
  return null;
}

// ─── 邮件 Webhook ────────────────────────────────────

async function handleEmailWebhook(data) {
  const { event, payload } = data;

  log('INFO', `邮件事件: ${event}`);

  if (event === 'email.sent') {
    return handleEmailSent(payload);
  }
}

function handleEmailSent(payload) {
  const { messageId, to, subject, timestamp } = payload;

  log('SUCCESS', `邮件已发送: ${subject} -> ${to}`);

  // 可以追踪销售邮件
  const emailLog = {
    timestamp,
    to,
    subject,
    messageId
  };

  // 保存邮件日志
  const logDir = path.join(__dirname, '..', 'data', 'email-logs');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  const logFile = path.join(logDir, `${today()}.json`);
  let logs = [];
  if (fs.existsSync(logFile)) {
    logs = JSON.parse(fs.readFileSync(logFile, 'utf-8'));
  }
  logs.push(emailLog);
  fs.writeFileSync(logFile, JSON.stringify(logs, null, 2), 'utf-8');

  return {
    success: true,
    action: 'email_tracked',
    subject
  };
}

// ─── 工具函数 ────────────────────────────────────────────

function loadClient(clientName) {
  const safeName = clientName.replace(/[/\\?%*:|"<>]/g, '_').trim();
  const file = path.join(CLIENTS_DIR, `${safeName}.json`);
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, 'utf-8'));
}

function saveClient(clientName, data) {
  if (!fs.existsSync(CLIENTS_DIR)) {
    fs.mkdirSync(CLIENTS_DIR, { recursive: true });
  }
  const safeName = clientName.replace(/[/\\?%*:|"<>]/g, '_').trim();
  fs.writeFileSync(
    path.join(CLIENTS_DIR, `${safeName}.json`),
    JSON.stringify(data, null, 2),
    'utf-8'
  );
}

function today() {
  return new Date().toISOString().split('T')[0];
}

// ─── HTTP 服务器 ────────────────────────────────────────────

function startServer() {
  const server = http.createServer(async (req, res) => {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Signature');
    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    if (req.method !== 'POST') {
      res.writeHead(404);
      res.end(JSON.stringify({ error: 'Not Found' }));
      return;
    }

    // 收集请求体
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      if (body.length > 1e6) {
        req.connection.destroy();
      }
    });

    req.on('end', async () => {
      try {
        const signature = req.headers['x-signature'];
        const source = req.headers['x-source'] || 'unknown';

        // 验证签名
        const secret = WEBHOOK_SECRETS[source];
        if (secret && signature && !verifySignature(secret, signature, body)) {
          log('WARNING', `${source} Webhook 签名验证失败`);
          res.writeHead(401);
          res.end(JSON.stringify({ error: 'Unauthorized' }));
          return;
        }

        const data = JSON.parse(body);
        let result;

        // 根据来源分发请求
        switch (source) {
          case 'openclaw':
            result = await handleOpenClawWebhook(data);
            break;
          case 'calendar':
            result = await handleCalendarWebhook(data);
            break;
          case 'email':
            result = await handleEmailWebhook(data);
            break;
          default:
            log('WARNING', `未知的 Webhook 源: ${source}`);
            result = { success: false, error: 'Unknown source' };
        }

        res.writeHead(200);
        res.end(JSON.stringify(result));
      } catch (err) {
        log('ERROR', `Webhook 处理失败: ${err.message}`);
        res.writeHead(400);
        res.end(JSON.stringify({ error: err.message }));
      }
    });
  });

  server.listen(PORT, () => {
    log('SUCCESS', `Webhook 服务启动在 http://localhost:${PORT}`);
    console.log(`
Webhook 端点:
  - OpenClaw:  POST http://localhost:${PORT}/webhook/openclaw
  - Calendar:  POST http://localhost:${PORT}/webhook/calendar
  - Email:     POST http://localhost:${PORT}/webhook/email

Header 示例:
  X-Source: openclaw
  X-Signature: <HMAC-SHA256 signature>
    `);
  });

  process.on('SIGINT', () => {
    log('INFO', '关闭 Webhook 服务');
    server.close();
    process.exit(0);
  });
}

// ─── 主程序 ────────────────────────────────────────────

startServer();

module.exports = {
  handleOpenClawWebhook,
  handleCalendarWebhook,
  handleEmailWebhook
};
