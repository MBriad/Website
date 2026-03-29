# Issues

## [前端/动画] Links 页面加载后卡片不可见
- **状态**: 已解决
- **原因**: React 复用 DOM 节点导致 Framer Motion 未重新触发动画
- **方案**: 给 `<motion.main>` 加 `key="content"`，已应用到 About/Chip/Category/Links

## [前端/样式] 暗色模式下卡片背景色不跟随主题
- **状态**: 已解决
- **原因**: Framer Motion 内联样式覆盖 CSS 主题色，或 .map() 缺少 key
- **方案**: 不用 Framer Motion 控制颜色，只做位移/缩放动画

## [后端/环境] 端口 3000 被占用 EADDRINUSE
- **状态**: 已解决
- **原因**: 僵尸进程或重复启动
- **方案**: `netstat -ano | findstr :3000` 找 PID，`taskkill /PID xxx /F` 杀掉

## [前端/组件] NavBar 滚动收缩动画优化
- **状态**: 已解决
- **方案**: 使用 Framer Motion layout 属性 + useScroll 监听，文字宽度坍缩动画

## [部署/Docker] 镜像拉取失败
- **状态**: 已解决
- **原因**: 
  - DaoCloud 私有仓库需认证
  - Docker Hub 国内网络访问超时
  - 阿里云镜像路径格式不正确
- **方案**: 
  - 使用本地已有镜像：`docker-compose up`（不加 --build）
  - 或登录镜像仓库后重新构建
  - 修改 Dockerfile 镜像源为正确格式

## [后端/环境] MongoDB 连接失败
- **状态**: 已解决
- **原因**: 
  - 本地未启动 MongoDB 服务，连接 localhost:27017 被拒绝
  - 之前使用本地 Windows MongoDB 服务，后来改用 Docker MongoDB 容器，需要确保 Docker 容器在运行
- **采用方案**: 方案 2 ✅（启动 Docker MongoDB 容器，用 localhost:27017 连接）
  - 方案 1：本地安装并启动 MongoDB（Windows 服务）
  - **方案 2**：启动 Docker MongoDB 容器，确保端口映射 `27017:27017` 存在，再用 localhost 连接
  - 方案 3：只运行 MongoDB 容器 + 本地后端分离使用
- **验证**: `netstat -ano | findstr ":27017"` 检查端口是否监听

## [部署/SSH] 阿里云服务器SSH连接问题
- **状态**: 已解决
- **时间**: 2026-03-28
- **服务器**: 阿里云 Ubuntu 24.04 (IP: 8.138.194.87)
- **问题描述**: 
  - 使用 `ubuntu` 用户连接失败：`Permission denied (publickey)`
  - 使用 `root` 用户连接成功
- **原因分析**: 
  - 阿里云默认创建的 Ubuntu 实例可能没有 `ubuntu` 用户，或该用户未配置 SSH 密钥
  - `root` 用户在创建实例时已配置密钥对
- **采用方案**: 使用 `root` 用户连接 ✅
  - 连接命令: `ssh -i C:/Users/MBri/.ssh/mbri_alibaba_cloud/id_ed25519 root@8.138.194.87`
  - 后续创建 `deploy` 用户进行部署
- **后续计划**: 
  1. 以 `root` 用户连接
  2. 创建 `deploy` 用户
  3. 配置 SSH 密钥和安全设置
  4. 使用 `deploy` 用户进行后续部署

## [部署/阿里云] 阿里云服务器部署成功
- **状态**: 已解决
- **时间**: 2026-03-28 22:30
- **服务器**: 阿里云 Ubuntu 24.04 (IP: 8.138.194.87)
- **部署架构**: Docker + 阿里云ACR
- **部署详情**:
  - 镜像仓库: 阿里云容器镜像服务 (ACR)
  - 镜像地址: `crpi-zu9n3xiqg04wacyr.cn-guangzhou.personal.cr.aliyuncs.com/mbri/`
  - 服务组件: MongoDB 7, 后端 (Fastify), 前端 (Nginx + React)
  - 部署方式: docker-compose.prod.yml
- **完成步骤**:
  1. ✅ 本地构建Docker镜像并推送到ACR
  2. ✅ 服务器配置Docker镜像加速
  3. ✅ 更新docker-compose.prod.yml使用ACR镜像
  4. ✅ 从ACR拉取镜像并启动服务
  5. ✅ 验证服务健康状态和网络访问
- **访问地址**:
  - 网站: http://8.138.194.87
  - API健康检查: http://8.138.194.87/api/health
- **安全配置**:
  - ✅ 禁用root SSH登录
  - ✅ 使用deploy用户部署
  - ✅ 防火墙仅开放22,80,443端口
  - ✅ MongoDB不暴露公网端口
  - ✅ JWT_SECRET已生成强随机密钥
- **监控配置**:
  - ✅ 服务健康检查 (docker-compose healthcheck)
  - ✅ 自动重启 (restart: unless-stopped)
  - ✅ 数据持久化 (MongoDB volume)
- **下一步**:
  - 购买域名并配置DNS
  - 配置HTTPS/SSL证书
  - 设置定期备份脚本
  - 配置监控告警
