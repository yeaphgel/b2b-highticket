#!/usr/bin/env node
/**
 * 语义搜索脚本 - 由 OpenClaw 调用
 * 将用户问题向量化，在本地知识库索引中做语义相似度搜索
 *
 * 使用方法：
 *   node search.js "客户一直拖着不签合同怎么办"
 *
 * 输出：JSON 格式的相关内容，供 OpenClaw 的 LLM 生成回答
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const INDEX_FILE = path.join(__dirname, '../data/index.json');
const TOP_K = 5;             // 返回最相关的 K 个文本块
const MIN_SIMILARITY = 0.4;  // 最低相似度阈值（低于此值不返回）

const API_KEY = process.env.ARK_API_KEY;
const EMBEDDING_MODEL = process.env.DOUBAO_EMBEDDING_MODEL || 'doubao-embedding-large';

// ─── 向量计算 ─────────────────────────────────────────────────────────────

function cosineSimilarity(a, b) {
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  if (magA === 0 || magB === 0) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

// ─── Embedding API ────────────────────────────────────────────────────────

async function getEmbedding(text) {
  if (!API_KEY) {
    throw new Error('未找到 ARK_API_KEY 环境变量');
  }

  const body = JSON.stringify({ model: EMBEDDING_MODEL, input: [text] });

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'ark.cn-beijing.volces.com',
      path: '/api/v3/embeddings',
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
          if (result.error) throw new Error(result.error.message);
          resolve(result.data[0].embedding);
        } catch (e) {
          reject(new Error(`Embedding API 错误: ${raw}`));
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ─── 书名格式化 ───────────────────────────────────────────────────────────

/**
 * 将文件名转换为可读的书名/来源
 * 例：大客户销售这样说这样做-ai大纲.md → 《大客户销售这样说这样做》AI大纲
 *     销售铁军-热门.md → 《销售铁军》热门标注
 *     做销售千万不能犯的销售大忌.md → 公众号文章
 */
function formatSourceName(filename) {
  // 去掉扩展名和路径
  let name = filename.replace(/\.md$/, '').replace(/^.*[/\\]/, '');

  // 识别后缀类型
  const suffixMap = {
    '-ai大纲': 'AI大纲',
    '-热门': '热门标注',
    '-个人': '个人标注',
    '-全书': '全书内容',
  };

  let suffix = '';
  for (const [key, label] of Object.entries(suffixMap)) {
    if (name.endsWith(key)) {
      name = name.slice(0, -key.length);
      suffix = label;
      break;
    }
  }

  // 判断是书籍还是文章（书籍通常有后缀标识）
  if (suffix) {
    return `《${name}》${suffix}`;
  }

  // 没有后缀的，判断是否像公众号文章（文件名较长、包含标点）
  if (name.length > 15 || /[，。！？、]/.test(name)) {
    return `公众号文章《${name.slice(0, 20)}${name.length > 20 ? '…' : ''}》`;
  }

  return `《${name}》`;
}

// ─── 主流程 ───────────────────────────────────────────────────────────────

async function main() {
  const query = process.argv[2];

  if (!query || query.trim().length === 0) {
    outputError('请提供搜索问题，例如：node search.js "客户说产品太贵怎么办"');
    process.exit(1);
  }

  // 检查索引文件
  if (!fs.existsSync(INDEX_FILE)) {
    outputError('知识库索引不存在，请先运行 node index.js 构建索引');
    process.exit(1);
  }

  // 加载索引
  let indexData;
  try {
    indexData = JSON.parse(fs.readFileSync(INDEX_FILE, 'utf-8'));
  } catch (e) {
    outputError(`读取索引文件失败: ${e.message}`);
    process.exit(1);
  }

  if (!indexData.chunks || indexData.chunks.length === 0) {
    outputError('知识库索引为空，请重新运行 node index.js');
    process.exit(1);
  }

  // 对问题做向量化
  let queryEmbedding;
  try {
    queryEmbedding = await getEmbedding(query);
  } catch (e) {
    outputError(`向量化失败: ${e.message}`);
    process.exit(1);
  }

  // 计算相似度并排序
  const scored = indexData.chunks.map(chunk => ({
    ...chunk,
    score: cosineSimilarity(queryEmbedding, chunk.embedding),
  }));

  scored.sort((a, b) => b.score - a.score);

  // 过滤和去重（同一文档不超过 2 个块，避免信息重复）
  const seen = {};
  const results = [];

  for (const item of scored) {
    if (item.score < MIN_SIMILARITY) break;
    if (results.length >= TOP_K) break;

    const sourceKey = item.source;
    seen[sourceKey] = (seen[sourceKey] || 0) + 1;
    if (seen[sourceKey] > 2) continue;

    results.push({
      source: item.source,
      docTitle: item.docTitle,
      sectionTitle: item.sectionTitle,
      content: item.content,
      score: Math.round(item.score * 100) / 100,
    });
  }

  // 输出 JSON（OpenClaw 的 LLM 读取这个结果来生成回答）
  const output = {
    query,
    totalFound: results.length,
    indexedAt: indexData.createdAt,
    results: results.map((r, i) => ({
      rank: i + 1,
      source: r.docTitle,
      sourceName: formatSourceName(r.source),  // 格式化后的可读书名
      section: r.sectionTitle,
      relevance: r.score,
      content: r.content,
    })),
  };

  process.stdout.write(JSON.stringify(output, null, 2));
}

function outputError(message) {
  process.stdout.write(JSON.stringify({ error: message, results: [] }, null, 2));
}

main().catch(err => {
  outputError(err.message);
  process.exit(1);
});
