# 阿里云 Ubuntu 24.04 Docker Hub 部署实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将个人网站（React + Fastify + MongoDB）通过Docker Hub镜像部署到阿里云Ubuntu 24.04服务器

**Architecture:** 本地构建Docker镜像 → 推送至Docker Hub → 阿里云服务器拉取镜像 → docker-compose启动服务。前端（Nginx+React）和后端（Node.js+Fastify）分别构建镜像，数据库使用官方mongo:7镜像。

**Tech Stack:** Docker, Docker Hub, docker-compose, Ubuntu 24.04, Nginx, Node.js 20, MongoDB 7, SSH, UFW防火墙

---

## 文件结构映射

**新建文件:**
- `scripts/build-and-push.sh` - 本地镜像构建与推送脚本
- `scripts/generate-ssh-keys.sh` - SSH密钥生成脚本  
- `docker-compose.prod.yml` - 生产环境docker-compose配置（使用远程镜像）
- `docs/superpowers/plans/2026-03-28-alibaba-cloud-deployment.md` - 本计划文档

**修改文件:**
- `docker-compose.yml:22-24` - 修改backend服务从build改为image
- `docker-compose.yml:42-46` - 修改frontend服务从build改为image
- `scripts/deploy.sh:13-23` - 更新Docker Compose检查逻辑
- `scripts/deploy.sh:55-70` - 更新部署流程使用远程镜像
- `.gitignore:47-49` - 添加SSH私钥忽略规则

**验证文件:**
- `server/src/routes/auth.test.ts` - 管理员认证测试
- `client/src/pages/Home.test.jsx` - 前端页面测试
- `scripts/health-check.sh` - 健康检查脚本

---

## 阶段一：镜像准备（本地开发机）

### Task 1: 提交代码到GitHub

**Files:**
- Modify: `.` (所有未提交文件)
- Test: `git status`

- [ ] **Step 1: 检查未提交更改**

```bash
cd "D:\Users\MBri\Desktop\website"
git status
```

Expected: 显示所有修改的文件（.env.production, docker-compose.yml, scripts/等）

- [ ] **Step 2: 添加并提交更改**

```bash
git add .
git commit -m "feat: prepare for Docker Hub deployment - update docker configs, scripts, and docs"
```

Expected: `[master abc1234] feat: prepare for Docker Hub deployment...`

- [ ] **Step 3: 推送到GitHub**

```bash
git push origin master
```

Expected: `Writing objects: 100%... To github.com:MBriad/Website.git`

- [ ] **Step 4: 验证推送成功**

```bash
git log --oneline -3
```

Expected: 显示最新提交包含部署相关更改

### Task 2: 创建生产环境docker-compose配置

**Files:**
- Create: `docker-compose.prod.yml`
- Test: `docker-compose -f docker-compose.prod.yml config`

- [ ] **Step 1: 创建生产配置模板**

```bash
cat > docker-compose.prod.yml << 'EOF'
version: '3.8'

services:
  # MongoDB 数据库
  mongodb:
    image: mongo:7
    container_name: mbri-mongodb-prod
    restart: unless-stopped
    volumes:
      - mongodb-data-prod:/data/db
    # 端口不暴露到宿主机，仅 Docker 网络内部访问
    environment:
      MONGO_INITDB_DATABASE: mbri-website
    healthcheck:
      test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 10s

  # 后端 API 服务
  backend:
    image: redol/website-backend:latest
    container_name: mbri-backend-prod
    restart: unless-stopped
    depends_on:
      mongodb:
        condition: service_healthy
    env_file:
      - .env.production
    volumes:
      - ./server/uploads:/app/uploads
      - ./server/logs:/app/logs
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 10s
      timeout: 5s
      retries: 3
      start_period: 15s

  # 前端静态服务 (Nginx)
  frontend:
    image: redol/website-frontend:latest
    container_name: mbri-frontend-prod
    restart: unless-stopped
    depends_on:
      backend:
        condition: service_healthy
    ports:
      - "80:80"
      - "443:443"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:80/"]
      interval: 10s
      timeout: 5s
      retries: 3
      start_period: 10s

volumes:
  mongodb-data-prod:
EOF
```

