#!/usr/bin/env node
/**
 * 微信公众号文章抓取脚本
 * 将文章 URL 转换为 Markdown 文件，保存到 data/knowledge/articles/
 *
 * 使用方法：
 *   单篇：node fetch-article.js "https://mp.weixin.qq.com/s/xxxx"
 *   批量：node fetch-article.js urls.txt   （文本文件，每行一个 URL）
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const OUTPUT_DIR = path.join(__dirname, '../data/knowledge/articles');

// 模拟浏览器请求头，尽量避免被屏蔽
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'zh-CN,zh;q=0.9',
  'Accept-Encoding': 'identity',
  'Connection': 'keep-alive',
};

// ─── HTML 解析工具 ─────────────────────────────────────────────────────────

/**
 * 从微信文章 HTML 中提取标题
 */
function extractTitle(html) {
  const patterns = [
    /<h1[^>]*id="activity-name"[^>]*>([\s\S]*?)<\/h1>/i,
    /<title>([\s\S]*?)<\/title>/i,
    /<meta[^>]*property="og:title"[^>]*content="([^"]+)"/i,
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m) return m[1].replace(/<[^>]+>/g, '').trim();
  }
  return '未知标题';
}

/**
 * 从微信文章 HTML 中提取正文内容
 */
function extractContent(html) {
  // 微信文章正文在 id="js_content" 的 div 里
  const contentMatch = html.match(/<div[^>]*id="js_content"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/i)
    || html.match(/<div[^>]*class="rich_media_content"[^>]*>([\s\S]*?)<\/div>/i);

  if (!contentMatch) return null;
  return contentMatch[1];
}

/**
 * 简单的 HTML → Markdown 转换
 */
function htmlToMarkdown(html) {
  return html
    // 段落
    .replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, (_, inner) => {
      const text = inner.replace(/<[^>]+>/g, '').trim();
      return text ? `\n${text}\n` : '';
    })
    // 标题
    .replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, (_, t) => `\n# ${t.replace(/<[^>]+>/g, '').trim()}\n`)
    .replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, (_, t) => `\n## ${t.replace(/<[^>]+>/g, '').trim()}\n`)
    .replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, (_, t) => `\n### ${t.replace(/<[^>]+>/g, '').trim()}\n`)
    // 粗体
    .replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, (_, t) => `**${t.replace(/<[^>]+>/g, '').trim()}**`)
    .replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, (_, t) => `**${t.replace(/<[^>]+>/g, '').trim()}**`)
    // 列表
    .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_, t) => `\n- ${t.replace(/<[^>]+>/g, '').trim()}`)
    .replace(/<\/ul>|<\/ol>/gi, '\n')
    // 换行
    .replace(/<br\s*\/?>/gi, '\n')
    // 去掉剩余 HTML 标签
    .replace(/<[^>]+>/g, '')
    // 处理 HTML 实体
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    // 清理多余空行
    .replace(/\n{4,}/g, '\n\n\n')
    .trim();
}

/**
 * 生成安全的文件名
 */
function safeFilename(title) {
  return title
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 80) + '.md';
}

// ─── 网络请求 ─────────────────────────────────────────────────────────────

function fetchUrl(targetUrl, redirectCount = 0) {
  if (redirectCount > 5) return Promise.reject(new Error('重定向次数过多'));

  const parsed = new URL(targetUrl);
  const client = parsed.protocol === 'https:' ? https : http;

  return new Promise((resolve, reject) => {
    const req = client.get(
      { hostname: parsed.hostname, path: parsed.pathname + parsed.search, headers: HEADERS },
      (res) => {
        // 处理重定向
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          const redirectUrl = res.headers.location.startsWith('http')
            ? res.headers.location
            : `${parsed.protocol}//${parsed.hostname}${res.headers.location}`;
          res.resume();
          return resolve(fetchUrl(redirectUrl, redirectCount + 1));
        }

        if (res.statusCode !== 200) {
          return reject(new Error(`HTTP ${res.statusCode}`));
        }

        let body = '';
        res.setEncoding('utf-8');
        res.on('data', chunk => body += chunk);
        res.on('end', () => resolve(body));
      }
    );
    req.on('error', reject);
    req.setTimeout(15000, () => { req.destroy(); reject(new Error('请求超时')); });
  });
}

// ─── 主流程 ───────────────────────────────────────────────────────────────

async function fetchArticle(articleUrl) {
  console.log(`  🌐 正在抓取: ${articleUrl}`);

  let html;
  try {
    html = await fetchUrl(articleUrl);
  } catch (e) {
    throw new Error(`网络请求失败: ${e.message}`);
  }

  // 检测是否触发了微信的验证页面
  if (html.includes('环境异常') || html.includes('验证后即可继续') || html.includes('wx_oauth')) {
    throw new Error('微信返回了验证页面（反爬保护）。请参考 README 使用浏览器手动复制方式。');
  }

  const title = extractTitle(html);
  const contentHtml = extractContent(html);

  if (!contentHtml) {
    throw new Error('无法提取文章正文，可能页面结构已变化');
  }

  const markdown = htmlToMarkdown(contentHtml);

  if (markdown.length < 100) {
    throw new Error('提取的内容太少，可能文章需要登录才能查看');
  }

  const metadata = [
    `# ${title}`,
    ``,
    `> 来源：${articleUrl}`,
    `> 导入时间：${new Date().toLocaleDateString('zh-CN')}`,
    ``,
    `---`,
    ``,
    markdown,
  ].join('\n');

  const filename = safeFilename(title);
  const outputPath = path.join(OUTPUT_DIR, filename);
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(outputPath, metadata, 'utf-8');

  return { title, filename, chars: markdown.length };
}

async function main() {
  const input = process.argv[2];

  if (!input) {
    console.error('用法：node fetch-article.js "URL" 或 node fetch-article.js urls.txt');
    process.exit(1);
  }

  // 判断是 URL 还是文件
  let urls = [];
  if (input.startsWith('http')) {
    urls = [input.trim()];
  } else if (fs.existsSync(input)) {
    urls = fs.readFileSync(input, 'utf-8')
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.startsWith('http'));
  } else {
    console.error(`❌ 无法识别输入：${input}`);
    process.exit(1);
  }

  console.log(`\n📥 共 ${urls.length} 篇文章待导入...\n`);

  let success = 0, failed = 0;

  for (const u of urls) {
    try {
      const result = await fetchArticle(u);
      console.log(`  ✅ "${result.title}" → ${result.filename} (${result.chars} 字)`);
      success++;
      // 每篇文章之间等待 2 秒，避免触发频率限制
      if (urls.length > 1) await new Promise(r => setTimeout(r, 2000));
    } catch (e) {
      console.log(`  ❌ 失败: ${e.message}`);
      failed++;
    }
  }

  console.log(`\n完成！成功 ${success} 篇，失败 ${failed} 篇`);

  if (success > 0) {
    console.log('\n📌 下一步：运行 node index.js 更新知识库索引');
  }
}

main().catch(err => {
  console.error('❌', err.message);
  process.exit(1);
});
