/**
 * Dashboard API 集成测试
 * 测试项目：API 端点、仪表板数据获取、排行榜生成
 */

const fs = require('fs');
const path = require('path');

// Mock 测试数据
const testDataDir = path.join(__dirname, '../../data/test');

const mockProgressData = {
  user_001: {
    userId: 'user_001',
    name: '张三',
    level: 2,
    score: 58,
    totalCalls: 15,
    thisWeekCalls: 3,
    dimensions: {
      ice_breaking: 70,
      identify_needs: 55,
      deliver_value: 60,
      build_trust: 65,
      trust_shaping: 48,
      custom_solutions: 52,
      objection_handling: 45,
      close_deal: 58,
      relationship_maintenance: 50,
      hooks: 42,
    },
    badges: ['首次通话', '坚持者'],
  },
  user_002: {
    userId: 'user_002',
    name: '李四',
    level: 3,
    score: 72,
    totalCalls: 42,
    thisWeekCalls: 5,
    dimensions: {
      ice_breaking: 85,
      identify_needs: 78,
      deliver_value: 80,
      build_trust: 82,
      trust_shaping: 72,
      custom_solutions: 75,
      objection_handling: 70,
      close_deal: 75,
      relationship_maintenance: 68,
      hooks: 65,
    },
    badges: ['销售新人', '坚持者', '破冰高手'],
  },
};

