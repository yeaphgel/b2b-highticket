#!/usr/bin/env node
/**
 * memory.js — 客户记忆管理
 *
 * 用法（由 OpenClaw 调用）：
 *   node memory.js get "A客户"
 *   node memory.js save "A客户" '{"stage":"方案演示","contact":"张总",...}'
 *   node memory.js update "A客户" "今天沟通了预算，对方说 Q3 有采购计划"
 *   node memory.js list
 *   node memory.js delete "A客户"
 */

const fs   = require('fs');
const path = require('path');

const CLIENTS_DIR = path.join(__dirname, '..', 'data', 'clients');

// 确保目录存在
if (!fs.existsSync(CLIENTS_DIR)) {
  fs.mkdirSync(CLIENTS_DIR, { recursive: true });
}

// ── 工具函数 ──────────────────────────────────────────────────

/** 客户名 → 安全文件名 */
function safeFilename(name) {
  return name.replace(/[/\\?%*:|"<>]/g, '_').trim();
}

function clientPath(name) {
  return path.join(CLIENTS_DIR, `${safeFilename(name)}.json`);
}

function loadClient(name) {
  const file = clientPath(name);
  if (!fs.existsSync(file)) return null;
  try {
    return JSON.parse(fs.readFileSync(file, 'utf-8'));
  } catch {
    return null;
  }
}

function saveClient(name, data) {
  fs.writeFileSync(clientPath(name), JSON.stringify(data, null, 2), 'utf-8');
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

// ── 命令处理 ──────────────────────────────────────────────────

const [, , command, clientName, rawData] = process.argv;

if (!command) {
  console.error('用法: node memory.js <get|save|update|list|delete> [客户名] [JSON数据]');
  process.exit(1);
}

// ── list ──
if (command === 'list') {
  const files = fs.readdirSync(CLIENTS_DIR).filter(f => f.endsWith('.json'));
  if (files.length === 0) {
    console.log(JSON.stringify({ clients: [], message: '暂无客户记录' }));
  } else {
    const clients = files.map(f => {
      const data = JSON.parse(fs.readFileSync(path.join(CLIENTS_DIR, f), 'utf-8'));
      return {
        name: data.name,
        company: data.company || '未知',
        stage: data.stage || '未知阶段',
        updatedAt: data.updatedAt,
        nextAction: data.nextAction || '',
      };
    });
    // 按更新时间降序
    clients.sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
    console.log(JSON.stringify({ clients, total: clients.length }));
  }
  process.exit(0);
}

if (!clientName) {
  console.error('缺少客户名参数');
  process.exit(1);
}

// ── get ──
if (command === 'get') {
  const data = loadClient(clientName);
  if (!data) {
    console.log(JSON.stringify({
      found: false,
      name: clientName,
      message: `暂无"${clientName}"的记录，这是一个新客户。`,
    }));
  } else {
    console.log(JSON.stringify({ found: true, ...data }));
  }
  process.exit(0);
}

// ── save ──
if (command === 'save') {
  let incoming;
  try {
    incoming = JSON.parse(rawData || '{}');
  } catch {
    console.error('JSON 数据格式错误');
    process.exit(1);
  }

  const existing = loadClient(clientName) || {
    name: clientName,
    company: '',
    industry: '',
    contactPerson: '',
    stage: '初次接触',
    painPoints: [],
    keyInsights: [],
    nextAction: '',
    history: [],
    createdAt: today(),
  };

  // 合并字段（不覆盖 history）
  const { history: _, createdAt: __, ...rest } = incoming;
  const merged = {
    ...existing,
    ...rest,
    name: clientName,
    updatedAt: today(),
  };

  saveClient(clientName, merged);
  console.log(JSON.stringify({ success: true, message: `已保存"${clientName}"的基本信息`, data: merged }));
  process.exit(0);
}

// ── update（追加一条跟进记录）──
if (command === 'update') {
  const note = rawData || '';
  if (!note) {
    console.error('缺少跟进记录内容');
    process.exit(1);
  }

  const client = loadClient(clientName) || {
    name: clientName,
    company: '',
    industry: '',
    contactPerson: '',
    stage: '初次接触',
    painPoints: [],
    keyInsights: [],
    nextAction: '',
    history: [],
    createdAt: today(),
  };

  client.history = client.history || [];
  client.history.push({
    date: today(),
    note,
  });
  // 只保留最近 30 条
  if (client.history.length > 30) {
    client.history = client.history.slice(-30);
  }
  client.updatedAt = today();

  saveClient(clientName, client);
  console.log(JSON.stringify({
    success: true,
    message: `已记录"${clientName}"的跟进记录`,
    historyCount: client.history.length,
  }));
  process.exit(0);
}

// ── delete ──
if (command === 'delete') {
  const file = clientPath(clientName);
  if (!fs.existsSync(file)) {
    console.log(JSON.stringify({ success: false, message: `未找到"${clientName}"的记录` }));
  } else {
    fs.unlinkSync(file);
    console.log(JSON.stringify({ success: true, message: `已删除"${clientName}"的所有记录` }));
  }
  process.exit(0);
}

console.error(`未知命令: ${command}`);
process.exit(1);
