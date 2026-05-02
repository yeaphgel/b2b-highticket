/**
 * app.js — 仪表盘主程序
 */

let currentUserId = null;
let currentLeaderboardType = 'weekly';

// ─── 初始化 ─────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  initializeEventListeners();
  loadDefaultData();
});

function initializeEventListeners() {
  // 加载按钮
  document.getElementById('loadBtn').addEventListener('click', () => {
    const userId = document.getElementById('userIdInput').value.trim();
    if (userId) {
      loadUserData(userId);
    } else {
      alert('请输入用户ID');
    }
  });

  // 回车加载
  document.getElementById('userIdInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      document.getElementById('loadBtn').click();
    }
  });

  // 语言切换
  document.getElementById('langSelect').addEventListener('change', (e) => {
    i18n.setLang(e.target.value);
  });

  // 排行榜标签切换
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentLeaderboardType = btn.dataset.tab;
      loadLeaderboard();
    });
  });

  // 设置默认用户ID
  const savedUserId = localStorage.getItem('lastUserId');
  if (savedUserId) {
    document.getElementById('userIdInput').value = savedUserId;
  }

  // 设置语言选择
  document.getElementById('langSelect').value = i18n.lang;
}

// ─── 加载默认数据 ─────────────────────────────────────────────────────

async function loadDefaultData() {
  try {
    // 加载周排行
    await loadLeaderboard();

    // 尝试从本地存储加载最后一个用户的数据
    const savedUserId = localStorage.getItem('lastUserId');
    if (savedUserId) {
      await loadUserData(savedUserId);
    }
  } catch (error) {
    console.error('加载默认数据失败:', error);
  }
}

// ─── 加载用户数据 ─────────────────────────────────────────────────────

async function loadUserData(userId) {
  try {
    currentUserId = userId;
    localStorage.setItem('lastUserId', userId);

    // 显示加载状态
    setLoading(true);

    // 并行加载所有数据
    const [dashboardData, dimensionData] = await Promise.all([
      API.getDashboard(userId),
      API.getDimensions(userId)
    ]);

    // 更新用户卡片
    updateUserCard(dashboardData);

    // 更新十维度图表
    const dimensionScores = {};
    dashboardData.dimensions?.forEach(d => {
      dimensionScores[d.key] = d.score;
    });

    updateDimensionChart(dimensionScores);

    // 加载GROW教练数据（这需要额外的API或使用模拟数据）
    loadCoachingData(userId);

    setLoading(false);
  } catch (error) {
    console.error('加载用户数据失败:', error);
    alert('加载失败，请确保 Dashboard API 正在运行 (node scripts/dashboard-api.js)');
    setLoading(false);
  }
}

// ─── 更新用户卡片 ─────────────────────────────────────────────────────

function updateUserCard(data) {
  const levels = [
    { level: 1, name: '销售新人', color: '#cd7f32' },
    { level: 2, name: '初级销售', color: '#c0c0c0' },
    { level: 3, name: '中级销售', color: '#ffd700' },
    { level: 4, name: '销冠', color: '#e5e4e2' },
    { level: 5, name: '销售大师', color: '#4169e1' }
  ];

  const levelInfo = levels.find(l => l.level === data.level);
  const levelBadge = document.getElementById('levelBadge');

  document.getElementById('levelTitle').textContent = levelInfo?.name || '销售新人';
  document.getElementById('levelBadge').textContent = `L${data.level}`;
  document.getElementById('levelBadge').style.background = levelInfo?.color;

  document.getElementById('userScore').textContent = (data.score || 0).toFixed(1);
  document.getElementById('userLevel').textContent = data.level || 1;
  document.getElementById('userPoints').textContent = data.points || 0;
  document.getElementById('callCount').textContent = data.callCount || 0;
  document.getElementById('badgeCount').textContent = data.badges || 0;

  // 更新用户卡片背景颜色
  document.querySelector('.user-card').style.borderLeftColor = levelInfo?.color;
}

// ─── 更新十维度图表 ─────────────────────────────────────────────────────

function updateDimensionChart(dimensionScores) {
  const canvas = document.getElementById('radarChart');
  Charts.createRadarChart(canvas, dimensionScores);
  Charts.renderDimensionList(
    document.getElementById('dimensionDetails'),
    dimensionScores
  );
}

