#!/usr/bin/env node
/**
 * grow-coach.js — GROW教练引擎
 *
 * 基于最近的销售复盘数据，使用GROW框架自动生成个性化教练建议
 * 用法: node grow-coach.js <userId> [callsCount]
 */

const fs = require('fs');
const path = require('path');

const CLIENTS_DIR = path.join(__dirname, '..', 'data', 'clients');
const PROGRESS_DIR = path.join(__dirname, '..', 'data', 'progress');

const DIMENSIONS = [
  { name: '破冰', key: 'ice_breaking', desc: '初次沟通能力' },
  { name: '识别需求', key: 'identify_needs', desc: '需求发现能力' },
  { name: '传达价值', key: 'deliver_value', desc: '价值表达能力' },
  { name: '建立信任', key: 'build_trust', desc: '信任建立能力' },
  { name: '信任塑造', key: 'trust_shaping', desc: '信任深化能力' },
  { name: '定制解决', key: 'custom_solutions', desc: '方案定制能力' },
  { name: '异议处理', key: 'objection_handling', desc: '异议应对能力' },
  { name: '促成交易', key: 'close_deal', desc: '成交推进能力' },
  { name: '关系维护', key: 'relationship_maintenance', desc: '关系维护能力' },
  { name: '钩子', key: 'hooks', desc: '持续跟进能力' }
];

const LEVEL_CONFIG = [
  { level: 1, name: '销售新人', scoreRange: [0, 40], focusDimensions: ['ice_breaking', 'identify_needs'] },
  { level: 2, name: '初级销售', scoreRange: [40, 60], focusDimensions: ['build_trust', 'deliver_value'] },
  { level: 3, name: '中级销售', scoreRange: [60, 75], focusDimensions: ['trust_shaping', 'custom_solutions'] },
  { level: 4, name: '销冠', scoreRange: [75, 90], focusDimensions: ['custom_solutions', 'close_deal'] },
  { level: 5, name: '销售大师', scoreRange: [90, 100], focusDimensions: ['relationship_maintenance', 'hooks'] }
];

// ─── 工具函数 ─────────────────────────────────────────────────────────

function getUserProgress(userId) {
  const file = path.join(PROGRESS_DIR, `${userId}.json`);
  if (!fs.existsSync(file)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(file, 'utf-8'));
}

function getRecentCalls(userId) {
  const files = fs.readdirSync(CLIENTS_DIR).filter(f => f.endsWith('.json'));
  const allCalls = [];

  files.forEach(file => {
    const client = JSON.parse(fs.readFileSync(path.join(CLIENTS_DIR, file), 'utf-8'));
    if (client.history && Array.isArray(client.history)) {
      // 假设 history 中有 review 字段包含维度评分
      client.history.slice(-5).forEach(call => {
        if (call.review || call.dimensionScores) {
          allCalls.push({
            date: call.date,
            clientName: client.name,
            review: call.review,
            scores: call.dimensionScores || {}
          });
        }
      });
    }
  });

  return allCalls.sort((a, b) => (b.date || '').localeCompare(a.date || '')).slice(0, 5);
}

function aggregateDimensionScores(calls) {
  const aggregated = {};

  DIMENSIONS.forEach(d => {
    const scores = [];
    calls.forEach(call => {
      if (call.scores && call.scores[d.key] !== undefined) {
        scores.push(call.scores[d.key]);
      }
    });
    aggregated[d.key] = scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b) / scores.length * 10) / 10
      : 5;
  });

  return aggregated;
}

function calculateUserLevel(avgScore) {
  return LEVEL_CONFIG.find(l => avgScore >= l.scoreRange[0] && avgScore < l.scoreRange[1]) || LEVEL_CONFIG[4];
}

// ─── GROW 教练框架 ─────────────────────────────────────────────────────

function identifyBottlenecks(dimensionScores) {
  return DIMENSIONS
    .map(d => ({
      name: d.name,
      key: d.key,
      score: dimensionScores[d.key] || 0,
      desc: d.desc
    }))
    .sort((a, b) => a.score - b.score)
    .slice(0, 3);
}

function generateGoal(userLevel, bottomDimensions) {
  const levelConfig = LEVEL_CONFIG.find(l => l.level === userLevel.level);
  const focus = levelConfig.focusDimensions.map(key =>
    DIMENSIONS.find(d => d.key === key).name
  ).join('、');

  return {
    weeklyTarget: `提升${focus}能力，特别关注${bottomDimensions[0].name}`,
    expectedImprovement: '本周维度平均分提升 2-3 分',
    keyFocus: bottomDimensions.slice(0, 2).map(d => d.name),
    rationale: `基于你的${userLevel.name}水平，${focus}是当前阶段的关键突破口`
  };
}

