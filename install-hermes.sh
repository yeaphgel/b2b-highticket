#!/bin/bash
#
# Clover A-sales for Hermes - 一键安装脚本
#
# 用法: bash install-hermes.sh
#       或 curl -fsSL https://raw.githubusercontent.com/yeaphgel/clover-a-sales/main/install-hermes.sh | bash
#

set -e

# ─── 颜色定义 ─────────────────────────────────────────────────

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

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

log_section() {
  echo ""
  echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${PURPLE}$1${NC}"
  echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
}

# ─── 检查环境 ─────────────────────────────────────────────────

check_environment() {
  log_section "环境检查"

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

  # 检查 Git
  if ! command -v git &> /dev/null; then
    log_warning "未找到 Git（可选，建议安装以便获取更新）"
  else
    log_success "git $(git --version | awk '{print $3}')"
  fi
}

# ─── 克隆或更新仓库 ──────────────────────────────────────────

setup_repository() {
  log_section "仓库设置"

  if [ -d "clover-a-sales" ]; then
    log_warning "目录 clover-a-sales 已存在"
    read -p "是否更新现有项目? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
      cd clover-a-sales
      log_info "更新仓库..."
      git pull origin main 2>/dev/null || log_warning "无法更新，请手动 git pull"
    fi
  else
    log_info "克隆仓库..."
    if git clone https://github.com/yeaphgel/clover-a-sales.git; then
      cd clover-a-sales
      log_success "仓库克隆完成"
    else
      log_warning "git clone 失败，创建本地目录..."
      mkdir -p clover-a-sales
      cd clover-a-sales
    fi
  fi
}

# ─── 安装依赖 ─────────────────────────────────────────────────

install_dependencies() {
  log_section "安装依赖"

  if [ -f "package.json" ]; then
    log_info "运行 npm install..."
    npm install --prefer-offline --no-audit 2>&1 | grep -E "added|up to date|found.*vulnerabilities" | tail -n 3
    log_success "依赖安装完成"
  else
    log_warning "未找到 package.json，跳过依赖安装"
  fi
}

# ─── 配置环境变量 ────────────────────────────────────────────

setup_environment() {
  log_section "环境变量配置"

  if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
      cp .env.example .env
      log_success ".env 文件已创建"

      # 自动填入一些默认值
      if command -v sed &> /dev/null; then
        # 如果是 macOS，使用不同的 sed 语法
        if [[ "$OSTYPE" == "darwin"* ]]; then
          sed -i '' 's/HERMES_PORT=.*/HERMES_PORT=3001/' .env
          sed -i '' 's/DASHBOARD_PORT=.*/DASHBOARD_PORT=3000/' .env
          sed -i '' 's/WEBHOOK_PORT=.*/WEBHOOK_PORT=3002/' .env
        else
          sed -i 's/HERMES_PORT=.*/HERMES_PORT=3001/' .env
          sed -i 's/DASHBOARD_PORT=.*/DASHBOARD_PORT=3000/' .env
          sed -i 's/WEBHOOK_PORT=.*/WEBHOOK_PORT=3002/' .env
        fi
      fi

      log_warning "请编辑 .env 文件并填写以下必需项:"
      log_warning "  - ARK_API_KEY（必需）: Ark AI API密钥"
      log_warning "  - HERMES_SECRET（可选）: Hermes Webhook签名密钥"
    else
      log_warning "未找到 .env.example，请手动创建 .env 文件"
    fi
  else
    log_info ".env 文件已存在"
  fi
}

# ─── 初始化数据 ──────────────────────────────────────────────

initialize_data() {
  log_section "初始化数据结构"

  mkdir -p data/{clients,progress,progress/rankings,knowledge,execution}
  mkdir -p logs
  mkdir -p backups

  log_success "数据目录已创建"
}

# ─── Hermes 集成配置 ──────────────────────────────────────────

setup_hermes_config() {
  log_section "Hermes 集成配置"

  log_info "创建 Hermes 配置示例..."

  cat > hermes-config.example.json << 'EOF'
{
  "hermes": {
    "apiEndpoint": "https://hermes.example.com/api",
    "webhookUrl": "http://your-domain:3001/webhook/hermes/call",
    "secret": "${HERMES_SECRET}",
    "timeout": 30000,
    "retryAttempts": 3
  },
  "transcription": {
    "provider": "hermes",
    "autoProcess": true,
    "languages": ["zh-CN", "en-US"]
  },
  "callTracking": {
    "enabled": true,
    "trackingFields": [
      "callId",
      "callDuration",
      "transcript",
      "clientName",
      "userId"
    ]
  }
}
EOF

  if [ ! -f "hermes-config.json" ]; then
    cp hermes-config.example.json hermes-config.json
    log_success "Hermes 配置已创建: hermes-config.json"
  else
    log_info "hermes-config.json 已存在"
  fi
}

