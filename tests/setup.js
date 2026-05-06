// 全局测试设置
const path = require('path');

// 设置环境变量
process.env.NODE_ENV = 'test';
process.env.ARK_API_KEY = 'test-key';
process.env.DASHBOARD_PORT = '3000';
process.env.HERMES_PORT = '3001';
process.env.WEBHOOK_PORT = '3002';

// 创建测试数据目录
const fs = require('fs');
const testDataDir = path.join(__dirname, '../data/test');

if (!fs.existsSync(testDataDir)) {
  fs.mkdirSync(testDataDir, { recursive: true });
  fs.mkdirSync(path.join(testDataDir, 'clients'), { recursive: true });
  fs.mkdirSync(path.join(testDataDir, 'progress'), { recursive: true });
}

// 全局超时
jest.setTimeout(10000);
