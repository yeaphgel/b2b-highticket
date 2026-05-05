#!/bin/bash
#
# Clover A-sales for OpenClaw - 一键安装脚本
#
# 用法: bash install-openclaw.sh
#       或 curl -fsSL https://raw.githubusercontent.com/yeaphgel/clover-a-sales/main/install-openclaw.sh | bash
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

# ─── 检查 OpenClaw ────────────────────────────────────────────

check_openclaw() {
  log_section "OpenClaw 环境检查"

  if command -v openclaw &> /dev/null; then
    OPENCLAW_VERSION=$(openclaw --version 2>/dev/null || echo "未知版本")
    log_success "OpenClaw 已安装: $OPENCLAW_VERSION"
  elif command -v oc &> /dev/null; then
    log_success "OpenClaw CLI 已安装"
  elif [ -d "$HOME/.openclaw" ] || [ -d "/opt/openclaw" ]; then
    log_success "OpenClaw 已安装"
  else
    log_warning "未检测到 OpenClaw，但可以继续安装"
    log_info "OpenClaw 下载地址: https://openclaw.com/download"
    read -p "是否继续? (y/n) " -n 1 -r
    echo
    if ! [[ $REPLY =~ ^[Yy]$ ]]; then
      exit 1
    fi
  fi
}

# ─── 运行通用安装脚本 ────────────────────────────────────────

run_base_install() {
  log_section "运行基础安装"

  if [ -f "install.sh" ]; then
    bash install.sh
  else
    log_error "找不到 install.sh"
    exit 1
  fi
}

# ─── 配置 OpenClaw 集成 ──────────────────────────────────────

setup_openclaw_integration() {
  log_section "OpenClaw 集成配置"

  log_info "创建 OpenClaw 配置示例..."

  cat > openclaw-config.example.json << 'EOF'
{
  "openclaw": {
    "skillName": "Clover A-sales",
    "skillDescription": "AI 驱动的销售教练系统",
    "apiEndpoint": "http://localhost:3000",
    "webhookUrl": "http://localhost:3000/webhook/openclaw",
    "secret": "${OPENCLAW_SECRET}",
    "capabilities": [
      "gamification_dashboard",
      "grow_coaching",
      "call_analysis",
      "performance_tracking",
      "d1_d30_reminders",
      "leaderboard"
    ]
  },
  "features": {
    "enableGamification": true,
    "enableAutoAnalysis": true,
    "enableNotifications": true,
    "enableCRMSync": true
  }
}
EOF

  if [ ! -f "openclaw-config.json" ]; then
    cp openclaw-config.example.json openclaw-config.json
    log_success "OpenClaw 配置已创建: openclaw-config.json"
  else
    log_info "openclaw-config.json 已存在"
  fi
}

# ─── 输出集成指南 ────────────────────────────────────────────

show_openclaw_guide() {
  log_section "OpenClaw 集成指南"

  echo -e "${BLUE}方案 A: 本地 Skill 集成（推荐）${NC}"
  echo ""
  echo "  1. 启动 Clover 服务:"
  echo "     ${YELLOW}npm run start:all${NC}"
  echo ""
  echo "  2. 在 OpenClaw 中添加本地 Skill:"
  echo "     ${YELLOW}Settings → Skills → Add Skill${NC}"
  echo ""
  echo "     • Skill 名称: Clover A-sales"
  echo "     • 类型: Local Integration"
  echo "     • API 端口: 3000"
  echo "     • Webhook URL: http://localhost:3000/webhook/openclaw"
  echo ""
  echo "  3. 配置 API 密钥 (.env 文件):"
  echo "     ${YELLOW}OPENCLAW_SECRET=your_secret_key${NC}"
  echo "     ${YELLOW}ARK_API_KEY=your_api_key${NC}"
  echo ""
  echo "  4. 在 OpenClaw 中测试:"
  echo "     @clover dashboard"
  echo "     @clover coach <userId>"
  echo "     @clover leaderboard weekly"
  echo ""

  echo -e "${BLUE}方案 B: 云部署集成${NC}"
  echo ""
  echo "  1. 将 Clover 部署到公网服务器"
  echo "  2. 在 OpenClaw 中添加远程 Skill:"
  echo "     • 类型: Remote Integration"
  echo "     • API 端点: https://your-domain/api"
  echo ""

  echo -e "${BLUE}通用命令${NC}:"
  echo ""
  echo "  启动所有服务:"
  echo "    ${YELLOW}npm run start:all${NC}"
  echo ""
  echo "  启动单个服务:"
  echo "    ${YELLOW}npm run dashboard${NC}    # 仪表板 API"
  echo "    ${YELLOW}npm run scheduler${NC}    # 定时任务"
  echo "    ${YELLOW}npm run webhook${NC}      # Webhook 处理"
  echo ""

  echo -e "${BLUE}验证安装${NC}:"
  echo ""
  echo "  访问 Dashboard:"
  echo "    ${YELLOW}http://localhost:3000${NC}"
  echo ""
  echo "  检查 API 健康状态:"
  echo "    ${YELLOW}curl http://localhost:3000/api/health${NC}"
  echo ""

  echo -e "${BLUE}常见命令${NC}:"
  echo ""
  echo "  查看用户仪表板:"
  echo "    ${YELLOW}node scripts/coach-cli.js dashboard <userId>${NC}"
  echo ""
  echo "  查看周排行:"
  echo "    ${YELLOW}node scripts/coach-cli.js leaderboard weekly${NC}"
  echo ""
  echo "  查看 GROW 教练建议:"
  echo "    ${YELLOW}node scripts/coach-cli.js coach <userId>${NC}"
  echo ""

  echo -e "${BLUE}文档和支持${NC}:"
  echo ""
  echo "  项目地址: https://github.com/yeaphgel/clover-a-sales"
  echo "  邮件支持: yeaphgel@gmail.com"
  echo "  社交媒体: @yeaphgel (X/Twitter)"
  echo ""
}

# ─── 主程序 ──────────────────────────────────────────────────

main() {
  echo ""
  echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}"
  echo -e "${BLUE}║ 🎮 Clover A-sales + OpenClaw - 安装程序      ║${NC}"
  echo -e "${BLUE}║    销售教练系统 × OpenClaw AI 智能助手        ║${NC}"
  echo -e "${BLUE}╚════════════════════════════════════════════════╝${NC}"
  echo ""

  check_openclaw
  run_base_install
  setup_openclaw_integration
  show_openclaw_guide

  echo -e "${GREEN}✨ OpenClaw 集成安装完成！${NC}"
  echo ""
  echo "下一步:"
  echo "  1. 编辑 .env 文件填写 API 密钥"
  echo "  2. 运行 ${YELLOW}npm run start:all${NC} 启动服务"
  echo "  3. 在 OpenClaw 中添加 Clover Skill"
  echo ""
}

# 错误处理
trap 'log_error "安装过程中出错"; exit 1' ERR

# 运行主程序
main
