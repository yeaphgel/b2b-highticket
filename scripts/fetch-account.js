#!/usr/bin/env node
/**
 * 微信公众号全量文章抓取脚本
 *
 * 两步走：
 *   第一步：从任意一篇文章 URL 里提取公众号 ID（__biz）
 *   第二步：批量抓取该公众号所有历史文章，保存为 Markdown
 *
 * 使用方法：
 *   node fetch-account.js "https://mp.weixin.qq.com/s/xxxx"
 *
 * 传入该公众号任意一篇文章的链接即可，脚本会自动找到公众号 ID 并抓取所有文章。
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, '../data/knowledge/articles');
const ARTICLE_DELAY_MS = 3000;  // 每篇文章间隔 3 秒（避免触发限制）
const LIST_DELAY_MS = 2000;     // 获取列表每页间隔 2 秒
const COUNT_PER_PAGE = 10;      // 每页文章数

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'zh-CN,zh;q=0.9',
  'Referer': 'https://mp.weixin.qq.com/',
};

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// ─── 网络请求 ─────────────────────────────────────────────────────────────

function fetchText(targetUrl, extraHeaders = {}) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(targetUrl);
    const req = https.get(
      {
        hostname: parsed.hostname,
        path: parsed.pathname + parsed.search,
        headers: { ...HEADERS, ...extraHeaders },
      },
      (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          res.resume();
          return resolve(fetchText(res.headers.location, extraHeaders));
        }
        let body = '';
        res.setEncoding('utf-8');
        res.on('data', c => body += c);
        res.on('end', () => resolve(body));
      }
    );
    req.on('error', reject);
    req.setTimeout(15000, () => { req.destroy(); reject(new Error('请求超时')); });
  });
}

// ─── 步骤一：从文章页面提取公众号信息 ────────────────────────────────────

async function extractAccountInfo(articleUrl) {
  console.log('🔍 读取文章页面，提取公众号 ID...');
  const html = await fetchText(articleUrl);

  if (html.includes('环境异常') || html.includes('验证后即可继续')) {
    throw new Error('BLOCKED');
  }

  // 提取 __biz（公众号唯一 ID）
  const bizMatch = html.match(/"__biz"\s*:\s*"([^"]+)"/)
    || html.match(/var\s+biz\s*=\s*["']([^"']+)["']/)
    || html.match(/\?__biz=([^&"]+)/);

  if (!bizMatch) {
    throw new Error('无法从文章页面提取公众号 ID（__biz），请尝试其他文章链接');
  }

  // 提取公众号名称
  const nameMatch = html.match(/<strong[^>]*class="profile_nickname"[^>]*>([\s\S]*?)<\/strong>/)
    || html.match(/<span[^>]*id="js_name"[^>]*>([\s\S]*?)<\/span>/);
  const accountName = nameMatch ? nameMatch[1].replace(/<[^>]+>/g, '').trim() : '未知公众号';

  return { biz: decodeURIComponent(bizMatch[1]), accountName };
}

// ─── 步骤二：获取文章列表 ─────────────────────────────────────────────────

async function fetchArticleList(biz) {
  const allArticles = [];
  let offset = 0;
  let hasMore = true;
  let page = 1;

  console.log('📋 获取文章列表...');

  while (hasMore) {
    const listUrl = `https://mp.weixin.qq.com/mp/profile_ext?action=getmsg&__biz=${encodeURIComponent(biz)}&f=json&offset=${offset}&count=${COUNT_PER_PAGE}&is_ok=1&scene=124`;

    let raw;
    try {
      raw = await fetchText(listUrl, { Accept: 'application/json' });
    } catch (e) {
      console.warn(`  ⚠️ 第 ${page} 页获取失败: ${e.message}`);
      break;
    }

    if (raw.includes('环境异常') || raw.includes('验证')) {
      console.warn('  ⚠️ 遭遇微信验证拦截，已获取部分列表');
      break;
    }

    let data;
    try {
      data = JSON.parse(raw);
    } catch (e) {
      console.warn(`  ⚠️ 第 ${page} 页解析失败，可能需要登录态`);
      break;
    }

    if (data.ret !== 0) {
      console.warn(`  ⚠️ API 返回错误码 ${data.ret}，获取列表中止`);
      break;
    }

    const msgList = data.general_msg_list
      ? JSON.parse(data.general_msg_list).list
      : [];

    for (const msg of msgList) {
      const articles = msg.app_msg_ext_info
        ? [msg.app_msg_ext_info, ...(msg.app_msg_ext_info.multi_app_msg_item_list || [])]
        : [];

      for (const article of articles) {
        if (article.content_url) {
          allArticles.push({
            title: article.title || '无标题',
            url: article.content_url.replace(/&amp;/g, '&'),
          });
        }
      }
    }

    console.log(`  第 ${page} 页，累计 ${allArticles.length} 篇文章`);

    hasMore = data.can_msg_continue === 1;
    offset += COUNT_PER_PAGE;
    page++;

    if (hasMore) await sleep(LIST_DELAY_MS);
  }

  return allArticles;
}

// ─── 步骤三：抓取并保存每篇文章 ──────────────────────────────────────────

function htmlToMarkdown(html) {
  return html
    .replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, (_, t) => {
      const text = t.replace(/<[^>]+>/g, '').trim();
      return text ? `\n${text}\n` : '';
    })
    .replace(/<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/gi, (m, t, ...args) => {
      const level = m.match(/<h(\d)/i)[1];
      return `\n${'#'.repeat(Number(level))} ${t.replace(/<[^>]+>/g, '').trim()}\n`;
    })
    .replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, (_, t) => `**${t.replace(/<[^>]+>/g, '').trim()}**`)
    .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_, t) => `\n- ${t.replace(/<[^>]+>/g, '').trim()}`)
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/\n{4,}/g, '\n\n\n')
    .trim();
}

function safeFilename(title) {
  return title.replace(/[<>:"/\\|?*\x00-\x1f]/g, '').replace(/\s+/g, '-').slice(0, 80) + '.md';
}

async function saveArticle(title, articleUrl, accountName) {
  const html = await fetchText(articleUrl);

  if (html.includes('环境异常') || html.includes('验证后即可继续')) {
    throw new Error('被微信拦截');
  }

  const contentMatch = html.match(/<div[^>]*id="js_content"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/i)
    || html.match(/<div[^>]*class="rich_media_content"[^>]*>([\s\S]*?)<\/div>/i);

  if (!contentMatch) throw new Error('无法提取正文');

  const markdown = htmlToMarkdown(contentMatch[1]);
  if (markdown.length < 80) throw new Error('内容太少（可能需要登录）');

  const content = [
    `# ${title}`,
    ``,
    `> 来源公众号：${accountName}`,
    `> 原文链接：${articleUrl}`,
    `> 导入时间：${new Date().toLocaleDateString('zh-CN')}`,
    ``,
    `---`,
    ``,
    markdown,
  ].join('\n');

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const filename = safeFilename(title);
  fs.writeFileSync(path.join(OUTPUT_DIR, filename), content, 'utf-8');
  return filename;
}

// ─── 主流程 ───────────────────────────────────────────────────────────────

async function main() {
  const sampleUrl = process.argv[2];

  if (!sampleUrl || !sampleUrl.startsWith('http')) {
    console.error('用法：node fetch-account.js "公众号任意一篇文章的URL"');
    process.exit(1);
  }

  // 第一步：提取公众号 ID
  let accountInfo;
  try {
    accountInfo = await extractAccountInfo(sampleUrl);
  } catch (e) {
    if (e.message === 'BLOCKED') {
      console.error('\n❌ 微信返回了验证页面，无法自动抓取。');
      console.error('\n推荐替代方案：');
      console.error('  1. 安装「微信读书工具箱」Chrome 插件，订阅该公众号后导出文章');
      console.error('  2. 或使用 weread-exporter (Mac) 导出公众号文章为 Markdown');
      console.error('  3. 或手动复制文章内容，保存为 .md 文件放入 data/knowledge/articles/');
      process.exit(1);
    }
    throw e;
  }

  console.log(`✅ 公众号：${accountInfo.accountName}（ID: ${accountInfo.biz}）\n`);

  // 第二步：获取文章列表
  const articles = await fetchArticleList(accountInfo.biz);

  if (articles.length === 0) {
    console.error('\n❌ 未能获取文章列表。');
    console.error('微信文章列表 API 通常需要登录态（cookies），自动化获取受限。');
    console.error('\n推荐方案：使用 weread-exporter 工具（参见 README）');
    process.exit(1);
  }

  console.log(`\n📚 共找到 ${articles.length} 篇文章，开始下载...\n`);

  // 保存文章列表备份
  const urlsFile = path.join(OUTPUT_DIR, '_article-urls.txt');
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(urlsFile, articles.map(a => `${a.title}\n${a.url}`).join('\n\n'), 'utf-8');
  console.log(`📄 文章链接已备份到 ${urlsFile}\n`);

  // 第三步：逐篇下载
  let success = 0, failed = 0;

  for (let i = 0; i < articles.length; i++) {
    const { title, url: articleUrl } = articles[i];
    process.stdout.write(`  [${i + 1}/${articles.length}] ${title.slice(0, 30)}...`);

    try {
      const filename = await saveArticle(title, articleUrl, accountInfo.accountName);
      console.log(` ✅`);
      success++;
    } catch (e) {
      console.log(` ❌ ${e.message}`);
      failed++;
    }

    if (i < articles.length - 1) await sleep(ARTICLE_DELAY_MS);
  }

  console.log(`\n✅ 完成！成功 ${success} 篇，失败 ${failed} 篇`);
  console.log(`📁 文件保存在：${OUTPUT_DIR}`);

  if (success > 0) {
    console.log('\n📌 下一步：运行 node index.js 更新知识库索引');
  }
}

main().catch(err => {
  console.error('❌ 出错：', err.message);
  process.exit(1);
});
