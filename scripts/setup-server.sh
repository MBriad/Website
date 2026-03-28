#!/bin/bash

# 阿里云 Ubuntu 服务器初始化脚本
# 以 root 用户运行

set -e

echo "=== 阿里云 Ubuntu 服务器初始化 ==="
echo "此脚本将配置："
echo "1. 创建非 root 部署用户"
echo "2. SSH 安全加固"
echo "3. 防火墙配置 (UFW)"
echo "4. Docker 和 Docker Compose 安装"
echo "5. 时区和时间同步"
echo "6. 基础监控工具"
echo ""
read -p "是否继续？ (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "取消"
    exit 1
fi

# 记录开始时间
START_TIME=$(date +%s)

# ==================== 1. 系统更新 ====================
echo "1. 更新系统包..."
apt-get update
apt-get upgrade -y

# ==================== 2. 创建部署用户 ====================
echo "2. 创建部署用户 'deploy'..."
if id "deploy" &>/dev/null; then
    echo "用户 'deploy' 已存在"
else
    useradd -m -s /bin/bash deploy
    echo "deploy ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/deploy
    chmod 440 /etc/sudoers.d/deploy
    echo "✅ 创建用户 'deploy' 完成"
    echo "请为 deploy 用户设置密码："
    passwd deploy
fi

# ==================== 3. SSH 安全加固 ====================
echo "3. SSH 安全配置..."
# 备份原配置
cp /etc/ssh/sshd_config /etc/ssh/sshd_config.backup.$(date +%Y%m%d)

# 禁用 root SSH 登录
sed -i 's/^PermitRootLogin.*/PermitRootLogin no/' /etc/ssh/sshd_config

# 禁用密码认证（仅密钥登录）
sed -i 's/^PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config

# 更改 SSH 端口（可选，取消注释修改）
# sed -i 's/^#Port 22/Port 2222/' /etc/ssh/sshd_config

# 重启 SSH 服务
systemctl restart sshd
echo "✅ SSH 安全配置完成"
echo "⚠️  重要：请确保已添加 SSH 公钥到 ~/.ssh/authorized_keys，否则将无法登录！"

# ==================== 4. 防火墙配置 ====================
echo "4. 配置防火墙 (UFW)..."
apt-get install -y ufw

# 默认策略
ufw default deny incoming
ufw default allow outgoing

# 允许端口
ufw allow 22/tcp comment 'SSH'
ufw allow 80/tcp comment 'HTTP'
ufw allow 443/tcp comment 'HTTPS'
# 如果更改了 SSH 端口，请使用：
# ufw allow 2222/tcp comment 'SSH Custom Port'

# 启用 UFW
ufw --force enable
ufw status verbose
echo "✅ 防火墙配置完成"

# ==================== 5. Docker 安装 ====================
echo "5. 安装 Docker 和 Docker Compose..."

# 卸载旧版本
apt-get remove -y docker docker-engine docker.io containerd runc

# 安装依赖
apt-get install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# 添加 Docker GPG 密钥
mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# 添加 Docker 仓库
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

# 安装 Docker
apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# 启动 Docker 服务
systemctl enable docker
systemctl start docker

# 将 deploy 用户添加到 docker 组
usermod -aG docker deploy

# 安装 Docker Compose v2（通过插件）
apt-get install -y docker-compose-plugin

# 验证安装
docker --version
docker compose version
echo "✅ Docker 安装完成"

# ==================== 6. 时区和时间同步 ====================
echo "6. 配置时区和时间同步..."
# 设置时区为上海
timedatectl set-timezone Asia/Shanghai

# 安装并配置 NTP
apt-get install -y chrony
systemctl enable chrony
systemctl start chrony

echo "当前时间: $(date)"
echo "✅ 时区配置完成"

# ==================== 7. 基础监控工具 ====================
echo "7. 安装监控工具..."
apt-get install -y \
    htop \
    nload \
    ncdu \
    fail2ban \
    tree \
    git \
    curl \
    wget \
    vim

# 配置 fail2ban
systemctl enable fail2ban
systemctl start fail2ban

echo "✅ 监控工具安装完成"

# ==================== 8. 项目目录准备 ====================
echo "8. 准备项目目录..."
PROJECT_DIR="/home/deploy/website"
mkdir -p $PROJECT_DIR
chown -R deploy:deploy $PROJECT_DIR

# 创建备份目录
BACKUP_DIR="/backups"
mkdir -p $BACKUP_DIR
chown -R deploy:deploy $BACKUP_DIR

echo "项目目录: $PROJECT_DIR"
echo "备份目录: $BACKUP_DIR"

# ==================== 9. 部署脚本准备 ====================
echo "9. 准备部署脚本..."
# 切换到 deploy 用户创建脚本
sudo -u deploy bash << 'EOF'
cd ~/website

# 创建基础脚本
cat > setup-server.sh << 'SCRIPT_EOF'
#!/bin/bash
echo "此脚本应在初始服务器配置时以 root 运行"
echo "常规部署请使用 deploy.sh"
SCRIPT_EOF

chmod +x setup-server.sh
EOF

echo "✅ 部署脚本准备完成"

# ==================== 完成 ====================
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

echo ""
echo "=== 服务器初始化完成 ==="
echo "耗时: ${DURATION} 秒"
echo ""
echo "✅ 已完成配置："
echo "   - 部署用户: deploy"
echo "   - SSH 安全: 禁用 root 登录，仅密钥认证"
echo "   - 防火墙: 仅开放 22(SSH), 80(HTTP), 443(HTTPS)"
echo "   - Docker: $(docker --version)"
echo "   - Docker Compose: $(docker compose version)"
echo "   - 时区: Asia/Shanghai"
echo "   - 监控: htop, nload, ncdu, fail2ban"
echo ""
echo "⚠️  重要提醒："
echo "1. 请立即测试 SSH 登录（使用 deploy 用户和密钥）"
echo "2. 将项目代码复制到 /home/deploy/website/"
echo "3. 运行部署命令："
echo "   sudo -u deploy bash"
echo "   cd ~/website"
echo "   ./scripts/deploy.sh"
echo ""
echo "4. 如需 HTTPS，请配置 Certbot 或阿里云 SSL 证书"
echo "5. 定期检查 /backups/ 目录的数据库备份"
echo ""
echo "初始化完成！"