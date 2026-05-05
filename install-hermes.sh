#!/bin/bash
#
# Clover A-sales for Hermes - Skill 一键安装脚本
#
# 将 Clover A-sales 作为 Skill 安装到 Hermes 的 Skills 目录。
# 安装完成后无需启动任何服务，Hermes 通话结束后自动触发 AI 复盘。
#
# 用法:
#   bash install-hermes.sh
#   curl -fsSL https://raw.githubusercontent.com/yeaphgel/b2b-highticket/main/install-hermes.sh | bash
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
# Hermes 和 OpenClaw 共享同一个 ~/.agents/skills 目录。
# 如果已通过 install-openclaw.sh 安装过，此脚本会复用该目录。

detect_skills_dir() {
  local dir=""

  # 1. hermes CLI
  if command -v hermes &>/dev/null; then
    dir=$(hermes skills dir 2>/dev/null || true)
  fi

  # 2. 环境变量
  dir="${dir:-${HERMES_SKILLS_DIR:-}}"

  # 3. 与 OpenClaw 共享的常见路径
  if [ -z "$dir" ]; then
    for candidate in \
      "$HOME/.agents/skills" \
      "$HOME/.hermes/skills" \
      "$HOME/Library/Application Support/Hermes/skills"
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
    log_warning "无法自动检测 Hermes 的 Skills 目录"
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

  log_section "安装 Skill 到 Hermes"
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

  # ARK_API_KEY（通话 AI 复盘必需）
  if [ -n "${ARK_API_KEY:-}" ]; then
    _write_env ARK_API_KEY "$ARK_API_KEY"
    log_success "ARK_API_KEY 已自动写入 .env"
  else
    echo ""
    log_warning "ARK_API_KEY 是通话 AI 复盘的必需配置"
    read -rp "  请输入 ARK_API_KEY（留空则稍后手动编辑 .env）: " key_input
    if [ -n "$key_input" ]; then
      _write_env ARK_API_KEY "$key_input"
      log_success "ARK_API_KEY 已写入 .env"
    else
      log_warning "已跳过，请稍后编辑: ${skill_dir}/.env"
    fi
  fi

  # HERMES_SECRET / HERMES_API_KEY 仅在服务模式（Webhook）下需要
  # Skill 模式下 Hermes 直接调用脚本，无 Webhook 请求，无需配置
  # 如果环境变量中已设置（服务模式场景），自动写入；否则跳过
  if [ -n "${HERMES_SECRET:-}" ]; then
    _write_env HERMES_SECRET "$HERMES_SECRET"
    log_success "HERMES_SECRET 已自动写入 .env（服务模式）"
  fi

  if [ -n "${HERMES_API_KEY:-}" ]; then
    _write_env HERMES_API_KEY "$HERMES_API_KEY"
    log_success "HERMES_API_KEY 已自动写入 .env（服务模式）"
  fi
}

# ─── 构建知识库索引 ───────────────────────────────────────────

build_index() {
  local skill_dir="$1"
  cd "$skill_dir"

  log_section "构建知识库向量索引"

  if ! grep -q "^ARK_API_KEY=." .env 2>/dev/null; then
    log_warning "ARK_API_KEY 未配置，跳过索引构建"
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

  echo -e "${BLUE}通话自动复盘（Hermes 核心功能）${NC}:"
  echo "  通话结束后，Hermes 自动触发 Clover AI 复盘："
  echo "  • 十维度能力评分（破冰、识别需求、传达价值...）"
  echo "  • 与销冠对标分析，找出差距维度"
  echo "  • GROW 教练建议（本周聚焦改进点）"
  echo "  • 客户档案自动更新"
  echo ""

  echo -e "${BLUE}在 Hermes 对话中使用${NC}:"
  echo "  /sales        → 进入销售教练模式"
  echo "  /早报          → 今日销售早报"
  echo "  /客户列表      → 查看客户档案"
  echo "  /重建索引      → 更新知识库"
  echo ""

  echo -e "${BLUE}自然语言触发示例${NC}:"
  echo '  "刚才那通电话复盘一下"    → 最近通话 AI 分析'
  echo '  "我的十维度评分怎么样？"  → 维度评分 + 对标报告'
  echo '  "A 客户现在进展到哪了？"  → 调取客户档案'
  echo ""

  echo -e "${BLUE}配置说明${NC}:"
  echo "  Skill 模式无需额外 API key 即可使用基础功能"
  echo "  如需知识库语义搜索，可配置 ARK_API_KEY："
  echo "    vim ${skill_dir}/.env"
  echo "    → 填写 ARK_API_KEY=你的密钥（可从火山引擎获取）"
  echo "    → 然后运行: cd ${skill_dir}/scripts && node index.js"
  echo ""

  echo -e "${BLUE}文档${NC}: https://github.com/yeaphgel/b2b-highticket"
  echo ""
}

# ─── 主程序 ──────────────────────────────────────────────────

main() {
  echo ""
  echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}"
  echo -e "${BLUE}║  🎧 Clover A-sales × Hermes Skill 安装程序    ║${NC}"
  echo -e "${BLUE}╚════════════════════════════════════════════════╝${NC}"
  echo ""

  check_deps

  SKILLS_DIR=$(detect_skills_dir)
  SKILL_DIR="${SKILLS_DIR}/clover-a-sales"

  install_skill  "$SKILLS_DIR"
  setup_env      "$SKILL_DIR"
  build_index    "$SKILL_DIR"
  show_done      "$SKILL_DIR"
}

trap 'echo ""; log_error "安装中断"; exit 1' ERR INT

main
