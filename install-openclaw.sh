#!/bin/bash
#
# Clover A-sales for OpenClaw - Skill 一键安装脚本
#
# 将 Clover A-sales 作为 Skill 安装到 OpenClaw 的 Skills 目录。
# 安装完成后无需启动任何服务，直接在 OpenClaw 中使用 /sales 指令。
#
# 用法:
#   bash install-openclaw.sh
#   curl -fsSL https://raw.githubusercontent.com/yeaphgel/b2b-highticket/main/install-openclaw.sh | bash
#

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

log_info()    { echo -e "${BLUE}ℹ${NC} $1"; }
log_success() { echo -e "${GREEN}✓${NC} $1"; }
log_warning() { echo -e "${YELLOW}⚠${NC} $1"; }
log_error()   { echo -e "${RED}✗${NC} $1"; }
log_section() {
  echo ""
  echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${PURPLE}  $1${NC}"
  echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
}

# ─── 环境检查 ────────────────────────────────────────────────

check_deps() {
  log_section "环境检查"

  if ! command -v node &>/dev/null; then
    log_error "未找到 Node.js，请先安装 Node.js 18+"
    log_info  "下载地址: https://nodejs.org/"
    exit 1
  fi
  local ver
  ver=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
  if [ "$ver" -lt 18 ]; then
    log_error "Node.js 版本过低（当前 $(node -v)），需要 18+"
    exit 1
  fi
  log_success "Node.js $(node -v)"

  if ! command -v npm &>/dev/null; then
    log_error "未找到 npm"
    exit 1
  fi
  log_success "npm $(npm -v)"

  if ! command -v git &>/dev/null; then
    log_error "未找到 git，安装 Skill 需要 git"
    exit 1
  fi
  log_success "git $(git --version | awk '{print $3}')"
}

# ─── 检测 Skills 目录 ─────────────────────────────────────────

detect_skills_dir() {
  local dir=""

  # 1. openclaw CLI
  if command -v openclaw &>/dev/null; then
    dir=$(openclaw skills dir 2>/dev/null || true)
  fi

  # 2. 环境变量
  dir="${dir:-${OPENCLAW_SKILLS_DIR:-}}"

  # 3. 常见默认路径
  if [ -z "$dir" ]; then
    for candidate in \
      "$HOME/.agents/skills" \
      "$HOME/.openclaw/skills" \
      "$HOME/Library/Application Support/OpenClaw/skills"
    do
      if [ -d "$candidate" ]; then
        dir="$candidate"
        break
      fi
    done
  fi

  # 4. 交互询问
  if [ -z "$dir" ]; then
    dir="$HOME/.agents/skills"
    echo ""
    log_warning "无法自动检测 OpenClaw 的 Skills 目录"
    read -rp "  请输入 Skills 目录路径（直接回车使用默认 ${dir}）: " input
    [ -n "$input" ] && dir="$input"
  fi

  echo "$dir"
}

# ─── 安装 Skill ───────────────────────────────────────────────

install_skill() {
  local skills_dir="$1"
  local skill_dir="${skills_dir}/clover-a-sales"
  local max_retries=3
  local retry_count=0

  log_section "安装 Skill 到 OpenClaw"
  log_info "Skills 目录: ${skills_dir}"

  mkdir -p "$skills_dir"

  if [ -d "${skill_dir}/.git" ]; then
    log_info "Skill 已存在，拉取最新更新..."
    git -C "$skill_dir" pull origin main
    log_success "更新完成"
  else
    log_info "正在克隆仓库: https://github.com/yeaphgel/b2b-highticket.git"

    # 重试机制
    while [ $retry_count -lt $max_retries ]; do
      log_info "尝试克隆... (${retry_count}/${max_retries})"

      if git clone https://github.com/yeaphgel/b2b-highticket.git "$skill_dir" 2>&1; then
        log_success "克隆完成"
        break
      else
        retry_count=$((retry_count + 1))
        if [ $retry_count -lt $max_retries ]; then
          log_warning "克隆失败，等待后重试... (${retry_count}/${max_retries})"
          sleep $((retry_count * 2))  # 指数退避: 2s, 4s, 6s
        else
          log_error "克隆失败，已达最大重试次数"
          log_info "🔧 手动解决方案："
          log_info "  1. 确保网络连接正常"
          log_info "  2. 手动执行："
          log_info "     cd ${skills_dir}"
          log_info "     git clone https://github.com/yeaphgel/b2b-highticket.git clover-a-sales"
          log_info "  3. 或者使用 SSH（如果配置了 SSH 密钥）："
          log_info "     git clone git@github.com:yeaphgel/b2b-highticket.git clover-a-sales"
          exit 1
        fi
      fi
    done
  fi

  cd "$skill_dir"

  log_info "安装 Node.js 依赖..."
  npm install --prefer-offline --no-audit --silent
  log_success "依赖安装完成"
}

