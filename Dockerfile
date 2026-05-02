# Clover A-sales 销冠教练系统 Dockerfile

FROM node:18-alpine

LABEL maintainer="yeaphgel@gmail.com"
LABEL description="Clover A-sales - Sales Champion Coaching System"
LABEL version="1.0.0"

# 设置工作目录
WORKDIR /app

# 安装基础工具
RUN apk add --no-cache \
    git \
    curl \
    bash \
    tini

# 复制 package 文件
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production && \
    npm cache clean --force

# 复制应用代码
COPY . .

# 创建必要的目录
RUN mkdir -p data/{clients,progress,progress/rankings,knowledge,execution} && \
    mkdir -p logs backups dashboard

# 设置环境变量
ENV NODE_ENV=production
ENV DASHBOARD_PORT=3000
ENV HERMES_PORT=3001
ENV WEBHOOK_PORT=3002

# 暴露端口
EXPOSE 3000 3001 3002

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

# 使用 tini 作为 init 进程
ENTRYPOINT ["/sbin/tini", "--"]

# 默认启动所有服务
CMD ["npm", "run", "start:all"]