# ─── 构建向量索引 ────────────────────────────────────────────

build_index() {
  log_section "构建知识库索引"

  if [ -f "scripts/index.js" ]; then
    if [ -n "$ARK_API_KEY" ]; then
      log_info "使用 ARK_API_KEY 构建向量索引..."
      if ARK_API_KEY="$ARK_API_KEY" npm run index 2>&1 | tail -n 5; then
        log_success "知识库索引构建成功"
      else
        log_warning "向量索引构建失败，可稍后运行: npm run index"
      fi
    else
      log_warning "ARK_API_KEY 未配置，跳过向量索引构建"
      log_info "请先编辑 .env 文件，然后运行: ARK_API_KEY=your_key npm run index"
    fi
  fi
}

# ─── 启动服务 ────────────────────────────────────────────────

start_services() {
  log_section "安装完成"

  echo ""
  echo -e "${GREEN}🎉 Clover A-sales + Hermes 集成已安装${NC}"
  echo ""

  echo -e "${BLUE}一键启动所有服务${NC}:"
  echo "  ${YELLOW}npm run start:all${NC}"
  echo ""

  echo -e "${BLUE}单独启动各服务${NC}:"
  echo "  • Dashboard API (端口3000)"
  echo "    ${YELLOW}npm run dashboard${NC}"
  echo ""
  echo "  • Hermes 集成 (端口3001)"
  echo "    ${YELLOW}npm run hermes${NC}"
  echo ""
  echo "  • 定时调度器"
  echo "    ${YELLOW}npm run scheduler${NC}"
  echo ""
  echo "  • Webhook 处理 (端口3002)"
  echo "    ${YELLOW}npm run webhook${NC}"
  echo ""

  echo -e "${BLUE}Hermes 配置步骤${NC}:"
  echo "  1. 编辑 .env 文件，填写:"
  echo "     ${YELLOW}ARK_API_KEY=your_api_key${NC}"
  echo "     ${YELLOW}HERMES_SECRET=your_secret_key${NC}"
  echo ""
  echo "  2. 编辑 hermes-config.json，设置:"
  echo "     ${YELLOW}hermes.apiEndpoint${NC}: Hermes 服务地址"
  echo "     ${YELLOW}hermes.webhookUrl${NC}: 你的公网地址"
  echo ""
  echo "  3. 在 Hermes 中配置回调:"
  echo "     POST http://your-domain:3001/webhook/hermes/call"
  echo ""
  echo "     Body 示例:"
  echo "     {\"callId\": \"call_123\",\"transcript\": \"...\",\"userId\": \"user_123\"}"
  echo ""

  echo -e "${BLUE}验证安装${NC}:"
  echo "  启动服务后，访问:"
  echo "  ${YELLOW}http://localhost:3000${NC}  - 仪表板"
  echo "  ${YELLOW}http://localhost:3001/health${NC}  - Hermes API 健康检查"
  echo ""

  echo -e "${BLUE}CLI 工具${NC}:"
  echo "  查看用户仪表板:"
  echo "    ${YELLOW}node scripts/coach-cli.js dashboard <userId>${NC}"
  echo ""
  echo "  查看通话分析:"
  echo "    ${YELLOW}node scripts/coach-cli.js search \"keyword\"${NC}"
  echo ""

  echo -e "${BLUE}文档和支持${NC}:"
  echo "  GitHub: https://github.com/yeaphgel/clover-a-sales"
  echo "  邮件: yeaphgel@gmail.com"
  echo "  X: @yeaphgel"
  echo ""

  echo -e "${GREEN}✨ 安装完成！现在可以启动服务了${NC}"
  echo ""
}

# ─── 主程序 ──────────────────────────────────────────────────

main() {
  echo ""
  echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}"
  echo -e "${BLUE}║ 🎮 Clover A-sales + Hermes 集成 - 安装程序  ║${NC}"
  echo -e "${BLUE}║    AI 驱动的语音销售教练系统                   ║${NC}"
  echo -e "${BLUE}╚════════════════════════════════════════════════╝${NC}"
  echo ""

  check_environment
  setup_repository
  install_dependencies
  setup_environment
  initialize_data
  setup_hermes_config
  build_index
  start_services
}

# 错误处理
trap 'log_error "安装过程中出错"; exit 1' ERR

# 运行主程序
main