# ─── 配置环境变量 ─────────────────────────────────────────────

setup_env() {
  local skill_dir="$1"
  cd "$skill_dir"

  log_section "配置环境变量"

  if [ ! -f .env ]; then
    cp .env.example .env
    log_success ".env 文件已创建"
  else
    log_info ".env 文件已存在，跳过创建"
  fi

  _write_env() {
    local key="$1" val="$2"
    if [[ "$OSTYPE" == "darwin"* ]]; then
      sed -i '' "s|^${key}=.*|${key}=${val}|" .env
    else
      sed -i "s|^${key}=.*|${key}=${val}|" .env
    fi
  }

  # JINA_API_KEY（知识库语义搜索，免费）
  if [ -n "${JINA_API_KEY:-}" ]; then
    _write_env JINA_API_KEY "$JINA_API_KEY"
    log_success "JINA_API_KEY 已自动写入 .env"
  else
    echo ""
    log_info "JINA_API_KEY 用于知识库语义搜索（免费，每月 1M tokens）"
    log_info "免费申请：https://jina.ai（邮箱注册即可）"
    read -rp "  请输入 JINA_API_KEY（留空则跳过，稍后手动编辑 .env）: " key_input
    if [ -n "$key_input" ]; then
      _write_env JINA_API_KEY "$key_input"
      log_success "JINA_API_KEY 已写入 .env"
    else
      log_warning "已跳过，如需语义搜索请稍后编辑: ${skill_dir}/.env"
    fi
  fi

  # 可选：OpenClaw Secret
  if [ -n "${OPENCLAW_SECRET:-}" ]; then
    _write_env OPENCLAW_SECRET "$OPENCLAW_SECRET"
    log_success "OPENCLAW_SECRET 已自动写入 .env"
  fi
}

# ─── 构建知识库索引 ───────────────────────────────────────────

build_index() {
  local skill_dir="$1"
  cd "$skill_dir"

  log_section "构建知识库向量索引"

  if ! grep -q "^JINA_API_KEY=." .env 2>/dev/null && ! grep -q "^ARK_API_KEY=." .env 2>/dev/null; then
    log_warning "JINA_API_KEY 未配置，跳过索引构建"
    log_info  "可稍后进入 Skill 目录手动运行："
    log_info  "  cd ${skill_dir}/scripts && node index.js"
    return
  fi

  log_info "正在构建索引（首次约需 1-3 分钟）..."
  if (cd scripts && node index.js); then
    log_success "知识库索引构建完成"
  else
    log_warning "索引构建失败，可稍后手动运行: cd ${skill_dir}/scripts && node index.js"
  fi
}

# ─── 安装子 Agent ─────────────────────────────────────────────

