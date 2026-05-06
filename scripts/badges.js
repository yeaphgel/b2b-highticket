#!/usr/bin/env node
/**
 * badges.js — 游戏化徽章系统
 * 定义徽章条件并提供解锁检查逻辑
 */

const BADGES = [
  // ── 成长里程碑 ──
  { id: 'first_call',     name: '第一通电话',   icon: '📞', desc: '完成第一次销售通话',         condition: p => p.callCount >= 1 },
  { id: 'calls_10',       name: '初出茅庐',     icon: '🌱', desc: '完成 10 次通话',             condition: p => p.callCount >= 10 },
  { id: 'calls_50',       name: '50场老兵',     icon: '🎖️', desc: '完成 50 次通话',             condition: p => p.callCount >= 50 },
  { id: 'calls_100',      name: '百战老将',     icon: '⚔️', desc: '完成 100 次通话',            condition: p => p.callCount >= 100 },

  // ── 维度精通 ──
  { id: 'ice_master',     name: '破冰高手',     icon: '❄️', desc: '破冰维度达到 8 分',          condition: p => (p.dimensionScores?.ice_breaking || 0) >= 8 },
  { id: 'need_hunter',    name: '需求猎人',     icon: '🔍', desc: '识别需求维度达到 8 分',      condition: p => (p.dimensionScores?.identify_needs || 0) >= 8 },
  { id: 'value_caster',   name: '价值传播者',   icon: '💡', desc: '传达价值维度达到 8 分',      condition: p => (p.dimensionScores?.deliver_value || 0) >= 8 },
  { id: 'trust_builder',  name: '信任建筑师',   icon: '🏛️', desc: '建立信任维度达到 8 分',      condition: p => (p.dimensionScores?.build_trust || 0) >= 8 },
  { id: 'objection_pro',  name: '异议处理达人', icon: '🛡️', desc: '异议处理维度达到 8 分',      condition: p => (p.dimensionScores?.objection_handling || 0) >= 8 },
  { id: 'deal_closer',    name: '成交王',       icon: '🤝', desc: '促成交易维度达到 8 分',      condition: p => (p.dimensionScores?.close_deal || 0) >= 8 },

  // ── 等级里程碑 ──
  { id: 'level_2',        name: '初级销售',     icon: '🚀', desc: '晋升到初级销售等级',         condition: p => calcAvg(p) >= 40 },
  { id: 'level_3',        name: '中级销售',     icon: '⭐', desc: '晋升到中级销售等级',         condition: p => calcAvg(p) >= 60 },
  { id: 'level_4',        name: '销冠',         icon: '🏆', desc: '晋升到销冠等级',             condition: p => calcAvg(p) >= 75 },
  { id: 'level_5',        name: '销售大师',     icon: '💎', desc: '达到销售大师最高等级',       condition: p => calcAvg(p) >= 90 },

  // ── 积分里程碑 ──
  { id: 'points_1000',    name: '积分起步',     icon: '💰', desc: '累计积分达到 1000',          condition: p => p.points >= 1000 },
  { id: 'points_5000',    name: '积分达人',     icon: '💎', desc: '累计积分达到 5000',          condition: p => p.points >= 5000 },
  { id: 'points_10000',   name: '积分之王',     icon: '👑', desc: '累计积分达到 10000',         condition: p => p.points >= 10000 },

  // ── 全能王 ──
  { id: 'all_above_6',    name: '全能选手',     icon: '🌟', desc: '所有维度均达到 6 分以上',    condition: p => allDimsAbove(p, 6) },
  { id: 'all_above_8',    name: '全维度强者',   icon: '🔱', desc: '所有维度均达到 8 分以上',    condition: p => allDimsAbove(p, 8) },

  // ── 持续改进 ──
  { id: 'week_streak_4',  name: '持续进步者',   icon: '📈', desc: '连续 4 周通话数不为零',      condition: p => (p.weekStreak || 0) >= 4 },
];

function calcAvg(p) {
  const vals = Object.values(p.dimensionScores || {});
  if (vals.length === 0) return 0;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

function allDimsAbove(p, threshold) {
  const keys = ['ice_breaking','identify_needs','deliver_value','build_trust','trust_shaping','custom_solutions','objection_handling','close_deal','relationship_maintenance','hooks'];
  return keys.every(k => (p.dimensionScores?.[k] || 0) >= threshold);
}

/**
 * 检查用户是否解锁了新徽章，返回新解锁的徽章列表
 */
function checkAndAward(progress) {
  const existing = new Set(progress.badges || []);
  const newlyUnlocked = [];

  for (const badge of BADGES) {
    if (!existing.has(badge.id) && badge.condition(progress)) {
      existing.add(badge.id);
      newlyUnlocked.push(badge);
    }
  }

  if (newlyUnlocked.length > 0) {
    progress.badges = Array.from(existing);
  }

  return newlyUnlocked;
}

/**
 * 获取徽章详情（按 id 查找）
 */
function getBadgeInfo(badgeId) {
  return BADGES.find(b => b.id === badgeId);
}

/**
 * 获取用户已获徽章的详情列表
 */
function getUserBadges(progress) {
  return (progress.badges || [])
    .map(id => getBadgeInfo(id))
    .filter(Boolean);
}

module.exports = { BADGES, checkAndAward, getBadgeInfo, getUserBadges };
