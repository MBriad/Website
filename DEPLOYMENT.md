# 阿里云 Ubuntu 部署指南

## 前置要求

1. **阿里云 Ubuntu 服务器** (20.04/22.04 LTS)
2. **SSH 访问** (root 权限)
3. **域名** (可选，部署后可配置)

## 快速部署

### 1. 服务器初始化
```bash
# 以 root 登录服务器
ssh root@你的服务器IP

# 上传项目代码
scp -r website root@服务器IP:/home/

# 运行初始化脚本
cd /home/website/scripts
chmod +x *.sh
./setup-server.sh
```

### 2. 首次部署
```bash
# 切换到 deploy 用户
sudo -u deploy bash

# 进入项目目录
cd ~/website

# 生成 JWT 密钥并配置环境变量
openssl rand -hex 32  # 复制生成的密钥
cp .env.production.example .env.production  # 如果没有则创建
vim .env.production  # 设置 JWT_SECRET=生成的密钥

# 运行部署
./scripts/deploy.sh
```

### 3. 验证部署
- 访问 `http://你的服务器IP`
- 检查 API 健康状态：`http://你的服务器IP/api/health`
- 查看日志：`docker-compose logs -f`

## 安全加固已完成

### ✅ 网络隔离
- **MongoDB (27017)**：仅 Docker 网络内部访问，不暴露到公网
- **后端 API (3000)**：仅通过 Nginx `/api` 代理访问
- **防火墙**：仅开放 22(SSH), 80(HTTP), 443(HTTPS)

### ✅ 访问控制
- 禁用 root SSH 登录
- 仅允许 SSH 密钥认证
- 使用非特权 `deploy` 用户运行服务

### ✅ 应用安全
- Nginx 安全响应头 (CSP, XSS 防护)
- JWT 令牌过期时间 7 天
- 数据库密码哈希存储 (bcrypt)
- 首个注册用户自动成为管理员（无需硬编码密码）

## 自动化运维

### 定时任务配置
```bash
# 切换到 deploy 用户
sudo -u deploy crontab -e

# 添加以下内容：
# 每日凌晨 2 点备份 MongoDB
0 2 * * * /home/deploy/website/scripts/backup-mongo.sh

# 每小时第 5 分钟健康检查
5 * * * * /home/deploy/website/scripts/health-check.sh

# 每周日凌晨 3 点清理日志
0 3 * * 0 /home/deploy/website/scripts/cleanup-logs.sh
```

### 监控项
- **服务状态**：容器运行、端口监听、HTTP 响应
- **系统资源**：CPU、内存、磁盘使用率
- **备份状态**：备份文件时效性和完整性
- **错误日志**：关键错误实时检测

## HTTPS/SSL 配置

### 选项 A: Certbot (Let's Encrypt) - 推荐
```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx

# 获取证书（需要域名已解析到服务器）
sudo certbot --nginx -d 你的域名.com

# 自动续期已验证配置
sudo certbot renew --dry-run
```

### 选项 B: 阿里云 SSL 证书
1. 在阿里云控制台申请免费 SSL 证书
2. 下载 Nginx 证书文件 (.pem, .key)
3. 上传到服务器：`/etc/nginx/ssl/`
4. 更新 `client/nginx.conf` 添加 SSL 配置
5. 重启 Nginx 容器：`docker-compose restart frontend`

## 故障排除

### 常见问题

#### 1. 部署失败：JWT_SECRET 未设置
**错误**：`❌ JWT_SECRET 仍然是默认值`
**解决**：
```bash
openssl rand -hex 32  # 生成密钥
vim .env.production   # 更新 JWT_SECRET
./scripts/deploy.sh   # 重新部署
```

#### 2. 服务启动失败：端口占用
**错误**：`ERROR: for frontend Cannot start service frontend: port is already allocated`
**解决**：
```bash
# 检查占用进程
sudo lsof -i :80
sudo lsof -i :443

# 停止占用进程或更改 docker-compose.yml 中的端口映射
docker-compose down
# 修改后重新部署
```

#### 3. MongoDB 连接失败
**错误**：`MongooseServerSelectionError: connect ECONNREFUSED`
**解决**：
```bash
# 检查 MongoDB 容器状态
docker-compose ps mongodb
docker-compose logs mongodb

# 重启 MongoDB 服务
docker-compose restart mongodb
```

#### 4. 磁盘空间不足
**错误**：`No space left on device`
**解决**：
```bash
# 运行清理脚本
./scripts/cleanup-logs.sh

# 清理 Docker 无用数据
docker system prune -a
```

## 备份与恢复

### 备份位置
- 路径：`/backups/mongodb/`
- 格式：`mbri-website_YYYYMMDD_HHMMSS.gz`
- 保留：最近 7 天

### 手动备份
```bash
./scripts/backup-mongo.sh
```

### 恢复数据库
```bash
# 1. 停止服务
docker-compose down

# 2. 恢复指定备份
cat /backups/mongodb/mbri-website_20250101_020000.gz | \
  docker-compose exec -T mongodb mongorestore --archive --gzip --db mbri-website

# 3. 启动服务
docker-compose up -d
```

## 更新流程

### 常规更新（代码变更）
```bash
# 拉取最新代码
git pull origin main

# 重新部署
./scripts/deploy.sh
```

### 安全更新（系统/镜像）
```bash
# 更新系统包
sudo apt update && sudo apt upgrade -y

# 更新 Docker 镜像
docker-compose pull
docker-compose up -d

# 清理旧镜像
docker image prune -f
```

## 联系支持

- **项目文档**：`AGENTS.md` (开发规范)
- **脚本文档**：`scripts/README.md` (详细指南)
- **问题跟踪**：`issues.md` (已知问题)

---

**部署状态**：✅ 脚本就绪，等待服务器执行  
**最后更新**：$(date +%Y-%m-%d)  
**安全状态**：生产环境就绪（需配置 HTTPS 和强 JWT_SECRET）