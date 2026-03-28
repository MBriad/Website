#!/bin/bash

# 个人网站部署脚本
# 在阿里云 Ubuntu 服务器上运行

set -e  # 任何命令失败则退出

echo "=== 个人网站部署开始 ==="
echo "当前目录: $(pwd)"
echo "当前用户: $(whoami)"
echo "时间: $(date)"

# 检查 Docker 是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ Docker 未安装，请先运行 setup-server.sh"
    exit 1
fi

# 检查 Docker Compose 是否安装
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose 未安装，请先运行 setup-server.sh"
    exit 1
fi

# 检查 .env.production 文件
if [ ! -f .env.production ]; then
    echo "⚠️  未找到 .env.production 文件"
    echo "正在创建模板..."
    cat > .env.production << 'EOF'
# 生产环境配置
NODE_ENV=production
PORT=3000

# MongoDB 连接（Docker 内部使用服务名）
MONGODB_URI=mongodb://mongodb:27017/mbri-website

# JWT 配置（必须修改！）
# 生成强密钥命令：openssl rand -hex 32
JWT_SECRET=REPLACE_WITH_STRONG_RANDOM_SECRET_GENERATED_ON_SERVER
JWT_EXPIRES_IN=7d

# CORS（Docker 内部 Nginx 反代，不需要）
ENABLE_CORS=false
EOF
    echo "✅ 已创建 .env.production 模板"
    echo "⚠️  请编辑 .env.production 文件，设置 JWT_SECRET 等参数后再重新运行部署脚本"
    exit 1
fi

# 检查 JWT_SECRET 是否还是默认值
if grep -q "REPLACE_WITH_STRONG_RANDOM_SECRET" .env.production; then
    echo "❌ JWT_SECRET 仍然是默认值，请生成强密钥并更新 .env.production"
    echo "生成命令：openssl rand -hex 32"
    exit 1
fi

# 停止现有容器（如果有）
echo "停止现有容器..."
docker-compose down 2>/dev/null || true

# 拉取最新代码（如果是 Git 仓库）
if [ -d .git ]; then
    echo "拉取最新代码..."
    git pull origin main || echo "⚠️  Git 拉取失败，继续使用当前代码"
fi

# 构建并启动服务
echo "构建并启动 Docker 服务..."
docker-compose up -d --build

# 等待服务启动
echo "等待服务启动（30秒）..."
sleep 30

# 检查服务健康状态
echo "检查服务健康状态..."
FRONTEND_HEALTH=$(docker-compose ps frontend | grep -c "Up")
BACKEND_HEALTH=$(docker-compose ps backend | grep -c "Up")
MONGODB_HEALTH=$(docker-compose ps mongodb | grep -c "Up")

if [ $FRONTEND_HEALTH -eq 1 ] && [ $BACKEND_HEALTH -eq 1 ] && [ $MONGODB_HEALTH -eq 1 ]; then
    echo "✅ 所有服务运行正常"
    echo ""
    echo "=== 部署完成 ==="
    echo "前端访问: http://$(curl -s ifconfig.me)"
    echo "API 健康检查: http://$(curl -s ifconfig.me)/api/health"
    echo ""
    echo "查看日志: docker-compose logs -f"
    echo "停止服务: docker-compose down"
    echo "重启服务: docker-compose restart"
else
    echo "❌ 服务启动异常，请检查日志"
    echo "前端状态: $FRONTEND_HEALTH"
    echo "后端状态: $BACKEND_HEALTH"
    echo "数据库状态: $MONGODB_HEALTH"
    echo ""
    echo "查看日志: docker-compose logs"
    exit 1
fi