function generateReality(dimensionScores, recentCalls) {
  const avgScore = Object.values(dimensionScores).reduce((a, b) => a + b) / DIMENSIONS.length;
  const weak = DIMENSIONS.filter(d => (dimensionScores[d.key] || 0) < 6);
  const strong = DIMENSIONS.filter(d => (dimensionScores[d.key] || 0) >= 8);

  return {
    overallScore: Math.round(avgScore * 10) / 10,
    recentCallCount: recentCalls.length,
    strengths: strong.map(d => `${d.name} (${dimensionScores[d.key]}分)`),
    challenges: weak.map(d => `${d.name} (${dimensionScores[d.key]}分)`),
    trend: avgScore >= 7 ? '稳步上升' : avgScore >= 5 ? '有所改善' : '需要重点关注',
    lastReviewDate: recentCalls.length > 0 ? recentCalls[0].date : '暂无'
  };
}

function generateOptions(bottomDimensions, recentCalls) {
  const improvements = [];

  bottomDimensions.slice(0, 3).forEach((dim, idx) => {
    const option = {
      priority: idx + 1,
      dimension: dim.name,
      currentScore: dim.score,
      targetScore: Math.min(dim.score + 3, 10),
      actionPlan: [
        `重点关注${dim.name}相关的销售话术`,
        `每次通话前准备${dim.desc}的核心要点`,
        `复盘时特别审视${dim.name}是否有改进`
      ],
      learningResources: [
        `📚 《销售教练手册》- ${dim.name}章节`,
        `🎯 ${dim.name}专项训练题库`,
        `💡 ${dim.name}常见问题解决方案`
      ]
    };
    improvements.push(option);
  });

  return {
    topImprovementAreas: improvements,
    practiceFrequency: '每周至少 3 次针对性练习',
    benchmarkScore: '目标达到 7 分以上'
  };
}

function generateWayForward(options, userLevel) {
  const thisWeek = [
    `周一-周三: 专项练习${options.topImprovementAreas[0].dimension}`,
    `周四: 与团队成员进行同行评审`,
    `周五: 总结本周改进点，制定下周计划`
  ];

  const support = {
    coachReview: '每周一 10:00 进行一次教练反馈',
    peerLearning: '推荐与销售等级相近的团队成员配对学习',
    selfReflection: '每次通话后 5 分钟快速复盘'
  };

  return {
    weekAction: {
      monday: `准备${options.topImprovementAreas[0].dimension}专项训练`,
      wednesday: '完成 3 次针对性练习通话',
      friday: '复盘本周进度，制定下周目标'
    },
    monthlyMilestone: `${options.topImprovementAreas[0].dimension}达到 7+ 分，整体提升 2 分`,
    keySuccess: [
      '每周完成目标练习次数',
      `${options.topImprovementAreas[0].dimension}维度有明显改善`,
      '获得至少 2 次正面反馈'
    ],
    supportSystem: support,
    nextReview: '下周一'
  };
}

// ─── 生成完整教练报告 ─────────────────────────────────────────────────

function generateCoachingReport(userId) {
  const progress = getUserProgress(userId);
  if (!progress) {
    return {
      error: 'User not found',
      userId
    };
  }

  const recentCalls = getRecentCalls(userId);
  const aggregatedScores = aggregateDimensionScores(recentCalls);
  const avgScore = Object.values(aggregatedScores).reduce((a, b) => a + b) / DIMENSIONS.length;
  const userLevel = calculateUserLevel(avgScore);
  const bottlenecks = identifyBottlenecks(aggregatedScores);

  return {
    userId,
    timestamp: new Date().toISOString(),
    userLevel: {
      level: userLevel.level,
      name: userLevel.name,
      avgScore: Math.round(avgScore * 10) / 10
    },
    growFramework: {
      goal: generateGoal(userLevel, bottlenecks),
      reality: generateReality(aggregatedScores, recentCalls),
      options: generateOptions(bottlenecks, recentCalls),
      wayForward: generateWayForward(generateOptions(bottlenecks, recentCalls), userLevel)
    },
    dimensionDetails: DIMENSIONS.map(d => ({
      name: d.name,
      key: d.key,
      currentScore: aggregatedScores[d.key] || 0,
      trend: (aggregatedScores[d.key] || 0) >= 7 ? '优秀' : (aggregatedScores[d.key] || 0) >= 5 ? '良好' : '需改进'
    })),
    recentCallsAnalyzed: recentCalls.length,
    coachingQuestions: generateCoachingQuestions(bottlenecks, userLevel)
  };
}

function generateCoachingQuestions(bottlenecks, userLevel) {
  const topBottleneck = bottlenecks[0];
  return [
    `关于${topBottleneck.name}，上周通话中最大的挑战是什么？`,
    `如果有机会，你会如何改进这个方面？`,
    `下周你计划采取什么具体行动来提升${topBottleneck.name}？`
  ];
}

// ─── 主程序 ─────────────────────────────────────────────────────────

const userId = process.argv[2];

if (!userId) {
  console.error('用法: node grow-coach.js <userId>');
  process.exit(1);
}

const report = generateCoachingReport(userId);
console.log(JSON.stringify(report, null, 2));

module.exports = {
  generateCoachingReport,
  generateCoachingQuestions,
  generateGoal,
  generateReality,
  generateOptions,
  generateWayForward
};
