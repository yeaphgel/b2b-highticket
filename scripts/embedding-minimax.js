/**
 * MiniMax Embedding API 模块
 *
 * 环境变量：
 *   MINIMAX_API_KEY: MiniMax API Key
 *   MINIMAX_GROUP_ID: MiniMax Group ID（必须，拼入 URL）
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

function makeRequest(body) {
  if (!API_KEY || !GROUP_ID) {
    return Promise.reject(new Error('未找到 MINIMAX_API_KEY 或 MINIMAX_GROUP_ID 环境变量'));
  }

  const bodyStr = JSON.stringify(body);

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.minimax.chat',
      // GroupId 必须作为 URL query 参数传入
      path: `/v1/embeddings?GroupId=${GROUP_ID}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Length': Buffer.byteLength(bodyStr),
      },
    };

    const req = https.request(options, (res) => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(raw);
          // MiniMax 用 base_resp 表示状态，status_code 非 0 表示错误
          if (result.base_resp && result.base_resp.status_code !== 0) {
            throw new Error(`MiniMax 错误 ${result.base_resp.status_code}: ${result.base_resp.status_msg}`);
          }
          // 向量在 vectors 字段，不是 data
          if (!result.vectors || !Array.isArray(result.vectors)) {
            throw new Error('MiniMax 返回格式异常: ' + raw);
          }
          resolve(result.vectors);
        } catch (e) {
          reject(new Error(`MiniMax Embedding API 错误: ${e.message}`));
        }
      });
    });

    req.on('error', reject);
    req.write(bodyStr);
    req.end();
  });
}

/**
 * 获取单个文本的 embedding
 * @param {string} text 输入文本
 * @param {'db'|'query'} type db=建索引时用，query=搜索时用
 */
async function getEmbedding(text, type = 'db') {
  const vectors = await makeRequest({
    model: EMBEDDING_MODEL,
    type,
    texts: [text],
  });
  return vectors[0].embedding;
}

/**
 * 批量获取 embeddings
 * @param {string[]} texts 文本数组
 * @param {'db'|'query'} type db=建索引时用，query=搜索时用
 */
async function getEmbeddings(texts, type = 'db') {
  if (!Array.isArray(texts) || texts.length === 0) {
    return [];
  }

  const vectors = await makeRequest({
    model: EMBEDDING_MODEL,
    type,
    texts,
  });

  // 按 index 排序，确保顺序与输入一致
  return vectors
    .sort((a, b) => a.index - b.index)
    .map(v => v.embedding);
}

module.exports = {
  getEmbedding,
  getEmbeddings,
  sleep,
};