- [ ] **Step 2: 验证配置文件语法**

```bash
docker-compose -f docker-compose.prod.yml config
```

Expected: 输出有效的docker-compose配置，无错误

- [ ] **Step 3: 添加到Git**

```bash
git add docker-compose.prod.yml
git commit -m "feat: add production docker-compose config for Docker Hub deployment"
```

### Task 3: 创建镜像构建与推送脚本

**Files:**
- Create: `scripts/build-and-push.sh`
- Test: `bash scripts/build-and-push.sh --dry-run`

- [ ] **Step 1: 创建构建脚本**

```bash
cat > scripts/build-and-push.sh << 'EOF'
#!/bin/bash

# Docker镜像构建与推送脚本
# 在本地开发机运行

set -e

echo "=== Docker镜像构建与推送 ==="
echo "时间: $(date)"
echo "Docker Hub用户名: redol"

# 解析参数
DRY_RUN=false
TAG="latest"

while [[ $# -gt 0 ]]; do
  case $1 in
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    --tag)
      TAG="$2"
      shift 2
      ;;
    *)
      echo "未知参数: $1"
      exit 1
      ;;
  esac
done

echo "标签: $TAG"
echo "干运行模式: $DRY_RUN"

# 检查Docker登录状态
if ! docker info | grep -q "Username: redol"; then
    echo "⚠️  未检测到Docker Hub登录"
    echo "请先登录: docker login -u redol"
    if [ "$DRY_RUN" = false ]; then
        docker login -u redol
    fi
fi

# 构建前端镜像
echo "构建前端镜像..."
if [ "$DRY_RUN" = false ]; then
    cd client
    docker build -t redol/website-frontend:$TAG .
    cd ..
else
    echo "[DRY RUN] 构建命令: docker build -t redol/website-frontend:$TAG ./client"
fi

# 构建后端镜像
echo "构建后端镜像..."
if [ "$DRY_RUN" = false ]; then
    cd server
    docker build -t redol/website-backend:$TAG .
    cd ..
else
    echo "[DRY RUN] 构建命令: docker build -t redol/website-backend:$TAG ./server"
fi

# 推送镜像到Docker Hub
if [ "$DRY_RUN" = false ]; then
    echo "推送前端镜像到Docker Hub..."
    docker push redol/website-frontend:$TAG
    
    echo "推送后端镜像到Docker Hub..."
    docker push redol/website-backend:$TAG
else
    echo "[DRY RUN] 推送命令:"
    echo "  docker push redol/website-frontend:$TAG"
    echo "  docker push redol/website-backend:$TAG"
fi

# 列出本地镜像
echo ""
echo "=== 构建完成 ==="
echo "本地镜像列表:"
docker images | grep "redol/website"
EOF
```

- [ ] **Step 2: 设置执行权限**

```bash
chmod +x scripts/build-and-push.sh
```

- [ ] **Step 3: 测试干运行模式**

```bash
bash scripts/build-and-push.sh --dry-run
```

Expected: 输出构建和推送命令，无实际执行

### Task 4: 创建SSH密钥生成脚本

**Files:**
- Create: `scripts/generate-ssh-keys.sh`
- Test: `bash scripts/generate-ssh-keys.sh --dry-run`

- [ ] **Step 1: 创建SSH密钥生成脚本**

