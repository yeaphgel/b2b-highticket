/**
 * api.js — API调用模块
 */

const API = {
  baseUrl: `http://localhost:${window.location.port === '3000' ? '3000' : '3000'}`,

  async call(endpoint, method = 'GET', data = null) {
    try {
      const options = {
        method,
        headers: {
          'Content-Type': 'application/json'
        }
      };

      if (data) {
        options.body = JSON.stringify(data);
      }

      const response = await fetch(`${this.baseUrl}${endpoint}`, options);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  // 获取用户仪表盘数据
  async getDashboard(userId) {
    return this.call(`/api/dashboard/${userId}`);
  },

  // 获取周排行
  async getWeeklyLeaderboard() {
    return this.call('/api/leaderboard/weekly');
  },

  // 获取月排行
  async getMonthlyLeaderboard() {
    return this.call('/api/leaderboard/monthly');
  },

  // 获取十维度数据
  async getDimensions(userId) {
    return this.call(`/api/dimension/${userId}`);
  },

  // 更新用户进度
  async updateProgress(userId, data) {
    return this.call(`/api/progress/${userId}/update`, 'POST', data);
  },

  // 获取健康检查
  async getHealth() {
    return this.call('/api/health');
  }
};

// 添加CORS支持（如果需要）
if (typeof window !== 'undefined') {
  // 检测API是否可用
  API.getHealth()
    .then(data => {
      console.log('✓ Dashboard API 已连接');
    })
    .catch(err => {
      console.warn('⚠ Dashboard API 未连接，请确保 node scripts/dashboard-api.js 正在运行');
    });
}
