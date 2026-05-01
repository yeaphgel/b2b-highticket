/**
 * MiniMax Embedding API 模块
 *
 * 环境变量：
 *   MINIMAX_API_KEY: MiniMax API Key
 *   MINIMAX_GROUP_ID: MiniMax Group ID
 *
 * 文档：https://www.minimaxi.com/document/guides/embedding
 */

const https = require('https');

const API_KEY = process.env.MINIMAX_API_KEY;
const GROUP_ID = process.env.MINIMAX_GROUP_ID;
const EMBEDDING_MODEL = process.env.MINIMAX_EMBEDDING_MODEL || 'embo-01';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 获取单个文本的 embedding
 */
async function getEmbedding(text) {
  if (!API_KEY || !GROUP_ID) {
    throw new Error('未找到 MINIMAX_API_KEY 或 MINIMAX_GROUP_ID 环境变量');
  }

  const body = JSON.stringify({
    model: EMBEDDING_MODEL,
    texts: [text],
  });

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.minimax.chat',
      path: `/v1/embeddings`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res) => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(raw);
          if (result.error) {
            throw new Error(result.error.message || JSON.stringify(result.error));
          }
          if (!result.data || !result.data[0]) {
            throw new Error('MiniMax 返回格式异常: ' + raw);
          }
          resolve(result.data[0].embedding);
        } catch (e) {
          reject(new Error(`MiniMax Embedding API 错误: ${e.message}`));
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

/**
 * 批量获取 embeddings
 * @param {string[]} texts 文本数组
 * @param {number} delayMs 批次间延迟（毫秒）
 */
async function getEmbeddings(texts, delayMs = 100) {
  if (!API_KEY || !GROUP_ID) {
    throw new Error('未找到 MINIMAX_API_KEY 或 MINIMAX_GROUP_ID 环境变量');
  }

  if (!Array.isArray(texts) || texts.length === 0) {
    return [];
  }

  const body = JSON.stringify({
    model: EMBEDDING_MODEL,
    texts: texts,
  });

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.minimax.chat',
      path: `/v1/embeddings`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res) => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(raw);
          if (result.error) {
            throw new Error(result.error.message || JSON.stringify(result.error));
          }
          if (!result.data || !Array.isArray(result.data)) {
            throw new Error('MiniMax 返回格式异常: ' + raw);
          }
          // 按照原始顺序返回
          const embeddings = result.data
            .sort((a, b) => a.index - b.index)
            .map(item => item.embedding);
          resolve(embeddings);
        } catch (e) {
          reject(new Error(`MiniMax Embedding API 错误: ${e.message}`));
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

module.exports = {
  getEmbedding,
  getEmbeddings,
  sleep,
};
