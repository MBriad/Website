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
docker images | grep "redol/website" || echo "未找到本地镜像"