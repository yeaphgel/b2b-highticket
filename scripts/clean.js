#!/usr/bin/env node
/**
 * 知识库文件自动清理脚本
 * 扫描 data/knowledge/ 下所有 .md 文件，自动修复格式问题
 *
 * 处理内容：
 * - 自动补全缺失的 # 标题（用文件名生成）
 * - 删除微信追踪图片（data:image/svg+xml... 等 base64 内联图片）
 * - 删除空的图片引用（![](空)）
 * - 清理多余的空行（超过2个连续空行压缩为1个）
 * - 删除首尾多余空白
 *
 * 使用方法：
 *   node clean.js            （清理全部文件）
 *   node clean.js "某文件.md" （清理单个文件）
 */

const fs = require('fs');
const path = require('path');

const KNOWLEDGE_DIR = path.join(__dirname, '../data/knowledge');

function readAllMarkdownFiles(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...readAllMarkdownFiles(fullPath));
    } else if (entry.name.endsWith('.md') && entry.name !== 'README.md') {
      files.push(fullPath);
    }
  }
  return files;
}

function cleanMarkdown(content, filename) {
  let text = content;

  // 1. 删除 YAML frontmatter（微信读书工具箱导出的书籍元数据，对知识库无意义）
  text = text.replace(/^---[\s\S]*?---\n*/m, '');

  // 2. 删除微信/公众号的追踪图片（base64 内联图片，对知识库无意义）
  text = text.replace(/!\[[^\]]*\]\(data:[^)]+\)/g, '');

  // 3. 删除空的图片引用
  text = text.replace(/!\[\]\(\s*\)/g, '');
  text = text.replace(/!\[[^\]]*\]\(\s*\)/g, '');

  // 4. 删除 HTML 标签（MarkDownload 有时会保留部分标签）
  text = text.replace(/<[^>]+>/g, '');

  // 5. 清理多余空行（超过 2 个连续空行合并为 1 个）
  text = text.replace(/\n{3,}/g, '\n\n');

  // 6. 删除首尾空白
  text = text.trim();

  // 7. 检查是否有 # 标题，没有则用文件名自动生成
  const hasTitle = /^#\s+.+/m.test(text);
  if (!hasTitle) {
    const title = path.basename(filename, '.md').replace(/[-_]/g, ' ');
    text = `# ${title}\n\n${text}`;
  }

  return text;
}

function cleanFile(filePath) {
  const original = fs.readFileSync(filePath, 'utf-8');
  const filename = path.basename(filePath);
  const cleaned = cleanMarkdown(original, filename);

  if (cleaned === original.trim()) {
    return { changed: false };
  }

  fs.writeFileSync(filePath, cleaned + '\n', 'utf-8');
  return { changed: true };
}

function main() {
  const targetArg = process.argv[2];
  let files;

  if (targetArg) {
    const targetPath = path.isAbsolute(targetArg)
      ? targetArg
      : path.join(KNOWLEDGE_DIR, targetArg);
    if (!fs.existsSync(targetPath)) {
      console.error(`❌ 文件不存在：${targetPath}`);
      process.exit(1);
    }
    files = [targetPath];
  } else {
    files = readAllMarkdownFiles(KNOWLEDGE_DIR);
  }

  if (files.length === 0) {
    console.log('data/knowledge/ 下没有找到 .md 文件');
    return;
  }

  let changed = 0;
  for (const file of files) {
    const rel = path.relative(KNOWLEDGE_DIR, file);
    const result = cleanFile(file);
    if (result.changed) {
      console.log(`  ✅ 已清理：${rel}`);
      changed++;
    } else {
      console.log(`  ✓  无需处理：${rel}`);
    }
  }

  console.log(`\n完成，共处理 ${files.length} 个文件，${changed} 个已修复。`);
}

main();

module.exports = { cleanMarkdown, cleanFile, readAllMarkdownFiles };
