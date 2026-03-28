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
