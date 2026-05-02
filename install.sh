#!/bin/bash
#
# Clover A-sales 销冠教练系统 - 通用安装脚本
#
# 用法: bash install.sh
#       或 curl -fsSL https://raw.githubusercontent.com/yeaphgel/clover-a-sales/main/install.sh | bash
#

set -e

# ─── 颜色定义 ─────────────────────────────────────────────────

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ─── 日志函数 ─────────────────────────────────────────────────

log_info() {
  echo -e "${BLUE}ℹ${NC} $1"
}

log_success() {
  echo -e "${GREEN}✓${NC} $1"
}

log_warning() {
  echo -e "${YELLOW}⚠${NC} $1"
}

log_error() {
  echo -e "${RED}✗${NC} $1"
}

# ─── 检查环境 ─────────────────────────────────────────────────

check_environment() {
  log_info "检查环境..."

  # 检查 Node.js
  if ! command -v node &> /dev/null; then
    log_error "未找到 Node.js，请先安装 Node.js 18+ 版本"
    log_info "访问 https://nodejs.org/ 下载安装"
    exit 1
  fi

  local node_version=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
  if [ "$node_version" -lt 18 ]; then
    log_error "Node.js 版本过低，需要 18+ 版本"
    exit 1
  fi

  log_success "Node.js $(node -v)"

  # 检查 npm
  if ! command -v npm &> /dev/null; then
    log_error "未找到 npm"
    exit 1
  fi

  log_success "npm $(npm -v)"

  # 检查 Git（可选但推荐）
  if ! command -v git &> /dev/null; then
    log_warning "未找到 Git，建议安装以便获取更新"
  else
    log_success "git $(git --version | awk '{print $3}')"
  fi
}

# ─── 克隆或更新仓库 ──────────────────────────────────────────

setup_repository() {
  log_info "设置仓库..."

  if [ -d "clover-a-sales" ]; then
    log_warning "目录 clover-a-sales 已存在"
    read -p "是否更新现有项目? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
      cd clover-a-sales
      git pull origin main 2>/dev/null || log_warning "无法更新，请手动 git pull"
    fi
  else
    log_info "克隆仓库..."
    git clone https://github.com/yeaphgel/clover-a-sales.git 2>/dev/null || {
      log_warning "git clone 失败，尝试使用 npm 安装..."
      mkdir -p clover-a-sales
      cd clover-a-sales
    }
  fi

  if [ ! -f "package.json" ]; then
    cd clover-a-sales 2>/dev/null || true
  fi
}

# ─── 安装依赖 ─────────────────────────────────────────────────

install_dependencies() {
  log_info "安装依赖..."

  if [ -f "package.json" ]; then
    npm install 2>&1 | tail -n 5
    log_success "依赖安装完成"
  else
    log_warning "未找到 package.json，跳过依赖安装"
  fi
}

# ─── 配置环境变量 ────────────────────────────────────────────

setup_environment() {
  log_info "配置环境变量..."

  if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
      cp .env.example .env
      log_success ".env 文件已创建"
      log_warning "请编辑 .env 文件并填写 API keys"
    else
      log_warning "未找到 .env.example，请手动创建 .env 文件"
    fi
  else
    log_info ".env 文件已存在"
  fi
}

# ─── 初始化数据 ──────────────────────────────────────────────

initialize_data() {
  log_info "初始化数据结构..."

  mkdir -p data/{clients,progress,progress/rankings,knowledge,execution}
  mkdir -p logs
  mkdir -p backups

  log_success "数据目录已创建"
}

# ─── 构建向量索引 ────────────────────────────────────────────

build_index() {
  log_info "构建知识库向量索引..."

  if [ -f "scripts/index.js" ]; then
    if [ -n "$ARK_API_KEY" ]; then
      log_info "使用 ARK_API_KEY 构建索引..."
      ARK_API_KEY="$ARK_API_KEY" npm run index 2>&1 | tail -n 10 || {
        log_warning "向量索引构建失败，可稍后运行: npm run index"
      }
    else
      log_info "ARK_API_KEY 未配置，跳过向量索引构建"
      log_info "可稍后运行: ARK_API_KEY=your_key npm run index"
    fi
  fi
}

# ─── 启动服务 ────────────────────────────────────────────────

start_services() {
  log_success "安装完成!"

  echo ""
  echo -e "${GREEN}🎉 Clover A-sales 销冠教练系统已安装${NC}"
  echo ""
  echo "后续步骤:"
  echo ""
  echo "1. 配置 API Keys (编辑 .env 文件)"
  echo "   ${BLUE}vim .env${NC}"
  echo ""
  echo "2. 启动 Dashboard API"
  echo "   ${BLUE}npm run dashboard${NC}   # 或 node scripts/dashboard-api.js"
  echo ""
  echo "3. 启动定时调度器"
  echo "   ${BLUE}npm run scheduler${NC}    # 或 node scripts/scheduler.js"
  echo ""
  echo "4. 启动 Hermes 集成"
  echo "   ${BLUE}npm run hermes${NC}       # 或 node scripts/hermes-integration.js --listen"
  echo ""
  echo "5. 启动 Webhook 处理"
  echo "   ${BLUE}npm run webhook${NC}      # 或 node scripts/webhook-handler.js"
  echo ""
  echo "6. 访问仪表板"
  echo "   ${BLUE}http://localhost:3000${NC}"
  echo ""
  echo "使用 CLI 工具:"
  echo "   ${BLUE}node scripts/coach-cli.js dashboard <userId>${NC}"
  echo ""
  echo "文档:"
  echo "   ${BLUE}https://github.com/yeaphgel/clover-a-sales${NC}"
  echo ""
  echo "联系方式:"
  echo "   📧 yeaphgel@gmail.com"
  echo "   𝕏  @yeaphgel"
  echo ""
}

# ─── 主程序 ──────────────────────────────────────────────────

main() {
  echo ""
  echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}"
  echo -e "${BLUE}║ 🎮 Clover A-sales 销冠教练系统 - 安装程序    ║${NC}"
  echo -e "${BLUE}╚════════════════════════════════════════════════╝${NC}"
  echo ""

  check_environment
  echo ""

  setup_repository
  echo ""

  install_dependencies
  echo ""

  setup_environment
  echo ""

  initialize_data
  echo ""

  build_index
  echo ""

  start_services
}

# 如果有任何错误，打印错误信息
trap 'log_error "安装过程中出错"; exit 1' ERR

# 运行主程序
main
