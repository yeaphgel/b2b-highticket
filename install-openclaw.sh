#!/bin/bash
#
# Clover A-sales for OpenClaw - 一键安装脚本
#
# 用法: bash install-openclaw.sh
#

set -e

echo "🎮 Clover A-sales for OpenClaw 安装程序"
echo ""

# 检查 OpenClaw
if ! command -v openclaw &> /dev/null; then
  echo "❌ 未找到 OpenClaw，请先安装 OpenClaw"
  echo "访问 https://openclaw.com 获取更多信息"
  exit 1
fi

echo "✅ OpenClaw 已安装"

# 运行通用安装脚本
bash install.sh

echo ""
echo "📋 OpenClaw 集成步骤:"
echo ""
echo "1. 在 OpenClaw 中注册 Skill:"
echo "   - 打开 OpenClaw 设置"
echo "   - 找到 Skills 部分"
echo "   - 点击 'Add Skill'"
echo "   - 选择 'Local Integration'"
echo "   - 输入以下信息:"
echo "     名称: Clover A-sales"
echo "     本地端口: 3000"
echo "     Webhook URL: http://localhost:3000/webhook/openclaw"
echo ""
echo "2. 配置 API Keys (编辑 .env 文件)"
echo "   OPENCLAW_SECRET=your_secret"
echo "   ARK_API_KEY=your_ark_api_key"
echo ""
echo "3. 启动服务"
echo "   npm run start:all"
echo ""
echo "4. 在 OpenClaw 中测试"
echo "   向 Clover A-sales Skill 发送消息进行测试"
echo ""
echo "更多信息请访问: https://github.com/yeaphgel/clover-a-sales"
echo ""
