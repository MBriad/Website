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

## [安全/配置] .env.production 安全修复
- **状态**: 已解决
- **时间**: 2026-03-28
- **问题描述**: 
  - `.env.production` 文件被提交到GitHub仓库
  - 该文件包含JWT_SECRET等敏感配置
  - 虽然当前使用的是占位符，但存在未来泄露风险
- **风险评估**: 
  - 当前风险: 低（JWT_SECRET是占位符）
  - 未来风险: 高（可能不小心提交真实密钥）
- **采用方案**: ✅ 修改.gitignore并从Git跟踪中移除
  - 修改`.gitignore`文件，添加`.env.production`到忽略列表
  - 使用`git rm --cached .env.production`从Git跟踪中移除
  - 提交并推送到GitHub
- **修复详情**:
  - 修改文件: `.gitignore`
  - 添加内容: `.env.production`（第11行）
  - Git操作: `git rm --cached .env.production`
  - 提交信息: "security: add .env.production to .gitignore and remove from tracking"
- **验证结果**:
  - ✅ GitHub仓库中不再包含`.env.production`文件
  - ✅ 服务器JWT_SECRET是真实生成的强随机密钥
  - ✅ `.gitignore`配置正确，防止未来意外提交
- **安全状态**:
  - 当前配置: 安全 ✅
  - 服务器JWT_SECRET: `49950bd89fdbcedc38c54182d54212ffcf52eb994310eaf7cbf5a947c63efd1a` (64字符强随机密钥)
  - 未来保护: 已配置.gitignore防止意外提交
- **最佳实践**:
  - 敏感配置文件不应该进入版本控制
  - 生产环境密钥应在服务器上直接设置
  - 定期轮换JWT_SECRET等敏感密钥
  - 使用环境变量管理敏感配置

## [部署/Docker] 服务器磁盘 IO 瓶颈导致部署卡死
- **状态**: 已解决
- **时间**: 2026-04-01
- **服务器**: 阿里云 ECS (IP: 8.138.194.87)
- **问题描述**:
  - `docker compose up -d --build` 同时构建前后端 + 拉取 MongoDB 镜像
  - 阿里云 ECS 磁盘 IO 上限低，多任务并发导致 IO 饱和
  - 结果：SSH 超时（banner exchange timeout）、Docker 构建极慢、需要重启服务器
- **原因分析**:
  - `docker compose build` 默认并行构建所有服务，同时 npm ci + npm build + 镜像拉取
  - MongoDB 基础镜像 (~300MB) 和 Node 基础镜像 (~100MB) 同时下载
  - 服务器使用的是入门级云盘，IO 性能有限
- **采用方案**: 分步骤部署，串行执行，每次只做一件事 ✅
  ```bash
  # 步骤 1: 停止旧容器（不删 volume）
  docker compose down

  # 步骤 2: 清理旧镜像释放磁盘空间
  docker system prune -af

  # 步骤 3: 等 10 秒让 IO 恢复
  sleep 10

  # 步骤 4: 只构建后端（较小，先搞定）
  docker compose build backend

  # 步骤 5: 等 10 秒
  sleep 10

  # 步骤 6: 只构建前端
  docker compose build frontend

  # 步骤 7: 等 10 秒
  sleep 10

  # 步骤 8: 启动所有服务
  docker compose up -d
  ```
- **注意事项**:
  - `docker compose down` **不会删除 volume**，数据库数据安全
  - 只有 `docker compose down -v` 才会删除 volume，绝对不要用
  - `docker system prune -af` 不会删除 volume（没有 `--volumes` 参数）
  - 阿里云 ECS 入门级云盘 IO 约 10-30 MB/s，避免并发读写
  - 如果 SSH 再次超时，从阿里云控制台网页终端执行剩余步骤

---

## [运维/账户] 服务器账户配置

### 用户账户总览

| 用户 | UID | Shell | sudo权限 | 主要用途 |
|------|-----|-------|----------|----------|
| root | 0 | /bin/bash | 完整 | 系统管理 |
| admin | 1000 | /bin/bash | NOPASSWD: ALL | 日常管理、SSH登录 |
| deploy | 1001 | /bin/bash | NOPASSWD: docker相关 | Docker部署专用 |

### SSH 密钥

| 用户 | 密钥指纹 | 用途 |
|------|----------|------|
| root | SHA256:z9NSXJcbCWwQjaCxFNYse5jqC0MD9xrSbmouOzb3A3w | 我们的新密钥 (id_ed25519_server) |
| admin | 同上 | 使用root的密钥 |
| deploy | SHA256:IHVCxLnf4bXDl3+j4Rj9MAZKv9cqay1q9u71HWXNfMXa | 阿里云原有密钥 (mbri_alibaba_cloud) |

### 各账户目录内容

#### /home/admin/
- .bash_history - 命令历史
- .ssh/ - SSH配置
- .cache/ - 缓存目录

#### /home/deploy/
- website/ - 网站源码仓库 (git项目)
  - client/ - 前端代码
  - server/ - 后端代码
  - docker-compose.yml - 容器编排
  - .env.production - 生产环境配置
  - .git/ - Git仓库
  - issues.md, AGENTS.md - 文档
- .docker/ - Docker buildx 配置
- .ssh/ - 存有阿里云密钥

### 优化记录
- 2026-04-03: 限制 deploy 用户仅能执行 docker/docker-compose 命令
- 2026-04-03: 删除 admin 目录下的冗余 get-docker.sh

---

## [运维/存储] Docker 容器存储位置

### Docker 数据目录

```
/var/lib/docker/
├── containers/    # 容器配置文件和日志
├── image/         # 镜像层数据
├── volumes/      # Docker 卷（持久数据）
├── buildkit/     # 构建缓存
```

### 各类型存储位置

| 类型 | 位置 | 内容 |
|------|------|------|
| 容器文件 | /var/lib/docker/containers/ | 运行时的日志、配置 |
| 镜像层 | /var/lib/docker/image/ | 镜像的只读层 |
| 卷（数据） | /var/lib/docker/volumes/ | MongoDB 数据等持久化数据 |

### 目录作用说明
- /home/deploy/website/ = 工厂（源代码，用来构建镜像）
- /var/lib/docker/ = 仓库（存放和运行已构建好的镜像）

### 容器网络
```
Docker 网络: website_default
├── mbri-frontend  (172.18.0.2)  → Nginx :80
├── mbri-backend   (172.18.0.3)  → Node.js :3000
└── mbri-mongodb  (172.18.0.4)  → MongoDB :27017
```