```bash
cat > scripts/generate-ssh-keys.sh << 'EOF'
#!/bin/bash

# SSH密钥对生成脚本
# 在本地开发机运行，公钥需上传到阿里云服务器

set -e

echo "=== SSH密钥生成 ==="
echo "时间: $(date)"
echo "密钥类型: ED25519（推荐）"

# 解析参数
DRY_RUN=false
KEY_NAME="mbri_alibaba_cloud"

while [[ $# -gt 0 ]]; do
  case $1 in
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    --name)
      KEY_NAME="$2"
      shift 2
      ;;
    *)
      echo "未知参数: $1"
      exit 1
      ;;
  esac
done

KEY_DIR="$HOME/.ssh/$KEY_NAME"
PUB_KEY="$KEY_DIR/id_ed25519.pub"

echo "密钥名称: $KEY_NAME"
echo "密钥目录: $KEY_DIR"
echo "干运行模式: $DRY_RUN"

# 检查是否已存在密钥
if [ -f "$KEY_DIR/id_ed25519" ]; then
    echo "⚠️  密钥已存在: $KEY_DIR/id_ed25519"
    echo "公钥内容:"
    cat "$PUB_KEY"
    echo ""
    echo "如需重新生成，请先删除现有密钥:"
    echo "  rm -rf $KEY_DIR"
    exit 0
fi

if [ "$DRY_RUN" = false ]; then
    # 创建密钥目录
    mkdir -p "$KEY_DIR"
    
    # 生成ED25519密钥对
    ssh-keygen -t ed25519 -f "$KEY_DIR/id_ed25519" -C "mbri@alibaba-cloud-$(date +%Y%m%d)" -N ""
    
    # 设置适当权限
    chmod 700 "$KEY_DIR"
    chmod 600 "$KEY_DIR/id_ed25519"
    chmod 644 "$PUB_KEY"
else
    echo "[DRY RUN] 生成命令:"
    echo "  mkdir -p $KEY_DIR"
    echo "  ssh-keygen -t ed25519 -f $KEY_DIR/id_ed25519 -C 'mbri@alibaba-cloud' -N ''"
fi

# 显示公钥
echo ""
echo "=== SSH公钥 ==="
if [ "$DRY_RUN" = false ]; then
    cat "$PUB_KEY"
else
    echo "[DRY RUN] 公钥将生成在: $PUB_KEY"
fi

echo ""
echo "=== 部署步骤 ==="
echo "1. 复制上方公钥内容"
echo "2. 登录阿里云控制台 → 安全组 → 配置密钥对"
echo "3. 或将公钥添加到服务器的 ~/.ssh/authorized_keys"
echo "4. 测试连接: ssh -i $KEY_DIR/id_ed25519 ubuntu@服务器IP"
EOF
```

- [ ] **Step 2: 设置执行权限**

```bash
chmod +x scripts/generate-ssh-keys.sh
```

- [ ] **Step 3: 添加到.gitignore防止私钥提交**

```bash
echo "# SSH私钥" >> .gitignore
echo "*.pem" >> .gitignore
echo "*.key" >> .gitignore
echo "id_*" >> .gitignore
echo "*.pub" >> .gitignore
```

### Task 5: 构建并推送Docker镜像

**Files:**
- Test: `docker images | grep redol/website`
- Test: `docker login` 状态

- [ ] **Step 1: 登录Docker Hub**

```bash
docker login -u redol
```

Expected: `Login Succeeded`

- [ ] **Step 2: 构建前端镜像**

```bash
cd client
docker build -t redol/website-frontend:latest .
cd ..
```

Expected: `Successfully built abc1234`, `Successfully tagged redol/website-frontend:latest`

- [ ] **Step 3: 构建后端镜像**

```bash
cd server
docker build -t redol/website-backend:latest .
cd ..
```

Expected: `Successfully built def5678`, `Successfully tagged redol/website-backend:latest`

- [ ] **Step 4: 推送镜像到Docker Hub**

```bash
docker push redol/website-frontend:latest
docker push redol/website-backend:latest
```

Expected: `latest: digest: sha256:... size: ...`

- [ ] **Step 5: 验证推送成功**

```bash
docker images | grep "redol/website"
```

Expected: 显示两个镜像及大小信息

---

## 阶段二：服务器配置（阿里云Ubuntu 24.04）

### Task 6: 生成SSH密钥并配置

**Files:**
- Create: `~/.ssh/mbri_alibaba_cloud/` (本地)
- Test: `ssh-keygen -l -f ~/.ssh/mbri_alibaba_cloud/id_ed25519`

- [ ] **Step 1: 生成SSH密钥对**

```bash
bash scripts/generate-ssh-keys.sh
```

Expected: 显示ED25519公钥内容

- [ ] **Step 2: 复制公钥到剪贴板**

```bash
# Windows
cat ~/.ssh/mbri_alibaba_cloud/id_ed25519.pub | clip

# 或显示公钥供手动复制
cat ~/.ssh/mbri_alibaba_cloud/id_ed25519.pub
```

