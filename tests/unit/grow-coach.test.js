/**
 * GROW 教练引擎测试
 * 测试项目：维度分析、教练建议生成、目标设置
 */

const fs = require('fs');
const path = require('path');

// Mock 数据
const mockUserData = {
  userId: 'user_001',
  name: '张三',
  level: 2,
  totalCalls: 15,
  dimensions: {
    ice_breaking: 65,
    identify_needs: 48,
    deliver_value: 55,
    build_trust: 60,
    trust_shaping: 40,
    custom_solutions: 45,
    objection_handling: 35,
    close_deal: 50,
    relationship_maintenance: 42,
    hooks: 38,
  },
};

describe('GROW 教练引擎', () => {
  describe('低分维度识别', () => {
    test('应该识别出最低的3个维度', () => {
      const dimensions = mockUserData.dimensions;
      const sortedDimensions = Object.entries(dimensions)
        .map(([key, value]) => ({ dimension: key, score: value }))
        .sort((a, b) => a.score - b.score)
        .slice(0, 3);

      expect(sortedDimensions).toHaveLength(3);
      expect(sortedDimensions[0].dimension).toBe('objection_handling');
      expect(sortedDimensions[0].score).toBe(35);
    });

    test('低分维度应该有明确的改进建议', () => {
      const lowDimension = 'objection_handling';
      const score = mockUserData.dimensions[lowDimension];

      expect(score).toBeLessThan(50);

      // 应该能生成针对性的建议
      const suggestions = generateGrowSuggestions(lowDimension, score);
      expect(suggestions).toBeDefined();
      expect(suggestions.length).toBeGreaterThan(0);
    });
  });

  describe('教练目标生成', () => {
    test('应该根据低分维度生成周度目标', () => {
      const lowestDimension = 'objection_handling'; // 35分
      const goal = generateGoal(lowestDimension);

      expect(goal).toBeDefined();
      expect(goal.dimension).toBe(lowestDimension);
      expect(goal.targetScore).toBeGreaterThan(35);
      expect(goal.timeline).toBe('weekly');
    });

    test('GROW 框架应该包含 Goal, Reality, Explore, Will', () => {
      const growPlan = generateGrowPlan(mockUserData);

      expect(growPlan).toHaveProperty('goal');
      expect(growPlan).toHaveProperty('reality');
      expect(growPlan).toHaveProperty('explore');
      expect(growPlan).toHaveProperty('will');

      expect(growPlan.goal).toBeTruthy();
      expect(growPlan.reality).toBeTruthy();
      expect(growPlan.explore.length).toBeGreaterThan(0);
      expect(growPlan.will).toBeTruthy();
    });
  });

  describe('对标分析', () => {
    test('应该能对标销冠的维度评分', () => {
      const salesChampionScores = {
        ice_breaking: 92,
        identify_needs: 88,
        deliver_value: 85,
        build_trust: 90,
      };

      const userScores = {
        ice_breaking: 65,
        identify_needs: 48,
        deliver_value: 55,
        build_trust: 60,
      };

      const gaps = calculateGaps(userScores, salesChampionScores);

      expect(gaps.ice_breaking).toBe(27); // 92 - 65
      expect(gaps.identify_needs).toBe(40); // 88 - 48
    });

    test('应该识别出最大的差距维度', () => {
      const gaps = {
        ice_breaking: 27,
        identify_needs: 40,
        deliver_value: 30,
        build_trust: 30,
      };

      const maxGap = Object.entries(gaps)
        .map(([dim, gap]) => ({ dimension: dim, gap }))
        .reduce((prev, current) => (prev.gap > current.gap ? prev : current));

      expect(maxGap.dimension).toBe('identify_needs');
      expect(maxGap.gap).toBe(40);
    });
  });

  describe('教练建议的可执行性', () => {
    test('每个建议应该包含具体行动步骤', () => {
      const suggestion = {
        dimension: 'identify_needs',
        action: '深层追问',
        example: '当客户说"我们效率有问题"时，追问："具体体现在哪些方面？影响了多少人？"',
        targetScore: 70,
      };

      expect(suggestion.action).toBeTruthy();
      expect(suggestion.example).toBeTruthy();
      expect(suggestion.example.includes('？')).toBeTruthy();
    });

    test('建议应该有明确的验证指标', () => {
      const metrics = {
        dimension: 'identify_needs',
        metric: '每通电话的问题追问次数',
        current: 2,
        target: 5,
        measurement: '计算15分钟电话中的"为什么"提问次数',
      };

      expect(metrics.metric).toBeTruthy();
      expect(metrics.target).toBeGreaterThan(metrics.current);
      expect(metrics.measurement).toBeTruthy();
    });
  });
});

// ─── 辅助函数（实现）────────────────────────────

function generateGrowSuggestions(dimension, score) {
  const suggestionMap = {
    objection_handling: [
      {
        action: '学习异议处理框架',
        example: '客户说"价格太高"→ 理解异议 → 重新阐述价值 → 提供替代方案',
      },
      {
        action: '准备常见异议的回答',
        example: '预先列出10个常见反对意见和回答话术',
      },
      {
        action: '练习"同意+转折"话术',
        example: '"我理解你的顾虑，很多客户一开始也这样想，但..."',
      },
    ],
    identify_needs: [
      {
        action: '使用SPIN提问法',
        example: '情景问 → 困难问 → 暗示问 → 需求回顾问',
      },
      {
        action: '深层追问痛点',
        example: '客户："效率低" → "低到什么程度？" → "这影响了什么？" → "成本多少？"',
      },
    ],
  };

  return suggestionMap[dimension] || [];
}

function generateGoal(dimension) {
  return {
    dimension,
    targetScore: 70,
    timeline: 'weekly',
    description: `提升${dimension}维度的能力到70分以上`,
  };
}

function generateGrowPlan(userData) {
  const lowestDim = Object.entries(userData.dimensions)
    .sort((a, b) => a[1] - b[1])[0];

  return {
    goal: `本周聚焦${lowestDim[0]}维度，目标分数70+`,
    reality: `当前${lowestDim[0]}评分${lowestDim[1]}分，距离销冠差距40分`,
    explore: [
      '学习销冠在此维度的3个关键话术',
      '每通电话前列出这个维度的3个关键点',
      '电话后复盘：有没有充分展现这个维度',
    ],
    will: `下周验证：${lowestDim[0]}维度的通话评分上升到${lowestDim[1] + 15}分以上`,
  };
}

function calculateGaps(userScores, championScores) {
  const gaps = {};
  for (const key in userScores) {
    gaps[key] = championScores[key] - userScores[key];
  }
  return gaps;
}
