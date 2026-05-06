#!/usr/bin/env node
/**
 * embedding.js — 嵌入向量抽象层
 * 支持 Jina AI（默认，免费）和 Doubao（可选，国内付费）
 * 通过 EMBEDDING_PROVIDER 环境变量切换
 */

const https = require('https');

const PROVIDER = process.env.EMBEDDING_PROVIDER || 'jina';

const PROVIDERS = {
  jina: {
    hostname: 'api.jina.ai',
    path: '/v1/embeddings',
    getKey: () => process.env.JINA_API_KEY,
    getModel: () => process.env.JINA_EMBEDDING_MODEL || 'jina-embeddings-v3',
    keyName: 'JINA_API_KEY',
  },
  doubao: {
    hostname: 'ark.cn-beijing.volces.com',
    path: '/api/v3/embeddings',
    getKey: () => process.env.ARK_API_KEY,
    getModel: () => process.env.DOUBAO_EMBEDDING_MODEL || 'doubao-embedding-large',
    keyName: 'ARK_API_KEY',
  },
};

function getProvider() {
  const p = PROVIDERS[PROVIDER];
  if (!p) throw new Error(`未知的 EMBEDDING_PROVIDER: ${PROVIDER}，支持 jina / doubao`);
  return p;
}

function callEmbeddingAPI(texts) {
  const p = getProvider();
  const key = p.getKey();
  if (!key) {
    throw new Error(`未找到 ${p.keyName} 环境变量。如需免费使用请配置 Jina AI：https://jina.ai`);
  }

  const model = p.getModel();
  const body = JSON.stringify({ model, input: texts });

  return new Promise((resolve, reject) => {
    const options = {
      hostname: p.hostname,
      path: p.path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`,
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res) => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(raw);
          if (result.error) throw new Error(result.error.message || JSON.stringify(result.error));
          resolve(result.data.map(item => item.embedding));
        } catch (e) {
          reject(new Error(`Embedding API 返回错误: ${raw.slice(0, 300)}`));
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function getEmbeddings(texts) {
  return callEmbeddingAPI(texts);
}

async function getEmbedding(text) {
  const results = await callEmbeddingAPI([text]);
  return results[0];
}

module.exports = { getEmbeddings, getEmbedding, PROVIDER };