Expected: 显示 `ssh-ed25519 AAAAC3... mbri@alibaba-cloud`

- [ ] **Step 3: 阿里云控制台配置密钥对**
  1. 登录阿里云控制台
  2. 进入ECS实例管理
  3. 找到目标Ubuntu服务器
  4. 选择"密钥对" → "绑定密钥对"
  5. 粘贴公钥内容，命名为`mbri-website-key`

### Task 7: 服务器安全配置（SSH登录）

**前提:** 已通过阿里云控制台绑定SSH密钥对

- [ ] **Step 1: SSH连接到服务器**

```bash
ssh -i ~/.ssh/mbri_alibaba_cloud/id_ed25519 ubuntu@服务器IP
```

Expected: 成功登录到Ubuntu服务器

- [ ] **Step 2: 创建部署用户**

```bash
# 在服务器上执行
sudo useradd -m -s //bin/bash deploy
sudo usermod -aG sudo deploy
echo "deploy ALL=(ALL) NOPASSWD:ALL" | sudo tee /etc/sudoers.d/deploy
```

- [ ] **Step 3: 配置SSH安全**

```bash
# 备份原配置
sudo cp /etc/ssh/sshd_config /etc/ssh/sshd_config.backup

# 禁用root SSH登录
sudo sed -i 's/^PermitRootLogin.*/PermitRootLogin no/' /etc/ssh/sshd_config

# 禁用密码认证（仅密钥）
sudo sed -i 's/^PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config

# 重启SSH服务
sudo systemctl restart sshd
```

- [ ] **Step 4: 测试deploy用户SSH登录**

```bash
# 退出当前会话，测试deploy用户登录
exit
ssh -i ~/.ssh/mbri_alibaba_cloud/id_ed25519 deploy@服务器IP
```

Expected: 以deploy用户成功登录

### Task 8: 服务器环境准备

**前提:** 以deploy用户登录服务器

- [ ] **Step 1: 安装Docker Compose**

```bash
# Ubuntu 24.04已预装Docker Engine，安装Compose插件
sudo apt update
sudo apt install -y docker-compose-plugin
```

Expected: `docker compose version` 显示版本信息

- [ ] **Step 2: 配置防火墙**

```bash
# 安装UFW
sudo apt install -y ufw

# 配置规则
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp comment 'SSH'
sudo ufw allow 80/tcp comment 'HTTP'
sudo ufw allow 443/tcp comment 'HTTPS'

# 启用UFW
sudo ufw --force enable
sudo ufw status verbose
```

Expected: 显示3个ALLOW规则

- [ ] **Step 3: 创建项目目录**

```bash
mkdir -p ~/website
cd ~/website
```

- [ ] **Step 4: 克隆项目代码**

```bash
git clone https://github.com/MBriad/Website.git .
```

Expected: 克隆成功，显示 `Resolving deltas: 100%...`

---

## 阶段三：服务部署

### Task 9: 配置生产环境变量

**前提:** 在服务器 `~/website` 目录

- [ ] **Step 1: 创建生产环境变量文件**

```bash
cp .env.production.example .env.production
```

- [ ] **Step 2: 生成JWT密钥**

```bash
# 生成强随机密钥
JWT_SECRET=$(openssl rand -hex 32)
echo "生成的JWT密钥: $JWT_SECRET"
```

- [ ] **Step 3: 编辑环境变量**

```bash
cat > .env.production << EOF
# 生产环境配置
NODE_ENV=production
PORT=3000

# MongoDB连接（Docker内部使用服务名）
MONGODB_URI=mongodb://mongodb:27017/mbri-website

# JWT配置
JWT_SECRET=$JWT_SECRET
JWT_EXPIRES_IN=7d

# CORS（Docker内部Nginx反代，不需要）
ENABLE_CORS=false
EOF
```

- [ ] **Step 4: 设置文件权限**

```bash
chmod 600 .env.production
```

### Task 10: 拉取Docker镜像并启动服务

- [ ] **Step 1: 从Docker Hub拉取镜像**

```bash
docker pull redol/website-frontend:latest
docker pull redol/website-backend:latest
docker pull mongo:7
```