install_agents() {
  local skill_dir="$1"
  local skills_dir="$2"
  local agents_dir="${skills_dir}/../agents"

  log_section "安装子 Agent"

  if [ ! -d "${skill_dir}/agents" ]; then
    log_warning "agents/ 目录不存在，跳过子 Agent 安装"
    return
  fi

  mkdir -p "$agents_dir"
  local count=0
  for agent_file in "${skill_dir}/agents/"*.md; do
    [ -f "$agent_file" ] || continue
    cp "$agent_file" "$agents_dir/"
    log_success "已安装子 Agent: $(basename "$agent_file")"
    count=$((count + 1))
  done

  if [ "$count" -gt 0 ]; then
    log_success "共安装 ${count} 个子 Agent 到 ${agents_dir}"
  fi
}

# ─── 完成提示 ─────────────────────────────────────────────────

show_done() {
  local skill_dir="$1"

  echo ""
  echo -e "${GREEN}╔════════════════════════════════════════════════╗${NC}"
  echo -e "${GREEN}║  ✅  Clover A-sales Skill 安装完成！           ║${NC}"
  echo -e "${GREEN}╚════════════════════════════════════════════════╝${NC}"
  echo ""

  echo -e "${BLUE}Skill 位置${NC}:  ${skill_dir}"
  echo ""

  echo -e "${BLUE}在 OpenClaw 中激活${NC}:"
  echo "  输入 /sales 或 /销售 → 进入销售教练模式"
  echo ""

  echo -e "${BLUE}快捷指令${NC}:"
  echo "  /sales        → 进入销售教练模式"
  echo "  /仪表盘        → 查看游戏化进度（等级/积分/徽章）"
  echo "  /新手          → 新手入门 ToB 销售指南"
  echo "  /早报          → 今日销售早报（7 条洞察）"
  echo "  /日报          → 引导填写销售日报"
  echo "  /竞品          → 竞品分析"
  echo "  /交易策略      → 制定推进策略"
  echo "  /利益方        → 利益相关者分析"
  echo "  /客户列表      → 查看所有客户档案"
  echo "  /重建索引      → 更新知识库索引"
  echo ""

  echo -e "${BLUE}子 Agent${NC}:"
  echo "  clover-sales-coach    → 通话复盘、十维度评分、GROW 教练"
  echo "  clover-sales-engineer → 战略规划、竞品分析、交易推进"
  echo "  clover-top-seller     → 顶尖话术、成交技巧、客户心理"
  echo ""

  echo -e "${BLUE}自然语言触发示例${NC}:"
  echo '  "客户说价格太贵怎么办？"  → 话术指导'
  echo '  "帮我分析 A 客户的进展"   → 客户档案 + 阶段建议'
  echo '  "这单怎么推进？"          → 战略规划'
  echo '  "今天早报"                → 每日洞察推送'
  echo ""

  echo -e "${BLUE}配置说明${NC}:"
  echo "  基础功能无需任何 API key 即可使用"
  echo "  如需知识库语义搜索（推荐），配置免费的 JINA_API_KEY："
  echo "    vim ${skill_dir}/.env"
  echo "    → 填写 JINA_API_KEY=你的密钥（免费申请：https://jina.ai）"
  echo "    → 然后运行: cd ${skill_dir}/scripts && node index.js"
  echo ""

  echo -e "${BLUE}文档${NC}: https://github.com/yeaphgel/b2b-highticket"
  echo ""
}

# ─── 主程序 ──────────────────────────────────────────────────

main() {
  echo ""
  echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}"
  echo -e "${BLUE}║  🎮 Clover A-sales × OpenClaw Skill 安装程序  ║${NC}"
  echo -e "${BLUE}╚════════════════════════════════════════════════╝${NC}"
  echo ""

  check_deps

  SKILLS_DIR=$(detect_skills_dir)
  SKILL_DIR="${SKILLS_DIR}/clover-a-sales"

  install_skill   "$SKILLS_DIR"
  setup_env       "$SKILL_DIR"
  build_index     "$SKILL_DIR"
  install_agents  "$SKILL_DIR" "$SKILLS_DIR"
  show_done       "$SKILL_DIR"
}

trap 'echo ""; log_error "安装中断"; exit 1' ERR INT

main
