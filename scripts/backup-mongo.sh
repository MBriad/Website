#!/bin/bash

# MongoDB 备份脚本
# 每日自动备份，保留最近 7 天备份

set -e

# 配置
BACKUP_DIR="/backups/mongodb"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="mbri-website_${DATE}"
RETENTION_DAYS=7

# 创建备份目录
mkdir -p $BACKUP_DIR

echo "=== MongoDB 备份开始 ==="
echo "时间: $(date)"
echo "备份名称: $BACKUP_NAME"
echo "目标目录: $BACKUP_DIR"

# 检查 MongoDB 容器是否运行
if ! docker-compose ps mongodb | grep -q "Up"; then
    echo "❌ MongoDB 容器未运行，无法备份"
    exit 1
fi

# 执行备份
echo "执行 MongoDB 备份..."
docker-compose exec -T mongodb mongodump \
    --db mbri-website \
    --archive \
    --gzip \
    > "$BACKUP_DIR/${BACKUP_NAME}.gz"

# 检查备份是否成功
if [ $? -eq 0 ] && [ -s "$BACKUP_DIR/${BACKUP_NAME}.gz" ]; then
    BACKUP_SIZE=$(du -h "$BACKUP_DIR/${BACKUP_NAME}.gz" | cut -f1)
    echo "✅ 备份成功"
    echo "备份文件: $BACKUP_DIR/${BACKUP_NAME}.gz"
    echo "备份大小: $BACKUP_SIZE"
else
    echo "❌ 备份失败"
    rm -f "$BACKUP_DIR/${BACKUP_NAME}.gz"
    exit 1
fi

# 清理旧备份
echo "清理超过 ${RETENTION_DAYS} 天的旧备份..."
find $BACKUP_DIR -name "mbri-website_*.gz" -mtime +$RETENTION_DAYS -delete

# 列出当前备份
echo ""
echo "当前备份文件:"
ls -lh $BACKUP_DIR/mbri-website_*.gz 2>/dev/null || echo "暂无备份文件"

# 生成备份报告
cat > "$BACKUP_DIR/latest_backup_report.txt" << EOF
=== MongoDB 备份报告 ===
备份时间: $(date)
备份文件: ${BACKUP_NAME}.gz
文件大小: ${BACKUP_SIZE}
备份目录: ${BACKUP_DIR}
保留策略: ${RETENTION_DAYS} 天
状态: ✅ 成功
EOF

echo ""
echo "=== 备份完成 ==="
echo "备份报告: $BACKUP_DIR/latest_backup_report.txt"