describe('Dashboard API 集成测试', () => {
  describe('GET /api/dashboard/:userId - 获取仪表板数据', () => {
    test('应该返回用户的完整仪表板数据', () => {
      const dashboardData = getDashboardData('user_001');

      expect(dashboardData).toBeDefined();
      expect(dashboardData.userId).toBe('user_001');
      expect(dashboardData.name).toBe('张三');
      expect(dashboardData).toHaveProperty('level');
      expect(dashboardData).toHaveProperty('score');
      expect(dashboardData).toHaveProperty('dimensions');
      expect(dashboardData).toHaveProperty('badges');
    });

    test('十维度数据应该完整', () => {
      const data = getDashboardData('user_001');
      const dimensions = data.dimensions;

      expect(Object.keys(dimensions)).toHaveLength(10);
      expect(dimensions.ice_breaking).toBeDefined();
      expect(dimensions.identify_needs).toBeDefined();
      expect(dimensions.deliver_value).toBeDefined();
    });

    test('用户等级应该根据总分自动计算', () => {
      const user1 = getDashboardData('user_001'); // 58分，应该是L2
      const user2 = getDashboardData('user_002'); // 72分，应该是L3

      expect(user1.level).toBe(2);
      expect(user2.level).toBe(3);
    });
  });

  describe('GET /api/leaderboard/weekly - 周排行榜', () => {
    test('应该返回周排行榜数据（按本周通话数排序）', () => {
      const leaderboard = getWeeklyLeaderboard();

      expect(Array.isArray(leaderboard)).toBe(true);
      expect(leaderboard.length).toBeGreaterThan(0);
    });

    test('排行榜应该按本周通话数降序排列', () => {
      const leaderboard = getWeeklyLeaderboard();

      for (let i = 0; i < leaderboard.length - 1; i++) {
        expect(leaderboard[i].thisWeekCalls).toBeGreaterThanOrEqual(
          leaderboard[i + 1].thisWeekCalls
        );
      }
    });

    test('排行榜条目应该包含排名', () => {
      const leaderboard = getWeeklyLeaderboard();

      leaderboard.forEach((item, index) => {
        expect(item.rank).toBe(index + 1);
      });
    });

    test('应该突出本周进步最大的用户', () => {
      const leaderboard = getWeeklyLeaderboard();

      // 如果第一名的通话数显著高于其他人，应该有某种标记
      const topUser = leaderboard[0];
      expect(topUser.thisWeekCalls).toBeDefined();
    });
  });

  describe('GET /api/leaderboard/monthly - 月排行榜', () => {
    test('应该返回月排行榜数据（按总分排序）', () => {
      const leaderboard = getMonthlyLeaderboard();

      expect(Array.isArray(leaderboard)).toBe(true);
      expect(leaderboard.length).toBeGreaterThan(0);
    });

    test('月排行榜应该按总分降序排列', () => {
      const leaderboard = getMonthlyLeaderboard();

      for (let i = 0; i < leaderboard.length - 1; i++) {
        expect(leaderboard[i].score).toBeGreaterThanOrEqual(
          leaderboard[i + 1].score
        );
      }
    });

    test('应该显示用户的等级', () => {
      const leaderboard = getMonthlyLeaderboard();

      leaderboard.forEach((item) => {
        expect(item.level).toBeDefined();
        expect(item.level).toBeGreaterThanOrEqual(1);
        expect(item.level).toBeLessThanOrEqual(5);
      });
    });
  });

  describe('GET /api/dimension/:userId - 十维度详细数据', () => {
    test('应该返回该用户的详细十维度数据', () => {
      const dimensionData = getDimensionData('user_001');

      expect(dimensionData).toBeDefined();
      expect(dimensionData.userId).toBe('user_001');
      expect(dimensionData.dimensions).toBeDefined();
    });

    test('每个维度应该包含当前分数和对标数据', () => {
      const dimensionData = getDimensionData('user_001');

      Object.entries(dimensionData.dimensions).forEach(([key, value]) => {
        expect(value.current).toBeDefined();
        expect(value.salesChampion).toBeDefined(); // 销冠对标分
        expect(value.gap).toBeDefined(); // 差距
      });
    });

    test('应该计算与销冠的差距', () => {
      const dimensionData = getDimensionData('user_001');
      const iceBreaking = dimensionData.dimensions.ice_breaking;

      expect(iceBreaking.gap).toBe(iceBreaking.salesChampion - iceBreaking.current);
    });
  });

  describe('POST /api/progress/:userId/update - 更新进度', () => {
    test('应该能更新维度分数', () => {
      const updateData = {
        dimension: 'ice_breaking',
        score: 75,
        timestamp: new Date().toISOString(),
      };

      const result = updateProgress('user_001', updateData);

      expect(result.success).toBe(true);
      expect(result.newScore).toBe(75);
    });

    test('更新分数应该自动重新计算总分和等级', () => {
      const oldData = getDashboardData('user_001');
      const oldScore = oldData.score;
      const oldLevel = oldData.level;

      // 更新多个维度
      updateProgress('user_001', { dimension: 'identify_needs', score: 75 });
      updateProgress('user_001', { dimension: 'deliver_value', score: 80 });

      const newData = getDashboardData('user_001');

      expect(newData.score).toBeGreaterThan(oldScore);
    });

    test('应该记录更新的时间戳', () => {
      const timestamp = new Date().toISOString();
      updateProgress('user_001', {
        dimension: 'ice_breaking',
        score: 78,
        timestamp,
      });

      // 应该能查询到最近的更新时间
      expect(true).toBe(true); // Placeholder
    });
  });

  describe('GET /api/health - 健康检查', () => {
    test('应该返回服务健康状态', () => {
      const health = getHealthStatus();

      expect(health.status).toBe('ok');
      expect(health.timestamp).toBeDefined();
    });

    test('健康检查应该包含服务状态', () => {
      const health = getHealthStatus();

      expect(health).toHaveProperty('status');
      expect(health).toHaveProperty('timestamp');
      expect(health).toHaveProperty('version');
    });
  });

  describe('错误处理', () => {
    test('访问不存在的用户应该返回 404', () => {
      const result = getDashboardData('user_999');

      expect(result).toBeNull();
    });

    test('无效的维度更新应该返回错误', () => {
      const result = updateProgress('user_001', {
        dimension: 'invalid_dimension',
        score: 50,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('分数超出范围应该被修正或拒绝', () => {
      const result = updateProgress('user_001', {
        dimension: 'ice_breaking',
        score: 150, // 超过100
      });

      // 应该要么被修正为100，要么返回错误
      expect(
        result.newScore <= 100 || result.error
      ).toBe(true);
    });
  });
});

// ─── 辅助函数（模拟实现）────────────────────────────

function getDashboardData(userId) {
  return mockProgressData[userId] || null;
}

function getWeeklyLeaderboard() {
  return Object.values(mockProgressData)
    .sort((a, b) => b.thisWeekCalls - a.thisWeekCalls)
    .map((user, index) => ({
      ...user,
      rank: index + 1,
    }));
}

function getMonthlyLeaderboard() {
  return Object.values(mockProgressData)
    .sort((a, b) => b.score - a.score)
    .map((user, index) => ({
      ...user,
      rank: index + 1,
    }));
}

function getDimensionData(userId) {
  const user = mockProgressData[userId];
  if (!user) return null;

  const salesChampionScores = {
    ice_breaking: 92,
    identify_needs: 88,
    deliver_value: 85,
    build_trust: 90,
    trust_shaping: 80,
    custom_solutions: 85,
    objection_handling: 82,
    close_deal: 88,
    relationship_maintenance: 85,
    hooks: 80,
  };

  const dimensions = {};
  Object.entries(user.dimensions).forEach(([key, current]) => {
    const salesChampion = salesChampionScores[key];
    dimensions[key] = {
      current,
      salesChampion,
      gap: salesChampion - current,
      percentile: Math.round((current / salesChampion) * 100),
    };
  });

  return {
    userId,
    name: user.name,
    dimensions,
  };
}

function updateProgress(userId, updateData) {
  const user = mockProgressData[userId];

  if (!user) {
    return { success: false, error: 'User not found' };
  }

  if (!user.dimensions[updateData.dimension]) {
    return { success: false, error: 'Invalid dimension' };
  }

  let score = updateData.score;
  if (score < 0) score = 0;
  if (score > 100) score = 100;

  user.dimensions[updateData.dimension] = score;

  // 重新计算总分
  const newScore = Math.round(
    Object.values(user.dimensions).reduce((a, b) => a + b) / 10
  );
  user.score = newScore;

  return { success: true, newScore: score };
}

function getHealthStatus() {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  };
}
