# 网络配置指南

## 问题：为什么我的服务器 IP 访问不了？

默认情况下，Clover A-sales 的服务只监听 **localhost (127.0.0.1)**，这意味着：
- ✅ `localhost:3001/health` — 本地可访问
- ✅ `127.0.0.1:3001/health` — 本地可访问
- ❌ `{服务器IP}:3001/health` — **外网无法访问**

## 解决方案

### 方式 1️⃣：修改 .env 配置（推荐）

编辑 `.env` 文件，确保有这一行：

```bash
HOST=0.0.0.0
```

这会让服务监听所有网络接口，包括外网 IP。

```bash
# 编辑 .env
vim /root/.agents/skills/clover-a-sales/.env

# 找到或添加：
HOST=0.0.0.0
```

然后重启服务：

```bash
# 停止服务（如果在运行）
# 可以按 Ctrl+C 中断

# 重启服务
npm run hermes
# 或
npm run start:all
```

### 方式 2️⃣：环境变量启动

```bash
cd /root/.agents/skills/clover-a-sales

# 直接指定 HOST
HOST=0.0.0.0 npm run hermes

# 或指定特定 IP
HOST=192.168.1.100 npm run hermes
```

---

## 验证配置

### 本地验证
```bash
curl http://localhost:3001/health
```

### 从另一台机器验证
```bash
curl http://{你的服务器IP}:3001/health
```

---

## HOST 配置选项

| HOST 值 | 说明 | 使用场景 |
|---------|------|---------|
| `localhost` 或 `127.0.0.1` | 仅本地访问 | 开发调试 |
| `0.0.0.0` | 所有网络接口 | **推荐用于服务器部署** |
| `192.168.1.100` | 指定 IP 访问 | 安全限制 |

---

## 防火墙注意事项

如果修改了 HOST 但仍然无法从外网访问，检查：

### Linux 防火墙
```bash
# 检查防火墙规则
sudo firewall-cmd --list-all

# 开放端口（ firewalld）
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --permanent --add-port=3001/tcp
sudo firewall-cmd --permanent --add-port=3002/tcp
sudo firewall-cmd --reload

# 或使用 ufw
sudo ufw allow 3000/tcp
sudo ufw allow 3001/tcp
sudo ufw allow 3002/tcp
```

### 云服务器（AWS/阿里云/腾讯云等）

需要在**安全组**中开放入站规则：
- 协议：TCP
- 端口：3000, 3001, 3002
- 来源：0.0.0.0/0（或指定 IP）

---

## 调试技巧

### 检查服务是否运行
```bash
# 查看进程
ps aux | grep "node"

# 查看监听端口
netstat -tlnp | grep -E ":(3000|3001|3002)"
# 或
ss -tlnp | grep -E ":(3000|3001|3002)"
```

### 查看服务日志
```bash
# 如果是后台运行，查看日志
tail -f nohup.out
```

### 测试连接
```bash
# 测试本地
curl -v http://localhost:3001/health

# 测试远程
curl -v http://{服务器IP}:3001/health

# 测试 DNS
nslookup {你的域名}
```

---

## 常见问题排查

| 问题 | 检查项 |
|------|-------|
| 外网访问不了 | 1. .env 中 HOST=0.0.0.0 ✓ 2. 防火墙/安全组开放端口 ✓ |
| 服务无法启动 | 1. 端口是否被占用 2. Node.js 版本 >= 18 3. npm install 是否完成 |
| 连接超时 | 1. 防火墙规则 2. 安全组规则 3. 网络延迟 |

---

## 推荐的生产环境配置

### 使用 PM2 保持服务运行

```bash
npm install -g pm2

# 启动所有服务
pm2 start npm --name "clover-dashboard" -- run dashboard
pm2 start npm --name "clover-hermes" -- run hermes
pm2 start npm --name "clover-webhook" -- run webhook

# 开机自动启动
pm2 startup
pm2 save

# 查看状态
pm2 status
pm2 logs
```

### 使用 Nginx 反向代理

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location /api/ {
        proxy_pass http://0.0.0.0:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /hermes/ {
        proxy_pass http://0.0.0.0:3001;
        proxy_set_header Host $host;
    }

    location /webhook/ {
        proxy_pass http://0.0.0.0:3002;
        proxy_set_header Host $host;
    }
}
```

---

## 下一步

配置好 HOST 后：

1. ✅ 所有服务都可以通过 `{服务器IP}:port` 访问
2. ✅ 在 Hermes/OpenClaw 中配置回调地址时，使用 `http://{服务器IP}:port`
3. ✅ 配置 ARK_API_KEY 等必需的 API key
4. ✅ 构建知识库索引：`npm run index`