// ─── 加载排行榜 ─────────────────────────────────────────────────────

async function loadLeaderboard() {
  try {
    setLoading(true);

    const leaderboardData = currentLeaderboardType === 'weekly'
      ? await API.getWeeklyLeaderboard()
      : await API.getMonthlyLeaderboard();

    Charts.renderLeaderboard(
      document.getElementById('leaderboardBody'),
      leaderboardData.rankings || []
    );

    setLoading(false);
  } catch (error) {
    console.error('加载排行榜失败:', error);
    setLoading(false);
  }
}

// ─── 加载教练数据 ─────────────────────────────────────────────────────

async function loadCoachingData(userId) {
  try {
    // 获取GROW教练数据
    // 这里我们使用模拟数据，实际应该从后端获取
    const mockCoachingData = {
      goal: {
        weeklyTarget: `提升识别需求和破冰能力，特别关注识别需求`,
        expectedImprovement: '本周维度平均分提升 2-3 分',
        keyFocus: ['识别需求', '破冰'],
        rationale: `基于你的销售新人水平，识别需求和破冰是当前阶段的关键突破口`
      },
      reality: {
        overallScore: 5.5,
        recentCallCount: 3,
        strengths: [],
        challenges: ['识别需求 (4.0分)', '异议处理 (3.0分)'],
        trend: '需要重点关注',
        lastReviewDate: new Date().toISOString().slice(0, 10)
      },
      options: {
        topImprovementAreas: [
          {
            priority: 1,
            dimension: '识别需求',
            currentScore: 4.0,
            targetScore: 7.0,
            actionPlan: [
              '重点关注识别需求相关的销售话术',
              '每次通话前准备需求发现的核心要点',
              '复盘时特别审视识别需求是否有改进'
            ],
            learningResources: [
              '📚 《销售教练手册》- 识别需求章节',
              '🎯 识别需求专项训练题库',
              '💡 识别需求常见问题解决方案'
            ]
          }
        ]
      },
      wayForward: {
        weekAction: {
          monday: '准备识别需求专项训练',
          wednesday: '完成 3 次针对性练习通话',
          friday: '复盘本周进度，制定下周目标'
        },
        monthlyMilestone: '识别需求达到 7+ 分，整体提升 2 分',
        keySuccess: [
          '每周完成目标练习次数',
          '识别需求维度有明显改善',
          '获得至少 2 次正面反馈'
        ],
        nextReview: '下周一'
      }
    };

    Charts.renderGrowCoaching(mockCoachingData);

    // 渲染教练问题
    const questions = [
      '关于识别需求，上周通话中最大的挑战是什么？',
      '如果有机会，你会如何改进这个方面？',
      '下周你计划采取什么具体行动来提升识别需求？'
    ];
    Charts.renderCoachingQuestions(questions);

  } catch (error) {
    console.error('加载教练数据失败:', error);
  }
}

// ─── 加载挑战数据 ─────────────────────────────────────────────────────

function loadChallengesData(userId) {
  try {
    // 模拟挑战数据
    const mockChallenges = [
      { name: '破冰高手', completed: 5, total: 10 },
      { name: '诊断王', completed: 3, total: 5 },
      { name: '信任大师', completed: 2, total: 8 }
    ];

    Charts.renderChallenges(mockChallenges);
  } catch (error) {
    console.error('加载挑战数据失败:', error);
  }
}

// ─── 加载状态 ─────────────────────────────────────────────────────

function setLoading(isLoading) {
  const mainContent = document.querySelector('.main-content');
  if (isLoading) {
    mainContent.classList.add('loading');
  } else {
    mainContent.classList.remove('loading');
  }
}

// ─── 工具函数 ─────────────────────────────────────────────────────

// 格式化数字
function formatNumber(num) {
  return (num || 0).toLocaleString('zh-Hans');
}

// 获取当前周数
function getCurrentWeek() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now - start;
  const oneDay = 1000 * 60 * 60 * 24;
  const day = Math.floor(diff / oneDay);
  return Math.floor(day / 7) + 1;
}

// 页面可见性监听（用于自动刷新）
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && currentUserId) {
    // 当页面重新可见时，刷新排行榜
    loadLeaderboard();
  }
});
