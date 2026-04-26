#!/usr/bin/env node
/**
 * 知识库索引构建脚本
 * 将 data/knowledge/ 下的 Markdown(.md) 和 PDF(.pdf) 文件切块、向量化
 * 保存到 data/index.json
 *
 * 使用方法：
 *   node index.js
 *
 * 何时运行：
 *   - 第一次使用时
 *   - 向 data/knowledge/ 添加或修改文件后
 *
 * PDF 支持说明：
 *   需要系统安装 pdftotext 工具
 *   Mac:   brew install poppler
 *   Linux: apt-get install poppler-utils
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');
const { cleanFile } = require('./clean');

const KNOWLEDGE_DIR = path.join(__dirname, '../data/knowledge');
const INDEX_FILE = path.join(__dirname, '../data/index.json');
const CHUNK_SIZE = 350;
const CHUNK_OVERLAP = 60;
const BATCH_SIZE = 10;
const BATCH_DELAY_MS = 500;

const API_KEY = process.env.ARK_API_KEY;
const EMBEDDING_MODEL = process.env.DOUBAO_EMBEDDING_MODEL || 'doubao-embedding-large';

// ─── 工具函数 ─────────────────────────────────────────────────────────────

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function getEmbeddings(texts) {
  if (!API_KEY) {
    throw new Error('未找到 ARK_API_KEY 环境变量，请确认 OpenClaw 中已配置豆包 API Key');
  }

  const body = JSON.stringify({ model: EMBEDDING_MODEL, input: texts });

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
          resolve(result.data.map(item => item.embedding));
        } catch (e) {
          reject(new Error(`Embedding API 返回错误: ${raw}`));
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ─── PDF 解析 ─────────────────────────────────────────────────────────────

function checkPdfToText() {
  try {
    execSync('which pdftotext', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function extractPdfText(filePath) {
  try {
    // pdftotext 将 PDF 内容输出到 stdout（-layout 保留排版）
    const text = execSync(`pdftotext -layout "${filePath}" -`, {
      encoding: 'utf-8',
      maxBuffer: 50 * 1024 * 1024,
    });
    return text;
  } catch (e) {
    throw new Error(`PDF 解析失败: ${e.message}`);
  }
}

// ─── 文本处理 ─────────────────────────────────────────────────────────────

function chunkText(content, filename, docTitle) {
  const chunks = [];

  // 先按标题分段（Markdown 用 # 号，纯文本用换行分隔的长段）
  const sections = content.split(/(?=^#{1,3}\s)/m).filter(s => s.trim().length > 20);

  for (const section of sections) {
    const sectionTitleMatch = section.match(/^#{1,3}\s+(.+)/m);
    const sectionTitle = sectionTitleMatch ? sectionTitleMatch[1].trim() : '';

    // 清理格式
    const text = section
      .replace(/^#{1,6}\s+/gm, '')
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/\*(.+?)\*/g, '$1')
      .replace(/`(.+?)`/g, '$1')
      .replace(/\[(.+?)\]\(.+?\)/g, '$1')
      .replace(/!\[[^\]]*\]\([^)]*\)/g, '')    // 删除图片引用
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    if (text.length < 30) continue;

    if (text.length <= CHUNK_SIZE) {
      chunks.push({ id: `${filename}::${chunks.length}`, source: filename, docTitle, sectionTitle, content: text });
    } else {
      let start = 0;
      while (start < text.length) {
        const end = Math.min(start + CHUNK_SIZE, text.length);
        const chunkText = text.slice(start, end).trim();
        if (chunkText.length > 30) {
          chunks.push({ id: `${filename}::${chunks.length}`, source: filename, docTitle, sectionTitle, content: chunkText });
        }
        start += CHUNK_SIZE - CHUNK_OVERLAP;
      }
    }
  }

  return chunks;
}

function chunkMarkdown(content, filename) {
  const titleMatch = content.match(/^#\s+(.+)/m);
  const docTitle = titleMatch ? titleMatch[1].trim() : path.basename(filename, '.md');
  return chunkText(content, filename, docTitle);
}

function chunkPdf(content, filename) {
  const docTitle = path.basename(filename, '.pdf');
  // PDF 纯文本没有 Markdown 标题，按段落切块
  const cleaned = content
    .replace(/\f/g, '\n\n')               // 换页符转换为段落分隔
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  return chunkText(cleaned, filename, docTitle);
}

// ─── 文件扫描 ─────────────────────────────────────────────────────────────

function readAllFiles(dir) {
  const mdFiles = [], pdfFiles = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const sub = readAllFiles(fullPath);
      mdFiles.push(...sub.mdFiles);
      pdfFiles.push(...sub.pdfFiles);
    } else if (entry.name.endsWith('.md') && entry.name !== 'README.md') {
      mdFiles.push(fullPath);
    } else if (entry.name.endsWith('.pdf')) {
      pdfFiles.push(fullPath);
    }
  }
  return { mdFiles, pdfFiles };
}

