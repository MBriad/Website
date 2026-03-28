#!/bin/bash

# 日志和临时文件清理脚本
# 建议每周运行一次

set -e

echo "=== 系统清理开始 ==="
echo "时间: $(date)"

# ==================== 1. Docker 日志清理 ====================
echo "1. 清理 Docker 日志和容器..."
docker system prune -f --volumes

# 清理 Docker 日志文件（如果过大）
find /var/lib/docker/containers/ -name "*.log" -type f -size +100M -delete 2>/dev/null || true

# ==================== 2. 项目日志清理 ====================
echo "2. 清理项目日志..."
# 清理 server/logs/ 中超过 30 天的日志
find ./server/logs -name "*.log" -type f -mtime +30 -delete 2>/dev/null || true

# 清理健康检查日志
find /var/log/ -name "website-health*.log" -type f -mtime +30 -delete 2>/dev/null || true

# ==================== 3. 备份文件清理 ====================
echo "3. 清理旧备份..."
BACKUP_DIR="/backups"
# MongoDB 备份保留 30 天
find "$BACKUP_DIR/mongodb" -name "*.gz" -type f -mtime +30 -delete 2>/dev/null || true

# 清理旧的备份报告
find "$BACKUP_DIR" -name "*_backup_report.txt" -type f -mtime +7 -delete 2>/dev/null || true

# ==================== 4. 临时文件清理 ====================
echo "4. 清理临时文件..."
# 清理 npm 缓存
rm -rf ./client/node_modules/.cache 2>/dev/null || true
rm -rf ./server/node_modules/.cache 2>/dev/null || true

# 清理构建产物
rm -rf ./client/dist 2>/dev/null || true
rm -rf ./server/dist 2>/dev/null || true

# 清理系统临时文件
find /tmp -name "*.tmp" -type f -mtime +7 -delete 2>/dev/null || true
find /var/tmp -name "*.tmp" -type f -mtime +7 -delete 2>/dev/null || true

# ==================== 5. 磁盘使用统计 ====================
echo "5. 磁盘使用统计..."
echo "清理前磁盘使用:"
df -h / | tail -1

# 计算清理大小（估计）
DU_CLEANED=$(du -sh ./server/logs 2>/dev/null | cut -f1) || DU_CLEANED="0"
echo "清理的日志大小: $DU_CLEANED"

# ==================== 完成 ====================
echo ""
echo "=== 清理完成 ==="
echo "时间: $(date)"
echo "建议将本脚本添加到 cron 每周自动运行:"
echo "0 2 * * 0 /home/deploy/website/scripts/cleanup-logs.sh"
echo ""
echo "当前磁盘使用:"
df -h / | tail -1