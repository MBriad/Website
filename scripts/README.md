# 部署脚本

个人网站阿里云 Ubuntu 服务器部署脚本。

## 脚本列表

### 核心脚本
1. **`setup-server.sh`** - 服务器初始化脚本
   - 以 **root** 用户运行
   - 配置：用户、SSH、防火墙、Docker、时区、监控工具
   - 首次部署前运行一次

2. **`deploy.sh`** - 部署脚本
   - 以 **deploy** 用户运行
   - 检查环境 → 构建 → 启动服务 → 健康检查
   - 每次代码更新后运行

3. **`backup-mongo.sh`** - MongoDB 备份脚本
   - 每日自动备份，保留 7 天
   - 备份到 `/backups/mongodb/`

4. **`health-check.sh`** - 健康检查脚本
   - 每小时检查服务状态
   - 监控：容器、端口、资源、备份、错误日志
   - 异常时告警（需配置）

5. **`cleanup-logs.sh`** - 清理脚本
   - 每周清理日志和临时文件
   - 防止磁盘空间不足

### 环境要求
- Ubuntu 20.04/22.04 LTS
- Root 访问权限
- 已配置 SSH 密钥登录

## 部署流程

### 第一阶段：服务器初始化
```bash
# 1. 以 root 登录阿里云服务器
ssh root@your-server-ip

# 2. 上传项目代码（或 git clone）
scp -r website root@your-server-ip:/home/

# 3. 运行初始化脚本
cd /home/website/scripts
chmod +x *.sh
./setup-server.sh
```

### 第二阶段：首次部署
```bash
# 1. 切换到 deploy 用户
sudo -u deploy bash

# 2. 进入项目目录
cd ~/website

# 3. 配置环境变量
cp .env.production.example .env.production
vim .env.production  # 设置 JWT_SECRET 等

# 4. 运行部署
./scripts/deploy.sh
```

### 第三阶段：配置自动化
```bash
# 1. 每日备份（凌晨 2 点）
(crontab -l 2>/dev/null; echo "0 2 * * * /home/deploy/website/scripts/backup-mongo.sh") | crontab -

# 2. 每小时健康检查（第 5 分钟）
(crontab -l 2>/dev/null; echo "5 * * * * /home/deploy/website/scripts/health-check.sh") | crontab -

# 3. 每周清理（周日凌晨 3 点）
(crontab -l 2>/dev/null; echo "0 3 * * 0 /home/deploy/website/scripts/cleanup-logs.sh") | crontab -
```

## 安全配置

### 已完成的安全措施
1. **网络隔离**：
   - MongoDB (27017) 不暴露到公网
   - 后端 API (3000) 仅通过 Nginx `/api` 代理访问
   - 防火墙仅开放 22(SSH), 80(HTTP), 443(HTTPS)

2. **访问控制**：
   - 禁用 root SSH 登录
   - 仅允许 SSH 密钥认证
   - 使用非特权 deploy 用户运行服务

3. **应用安全**：
   - Nginx 安全响应头 (CSP, XSS 防护)
   - JWT 令牌过期时间 7 天
   - 数据库密码哈希存储 (bcrypt)

### 待完成的安全配置
1. **HTTPS/SSL**：
   ```bash
   # 使用 Certbot (Let's Encrypt)
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

2. **入侵检测**：
   ```bash
   # fail2ban 已安装，可配置更严格的规则
   sudo vim /etc/fail2ban/jail.local
   ```

3. **文件权限**：
   ```bash
   # 确保敏感文件权限正确
   chmod 600 .env.production
   chmod 700 scripts/*.sh
   ```

## 故障排除

### 常见问题

1. **部署失败：JWT_SECRET 未设置**
   ```
   ❌ JWT_SECRET 仍然是默认值
   ```
   **解决**：生成强密钥并更新 `.env.production`
   ```bash
   openssl rand -hex 32
   vim .env.production
   ```

2. **服务启动失败：端口占用**
   ```
   ERROR: for frontend Cannot start service frontend: port is already allocated
   ```
   **解决**：停止占用端口的进程或更改端口
   ```bash
   sudo lsof -i :80
   docker-compose down
   ```

3. **MongoDB 连接失败**
   ```
   MongooseServerSelectionError: connect ECONNREFUSED
   ```
   **解决**：检查 MongoDB 容器状态
   ```bash
   docker-compose ps mongodb
   docker-compose logs mongodb
   ```

4. **磁盘空间不足**
   ```
   No space left on device
   ```
   **解决**：运行清理脚本或手动清理
   ```bash
   ./scripts/cleanup-logs.sh
   docker system prune -a
   ```

### 日志位置
- **应用日志**：`docker-compose logs -f`
- **Nginx 访问日志**：容器内 `/var/log/nginx/access.log`
- **后端日志**：`./server/logs/` (按日期分割)
- **健康检查日志**：`/var/log/website-health.log`

## 监控与告警

### 基础监控
- CPU/内存/磁盘使用率 (`htop`, `nload`)
- 服务 HTTP 状态码
- 错误日志关键字统计

### 告警配置（可选）
1. **邮件告警**：配置 `ALERT_EMAIL` 变量
2. **Slack/钉钉**：修改 `health-check.sh` 添加 webhook
3. **阿里云监控**：配置云监控告警规则

## 备份与恢复

### 备份策略
- **频率**：每日自动备份
- **保留**：最近 7 天备份
- **位置**：`/backups/mongodb/`

### 恢复数据库
```bash
# 1. 停止服务
docker-compose down

# 2. 恢复备份
cat /backups/mongodb/mbri-website_20250101_020000.gz | \
  docker-compose exec -T mongodb mongorestore --archive --gzip --db mbri-website

# 3. 启动服务
docker-compose up -d
```

## 更新流程

### 常规更新
```bash
# 1. 拉取最新代码
git pull origin main

# 2. 重新部署
./scripts/deploy.sh
```

### 重大更新
```bash
# 1. 备份当前数据
./scripts/backup-mongo.sh

# 2. 停止服务
docker-compose down

# 3. 更新代码
git pull origin main

# 4. 重建容器
docker-compose up -d --build

# 5. 验证
./scripts/health-check.sh
```

---

**最后更新**：$(date +%Y-%m-%d)

如需帮助，请参考：
- Docker 文档：https://docs.docker.com/
- MongoDB 备份恢复：https://docs.mongodb.com/manual/backup/
- Let's Encrypt：https://letsencrypt.org/