// ─── 主流程 ───────────────────────────────────────────────────────────────

async function main() {
  console.log('🔍 扫描知识库文件...\n');

  if (!fs.existsSync(KNOWLEDGE_DIR)) {
    console.error(`❌ 知识库目录不存在：${KNOWLEDGE_DIR}`);
    process.exit(1);
  }

  const { mdFiles, pdfFiles } = readAllFiles(KNOWLEDGE_DIR);
  const totalFiles = mdFiles.length + pdfFiles.length;

  if (totalFiles === 0) {
    console.error('❌ data/knowledge/ 下没有找到任何文件，请先添加 .md 或 .pdf 文件');
    process.exit(1);
  }

  // ── 自动清理 Markdown 文件格式 ──
  if (mdFiles.length > 0) {
    console.log('🧹 自动清理 Markdown 文件格式...');
    let cleaned = 0;
    for (const f of mdFiles) {
      const result = cleanFile(f);
      if (result.changed) {
        console.log(`  ✅ 已修复：${path.relative(KNOWLEDGE_DIR, f)}`);
        cleaned++;
      }
    }
    if (cleaned === 0) console.log('  所有文件格式正常，无需修复');
    console.log();
  }

  // ── 检查 PDF 支持 ──
  let pdfSupported = false;
  if (pdfFiles.length > 0) {
    pdfSupported = checkPdfToText();
    if (!pdfSupported) {
      console.warn('⚠️  检测到 PDF 文件，但未找到 pdftotext 工具，PDF 将被跳过。');
      console.warn('   安装方法：');
      console.warn('   Mac:   brew install poppler');
      console.warn('   Linux: apt-get install poppler-utils\n');
    }
  }

  // ── 切块 ──
  console.log('📄 切割文本块...');
  const allChunks = [];

  for (const filePath of mdFiles) {
    const relativeName = path.relative(KNOWLEDGE_DIR, filePath);
    const content = fs.readFileSync(filePath, 'utf-8');
    const chunks = chunkMarkdown(content, relativeName);
    allChunks.push(...chunks);
    console.log(`  ✓ [MD]  ${relativeName} → ${chunks.length} 块`);
  }

  if (pdfSupported) {
    for (const filePath of pdfFiles) {
      const relativeName = path.relative(KNOWLEDGE_DIR, filePath);
      try {
        const text = extractPdfText(filePath);
        const chunks = chunkPdf(text, relativeName);
        allChunks.push(...chunks);
        console.log(`  ✓ [PDF] ${relativeName} → ${chunks.length} 块`);
      } catch (e) {
        console.warn(`  ⚠️  [PDF] ${relativeName} 解析失败: ${e.message}`);
      }
    }
  }

  if (allChunks.length === 0) {
    console.error('\n❌ 没有提取到任何有效文本块，请检查文件内容');
    process.exit(1);
  }

  // ── 向量化 ──
  console.log(`\n📊 共 ${allChunks.length} 个文本块，开始向量化（模型：${EMBEDDING_MODEL}）...`);

  const indexedChunks = [];
  for (let i = 0; i < allChunks.length; i += BATCH_SIZE) {
    const batch = allChunks.slice(i, i + BATCH_SIZE);
    const texts = batch.map(c => `${c.docTitle} ${c.sectionTitle} ${c.content}`);

    process.stdout.write(`  进度: ${Math.min(i + BATCH_SIZE, allChunks.length)}/${allChunks.length}\r`);

    const embeddings = await getEmbeddings(texts);
    for (let j = 0; j < batch.length; j++) {
      indexedChunks.push({ ...batch[j], embedding: embeddings[j] });
    }

    if (i + BATCH_SIZE < allChunks.length) await sleep(BATCH_DELAY_MS);
  }

  // ── 保存 ──
  console.log('\n\n💾 保存索引...');
  fs.mkdirSync(path.dirname(INDEX_FILE), { recursive: true });
  fs.writeFileSync(INDEX_FILE, JSON.stringify({
    createdAt: new Date().toISOString(),
    model: EMBEDDING_MODEL,
    totalChunks: indexedChunks.length,
    chunks: indexedChunks,
  }, null, 2));

  console.log(`✅ 完成！共 ${indexedChunks.length} 个块，已保存到 data/index.json`);
  console.log('\n现在可以在飞书里测试了。');
}

main().catch(err => {
  console.error('❌ 构建失败:', err.message);
  process.exit(1);
});
