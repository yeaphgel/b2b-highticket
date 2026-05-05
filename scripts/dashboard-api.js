#!/usr/bin/env node
/**
 * dashboard-api.js — 销冠教练系统仪表盘API
 *
 * 提供RESTful API端点用于游戏化仪表盘
 * 用法: node dashboard-api.js [port]
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const url = require('url');

const PORT = process.env.DASHBOARD_PORT || process.argv[2] || 3000;
const CLIENTS_DIR = path.join(__dirname, '..', 'data', 'clients');
const PROGRESS_DIR = path.join(__dirname, '..', 'data', 'progress');
const RANKINGS_DIR = path.join(PROGRESS_DIR, 'rankings');

// 确保目录存在
[PROGRESS_DIR, RANKINGS_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// ─── 十维度权重配置 ─────────────────────────────────────────────────────

const DIMENSIONS = [
  { name: '破冰', baseWeight: 0.15, key: 'ice_breaking' },
  { name: '识别需求', baseWeight: 0.20, key: 'identify_needs' },
  { name: '传达价值', baseWeight: 0.15, key: 'deliver_value' },
  { name: '建立信任', baseWeight: 0.15, key: 'build_trust' },
  { name: '信任塑造', baseWeight: 0.10, key: 'trust_shaping' },
  { name: '定制解决', baseWeight: 0.10, key: 'custom_solutions' },
  { name: '异议处理', baseWeight: 0.10, key: 'objection_handling' },
  { name: '促成交易', baseWeight: 0.05, key: 'close_deal' },
  { name: '关系维护', baseWeight: 0.05, key: 'relationship_maintenance' },
  { name: '钩子', baseWeight: 0.05, key: 'hooks' }
];

const LEVELS = [
  { level: 1, name: '销售新人', minScore: 0, maxScore: 40, color: '#CD7F32' },
  { level: 2, name: '初级销售', minScore: 40, maxScore: 60, color: '#C0C0C0' },
  { level: 3, name: '中级销售', minScore: 60, maxScore: 75, color: '#FFD700' },
  { level: 4, name: '销冠', minScore: 75, maxScore: 90, color: '#E5E4E2' },
  { level: 5, name: '销售大师', minScore: 90, maxScore: 100, color: '#4169E1' }
];

// ─── 工具函数 ─────────────────────────────────────────────────────────

function getUserId(clientName) {
  return clientName.replace(/[/\\?%*:|"<>]/g, '_').trim();
}

function getUserProgress(userId) {
  const file = path.join(PROGRESS_DIR, `${userId}.json`);
  if (!fs.existsSync(file)) {
    return {
      userId,
      level: 1,
      points: 0,
      dimensionScores: DIMENSIONS.reduce((acc, d) => {
        acc[d.key] = 5;
        return acc;
      }, {}),
      weeklyChallenges: [],
      monthlyChallenges: [],
      badges: [],
      callCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }
  return JSON.parse(fs.readFileSync(file, 'utf-8'));
}

function saveUserProgress(userId, data) {
  data.updatedAt = new Date().toISOString();
  fs.writeFileSync(
    path.join(PROGRESS_DIR, `${userId}.json`),
    JSON.stringify(data, null, 2),
    'utf-8'
  );
}

function getAllUsers() {
  if (!fs.existsSync(CLIENTS_DIR)) return [];
  return fs.readdirSync(CLIENTS_DIR)
    .filter(f => f.endsWith('.json'))
    .map(f => f.replace('.json', ''));
}

function calculateUserLevel(score) {
  const level = LEVELS.find(l => score >= l.minScore && score < l.maxScore);
  return level || LEVELS[4];
}

function calculateAverageScore(dimensionScores) {
  const values = Object.values(dimensionScores);
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function getWeeklyRankings() {
  const file = path.join(RANKINGS_DIR, `weekly_${getWeek()}.json`);
  if (!fs.existsSync(file)) {
    return { week: getWeek(), rankings: [] };
  }
  return JSON.parse(fs.readFileSync(file, 'utf-8'));
}

function saveWeeklyRankings(rankings) {
  const week = getWeek();
  fs.writeFileSync(
    path.join(RANKINGS_DIR, `weekly_${week}.json`),
    JSON.stringify({ week, rankings, generatedAt: new Date().toISOString() }, null, 2),
    'utf-8'
  );
}

function getWeek() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now - start;
  const oneDay = 1000 * 60 * 60 * 24;
  const day = Math.floor(diff / oneDay);
  return Math.floor(day / 7) + 1;
}

// ─── 生成排行榜 ─────────────────────────────────────────────────────────

function generateRankings() {
  const users = getAllUsers();
  const rankings = users.map(userId => {
    const progress = getUserProgress(userId);
    const avgScore = calculateAverageScore(progress.dimensionScores);
    const levelInfo = calculateUserLevel(avgScore);
    return {
      userId,
      points: progress.points,
      level: levelInfo.level,
      levelName: levelInfo.name,
      avgScore: Math.round(avgScore * 10) / 10,
      callCount: progress.callCount,
      badges: progress.badges.length
    };
  }).sort((a, b) => b.points - a.points)
    .map((item, idx) => ({ ...item, rank: idx + 1 }));

  saveWeeklyRankings(rankings);
  return rankings;
}

// ─── API 路由处理 ─────────────────────────────────────────────────────

const routes = {
  // GET /api/dashboard/:userId
  '/api/dashboard': (req, params) => {
    const userId = params[0];
    const progress = getUserProgress(userId);
    const avgScore = calculateAverageScore(progress.dimensionScores);
    const levelInfo = calculateUserLevel(avgScore);

    return {
      userId,
      level: levelInfo.level,
      levelName: levelInfo.name,
      score: Math.round(avgScore * 10) / 10,
      points: progress.points,
      callCount: progress.callCount,
      badges: progress.badges.length,
      dimensions: DIMENSIONS.map(d => ({
        name: d.name,
        key: d.key,
        score: progress.dimensionScores[d.key] || 0,
        weight: d.baseWeight
      })),
      recentChallenges: progress.monthlyChallenges.slice(-3),
      createdAt: progress.createdAt,
      updatedAt: progress.updatedAt
    };
  },

  // GET /api/leaderboard/weekly
  '/api/leaderboard/weekly': () => {
    const rankings = generateRankings();
    return {
      type: 'weekly',
      week: getWeek(),
      rankings: rankings.slice(0, 10),
      total: rankings.length,
      generatedAt: new Date().toISOString()
    };
  },

  // GET /api/leaderboard/monthly
  '/api/leaderboard/monthly': () => {
    const rankings = generateRankings();
    return {
      type: 'monthly',
      month: new Date().getMonth() + 1,
      rankings: rankings.slice(0, 10),
      total: rankings.length,
      generatedAt: new Date().toISOString()
    };
  },

  // GET /api/dimension/:userId
  '/api/dimension': (req, params) => {
    const userId = params[0];
    const progress = getUserProgress(userId);
    return {
      userId,
      dimensions: DIMENSIONS.map(d => ({
        name: d.name,
        key: d.key,
        score: progress.dimensionScores[d.key] || 0,
        baseWeight: d.baseWeight
      }))
    };
  },

  // POST /api/progress/:userId/update
  '/api/progress': (req, params, body) => {
    const userId = params[0];
    const { dimensionScores, points, callCount } = JSON.parse(body || '{}');

    const progress = getUserProgress(userId);
    if (dimensionScores) {
      progress.dimensionScores = { ...progress.dimensionScores, ...dimensionScores };
    }
    if (points !== undefined) {
      progress.points = Math.max(0, progress.points + points);
    }
    if (callCount !== undefined) {
      progress.callCount = Math.max(progress.callCount, callCount);
    }

    const avgScore = calculateAverageScore(progress.dimensionScores);
    progress.level = calculateUserLevel(avgScore).level;

    saveUserProgress(userId, progress);

    return {
      success: true,
      userId,
      points: progress.points,
      level: progress.level,
      avgScore: Math.round(avgScore * 10) / 10
    };
  },

  // GET /api/health
  '/api/health': () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
    usersCount: getAllUsers().length,
    port: PORT
  }),

  // GET /  — 根路径状态页
  '/': () => ({
    name: 'Clover A-sales Dashboard',
    version: '1.0.0',
    status: 'ok',
    endpoints: {
      health: '/api/health',
      dashboard: '/api/dashboard/:userId',
      leaderboard: '/api/leaderboard/weekly',
      dimension: '/api/dimension/:userId'
    },
    timestamp: new Date().toISOString()
  })
};

// ─── HTTP 服务器 ─────────────────────────────────────────────────────

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const query = parsedUrl.query;

  // CORS 处理
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // 路由匹配
  let handled = false;
  let body = '';

  // 收集请求体
  if (req.method === 'POST') {
    req.on('data', chunk => {
      body += chunk.toString();
      if (body.length > 1e6) {
        req.connection.destroy();
      }
    });
    req.on('end', () => {
      handleRequest(pathname, body);
    });
  } else {
    handleRequest(pathname, body);
  }

  function handleRequest(pathname, body) {
    // 尝试精确匹配
    if (routes[pathname]) {
      try {
        const result = routes[pathname](req, [], body);
        res.writeHead(200);
        res.end(JSON.stringify(result, null, 2));
        handled = true;
        return;
      } catch (e) {
        console.error('Error in route handler:', e);
      }
    }

    // 尝试参数匹配
    for (const [pattern, handler] of Object.entries(routes)) {
      const parts = pattern.split('/').filter(p => p);
      const pathParts = pathname.split('/').filter(p => p);

      if (parts.length === pathParts.length) {
        const params = [];
        let match = true;

        for (let i = 0; i < parts.length; i++) {
          if (parts[i].startsWith(':')) {
            params.push(pathParts[i]);
          } else if (parts[i] !== pathParts[i]) {
            match = false;
            break;
          }
        }

        if (match) {
          try {
            const result = handler(req, params, body);
            res.writeHead(200);
            res.end(JSON.stringify(result, null, 2));
            handled = true;
            return;
          } catch (e) {
            console.error('Error in handler:', e);
          }
        }
      }
    }

    // 404
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Not Found', path: pathname }));
  }
});

const HOST = process.env.HOST || '0.0.0.0';
server.listen(PORT, HOST, () => {
  const displayHost = HOST === '0.0.0.0' ? 'localhost' : HOST;
  console.log(`🎮 Clover A-sales Dashboard API running on http://${displayHost}:${PORT}`);
  console.log(`   Dashboard: http://${displayHost}:${PORT}/dashboard`);
  console.log(`   API Docs: http://${displayHost}:${PORT}/api-docs`);
  if (HOST === '0.0.0.0') {
    console.log(`   外网访问: http://{你的服务器IP}:${PORT}`);
  }
});