Expected: 显示拉取进度和完成状态

- [ ] **Step 2: 使用生产配置启动服务**

```bash
docker-compose -f docker-compose.prod.yml up -d
```

Expected: `Creating network "website_default"`, `Creating mbri-mongodb-prod...`

- [ ] **Step 3: 等待服务启动**

```bash
sleep 30
docker-compose -f docker-compose.prod.yml ps
```

Expected: 所有3个服务状态为 `Up (healthy)`

### Task 11: 验证部署

- [ ] **Step 1: 检查容器日志**

```bash
docker-compose -f docker-compose.prod.yml logs --tail=20
```

Expected: 无ERROR日志，后端显示`Server listening at http://0.0.0.0:3000`

- [ ] **Step 2: 测试前端访问**

```bash
curl -f http://localhost:80
```

Expected: 返回HTML内容，状态码200

- [ ] **Step 3: 测试API健康检查**

```bash
curl -f http://localhost/api/health
```

Expected: `{"status":"ok"}`

- [ ] **Step 4: 测试数据库连接**

```bash
docker-compose -f docker-compose.prod.yml exec mongodb mongosh --eval "db.adminCommand('ping')"
```

Expected: `{ ok: 1 }`

---

## 阶段四：监控与维护

### Task 12: 配置自动化任务

- [ ] **Step 1: 设置cron定时任务**

```bash
# 编辑crontab
crontab -e

# 添加以下内容：
# 每日凌晨2点备份MongoDB
0 2 * * * cd /home/deploy/website && ./scripts/backup-mongo.sh

# 每小时第5分钟健康检查  
5 * * * * cd /home/deploy/website && ./scripts/health-check.sh

# 每周日凌晨3点清理日志
0 3 * * 0 cd /home/deploy/website && ./scripts/cleanup-logs.sh
```

- [ ] **Step 2: 测试备份脚本**

```bash
./scripts/backup-mongo.sh
```

Expected: `✅ 备份成功`，备份文件在`/backups/mongodb/`

- [ ] **Step 3: 测试健康检查脚本**

```bash
./scripts/health-check.sh
```

Expected: 显示所有服务健康状态

### Task 13: 最终验证

- [ ] **Step 1: 从公网访问测试**

```bash
# 获取服务器公网IP
SERVER_IP=$(curl -s ifconfig.me)
echo "服务器公网IP: $SERVER_IP"
echo "访问地址: http://$SERVER_IP"
```

- [ ] **Step 2: 完整功能测试**

1. 浏览器访问 `http://服务器IP` - 应显示网站首页
2. 点击导航栏链接 - 应正常跳转
3. 访问 `/api/health` - 应返回 `{"status":"ok"}`
4. 注册新用户 - 首个注册用户应成为管理员

- [ ] **Step 3: 创建部署完成报告**

```bash
cat > ~/website/DEPLOYMENT_REPORT.md << EOF
# 部署完成报告

## 部署信息
- 时间: $(date)
- 服务器IP: $(curl -s ifconfig.me)
- Docker Hub镜像: redol/website-{frontend,backend}:latest
- MongoDB版本: 7

## 服务状态
$(docker-compose -f docker-compose.prod.yml ps)

## 安全配置
✅ SSH密钥认证
✅ 禁用root SSH登录  
✅ UFW防火墙（22,80,443）
✅ 非特权deploy用户
✅ MongoDB不暴露公网端口

## 监控配置
✅ 每日备份: 0 2 * * *
✅ 健康检查: 5 * * * *
✅ 日志清理: 0 3 * * 0

## 访问地址
- 网站: http://$(curl -s ifconfig.me)
- API健康检查: http://$(curl -s ifconfig.me)/api/health

## 管理员账户
首个注册用户自动成为管理员
EOF
```

---

## 执行选项

**计划已完成并准备就绪。两个执行选项：**

**1. 子代理驱动（推荐）** - 我为每个阶段（镜像准备、服务器配置、服务部署、验证监控）派遣一个子代理，每个阶段完成后进行审查，快速迭代

**2. 内联执行** - 我在此会话中分批执行任务，设置检查点进行审查

**选择：子代理驱动（用户已选择）**