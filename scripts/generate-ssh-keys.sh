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

# 获取用户主目录
if [ -n "$USERPROFILE" ]; then
    # Windows
    HOME_DIR="$USERPROFILE"
    KEY_DIR="$HOME_DIR/.ssh/$KEY_NAME"
elif [ -n "$HOME" ]; then
    # Unix/Linux/Mac
    HOME_DIR="$HOME"
    KEY_DIR="$HOME_DIR/.ssh/$KEY_NAME"
else
    echo "❌ 无法确定用户主目录"
    exit 1
fi

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
    
    # 设置适当权限（仅对Unix/Linux/Mac）
    if [ -z "$USERPROFILE" ]; then
        chmod 700 "$KEY_DIR"
        chmod 600 "$KEY_DIR/id_ed25519"
        chmod 644 "$PUB_KEY"
    fi
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