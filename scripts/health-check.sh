#!/bin/bash

# 服务健康检查脚本
# 可配置为 cron 定时任务，每小时运行一次

set -e

# 配置
LOG_FILE="/var/log/website-health.log"
MAX_LOG_SIZE=10485760  # 10MB
ALERT_EMAIL=""  # 可配置告警邮箱
SERVER_IP=$(curl -s ifconfig.me || hostname -I | awk '{print $1}')

# 创建日志目录
mkdir -p "$(dirname "$LOG_FILE")"

# 日志轮转
if [ -f "$LOG_FILE" ] && [ $(stat -c%s "$LOG_FILE") -gt $MAX_LOG_SIZE ]; then
    mv "$LOG_FILE" "${LOG_FILE}.$(date +%Y%m%d_%H%M%S)"
fi

# 日志函数
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# 告警函数
alert() {
    local message="$1"
    log "🚨 告警: $message"
    
    # 可扩展：发送邮件、Slack、钉钉等
    if [ -n "$ALERT_EMAIL" ]; then
        echo "告警时间: $(date)" | mail -s "网站服务异常: $SERVER_IP" "$ALERT_EMAIL"
    fi
}

log "=== 健康检查开始 ==="

# ==================== 1. 检查 Docker 服务 ====================
log "1. 检查 Docker 服务..."
if ! systemctl is-active --quiet docker; then
    alert "Docker 服务未运行"
    systemctl restart docker
    sleep 5
    log "已尝试重启 Docker 服务"
fi

# ==================== 2. 检查容器状态 ====================
log "2. 检查容器状态..."
CONTAINER_STATUS=$(docker-compose ps --services --filter "status=running")

EXPECTED_CONTAINERS="mongodb backend frontend"
for container in $EXPECTED_CONTAINERS; do
    if echo "$CONTAINER_STATUS" | grep -q "^$container$"; then
        log "✅ $container 运行正常"
    else
        alert "容器 $container 未运行"
        # 尝试重启
        docker-compose restart "$container"
        sleep 10
        log "已尝试重启容器 $container"
    fi
done

# ==================== 3. 检查服务端口 ====================
log "3. 检查服务端口..."

# 检查前端 (80)
if curl -s -f -o /dev/null --max-time 5 "http://localhost:80" || \
   curl -s -f -o /dev/null --max-time 5 "http://127.0.0.1:80"; then
    log "✅ 前端服务 (80) 可访问"
else
    alert "前端服务 (80) 不可访问"
fi

# 检查后端健康端点 (通过 Nginx 代理)
if curl -s -f -o /dev/null --max-time 5 "http://localhost/api/health" || \
   curl -s -f -o /dev/null --max-time 5 "http://127.0.0.1/api/health"; then
    log "✅ 后端 API 健康检查通过"
else
    alert "后端 API 健康检查失败"
fi

# 检查 MongoDB (内部网络)
if docker-compose exec -T mongodb mongosh --eval "db.adminCommand('ping')" --quiet > /dev/null 2>&1; then
    log "✅ MongoDB 连接正常"
else
    alert "MongoDB 连接失败"
fi

# ==================== 4. 检查系统资源 ====================
log "4. 检查系统资源..."

# CPU 使用率
CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)
if (( $(echo "$CPU_USAGE > 90" | bc -l) )); then
    alert "CPU 使用率过高: ${CPU_USAGE}%"
else
    log "✅ CPU 使用率: ${CPU_USAGE}%"
fi

# 内存使用率
MEM_USAGE=$(free | grep Mem | awk '{print $3/$2 * 100.0}')
if (( $(echo "$MEM_USAGE > 90" | bc -l) )); then
    alert "内存使用率过高: ${MEM_USAGE}%"
else
    log "✅ 内存使用率: ${MEM_USAGE}%"
fi

# 磁盘使用率
DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
if (( DISK_USAGE > 90 )); then
    alert "磁盘使用率过高: ${DISK_USAGE}%"
else
    log "✅ 磁盘使用率: ${DISK_USAGE}%"
fi

# ==================== 5. 检查备份 ====================
log "5. 检查备份..."
BACKUP_DIR="/backups/mongodb"
if [ -d "$BACKUP_DIR" ]; then
    LATEST_BACKUP=$(find "$BACKUP_DIR" -name "mbri-website_*.gz" -type f -printf '%T@ %p\n' 2>/dev/null | sort -n | tail -1 | cut -d' ' -f2-)
    
    if [ -n "$LATEST_BACKUP" ]; then
        BACKUP_AGE=$(( $(date +%s) - $(stat -c %Y "$LATEST_BACKUP") ))
        BACKUP_AGE_HOURS=$((BACKUP_AGE / 3600))
        
        if [ $BACKUP_AGE_HOURS -gt 48 ]; then
            alert "最新备份已超过 48 小时 (${BACKUP_AGE_HOURS} 小时前)"
        else
            log "✅ 最新备份: $(basename "$LATEST_BACKUP") (${BACKUP_AGE_HOURS} 小时前)"
        fi
    else
        alert "未找到任何备份文件"
    fi
else
    alert "备份目录不存在: $BACKUP_DIR"
fi

# ==================== 6. 检查日志错误 ====================
log "6. 检查错误日志..."
ERROR_COUNT=$(docker-compose logs --tail=100 2>/dev/null | grep -i "error\|exception\|failed\|uncaught" | wc -l)
if [ $ERROR_COUNT -gt 10 ]; then
    alert "发现 $ERROR_COUNT 个错误日志条目"
    docker-compose logs --tail=20 | grep -i "error\|exception\|failed\|uncaught" | head -5 >> "$LOG_FILE"
else
    log "✅ 错误日志检查正常 (最近 100 行中发现 $ERROR_COUNT 个错误)"
fi

# ==================== 完成 ====================
log "=== 健康检查完成 ==="
log "总体状态: $(if [ $ERROR_COUNT -le 10 ] && [ -n "$LATEST_BACKUP" ] && [ $BACKUP_AGE_HOURS -le 48 ]; then echo "✅ 健康"; else echo "⚠️  需要注意"; fi)"
log "检查时间: $(date)"
log "服务器IP: $SERVER_IP"
log "日志文件: $LOG_FILE"

# 输出摘要
echo ""
echo "=== 健康检查摘要 ==="
echo "时间: $(date)"
echo "前端: $(curl -s -o /dev/null -w "%{http_code}" http://localhost:80 2>/dev/null || echo "down")"
echo "后端: $(curl -s -o /dev/null -w "%{http_code}" http://localhost/api/health 2>/dev/null || echo "down")"
echo "MongoDB: $(if docker-compose exec -T mongodb mongosh --eval "db.adminCommand('ping')" --quiet >/dev/null 2>&1; then echo "up"; else echo "down"; fi)"
echo "CPU: ${CPU_USAGE}%"
echo "内存: ${MEM_USAGE}%"
echo "磁盘: ${DISK_USAGE}%"
echo "最新备份: ${BACKUP_AGE_HOURS:-"N/A"} 小时前"
echo "错误日志: $ERROR_COUNT 个"
echo "详细日志: $LOG_FILE"