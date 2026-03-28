1. ## 个人网站项目规划 (V3.0 全栈联调版)

   ### 技术栈

   **前端 (React - 大堂)**
   - React 19 + Vite 6
   - React Router 7 (SPA路由)
   - Zustand 5 (状态管理)
   - Framer Motion 12 (动画)
   - **Axios (网络请求客户端)** 🆕

   **后端 (Node.js - 后厨)**
   - **Fastify (高性能框架)** 🆕
   - MongoDB (数据库)
   - JWT (身份认证)

   ---

   ## 前端开发任务

   ### 已完成 ✅

   **项目基础**
   - [x] 项目初始化 (Vite + React)
   - [x] 路由配置 (App.jsx)
   - [x] 超级权限插件配置 (opencode.json)

   **组件开发**
   - [x] NavBar.jsx - 导航栏组件（滚动收缩动画）
   - [x] SearchModal.jsx - 搜索弹窗组件
   - [x] ScrollProgress.jsx - 滚动进度条
   - [x] MusicPlayer.jsx - 音乐播放器
   - [x] BackToTop.jsx - 返回顶部按钮
   - [x] Footer.jsx - 页脚组件
   - [x] Icons.jsx - SVG 图标库

   **页面开发**
   - [x] Home.jsx - 首页（打字机语录 + 最新文章 + 特色项目）
   - [x] Category.jsx - 文章分类/归档页（标签筛选 + 时间线视图）
   - [x] About.jsx - 关于我页面（个人介绍 + 联系方式）
   - [x] Links.jsx - 友链页面（卡片网格 + 申请入口）
   - [x] Chip.jsx - 硬件项目展示（项目卡片 + 技术栈标签）

   **样式系统**
   - [x] CSS 模块化重构（variables.css + global.css + 组件样式）
   - [x] 暗色/亮色主题切换
   - [x] 响应式基础样式

   **功能特性**
   - [x] 导航栏滚动收缩动画
   - [x] 页面切换过渡动画
   - [x] 卡片淡入动画
   - [x] 打字机语录效果

   **数据文件 (本地静态版)**
   - [x] articles.json - 文章数据
   - [x] projects.json - 项目数据
   - [x] siteConfig.json - 网站配置
   - [x] links.json - 友链数据
   - [x] playlist.json - 音乐播放列表

   ---

   ## 全栈待开发任务 📋 (按执行顺序重新排列)

   ### 🚨 紧急修复任务 (最高优)

   - [x] **修复 React 无限死循环**：检查 `Home.jsx` 等页面，确保 `fetch` 或 `axios` 调用被包裹在 `useEffect(..., [])` 中，必须带有空数组依赖。

   ### P0 - 完美门面 (移动端与 SEO)

   - [x] **响应式布局适配**：确保 NavBar 折叠菜单生效，卡片在手机端自动变为单列显示，优化触摸热区。
   - [x] **SEO 与 Open Graph 配置**：在 `index.html` 添加基础 `meta` 标签（`og:title`, `og:image` 等），确保社交软件分享时展示精美卡片。

   ### P1 - 铺设通信管道 (前后端网络联调) 🔌

   - [x] **后端通信基础 (Fastify)**：初始化 Fastify 项目，安装并配置 `@fastify/cors` 允许 `localhost:5173` 跨域访问。写一个测试接口 `GET /api/articles`。
   - [x] **前端通信基础 (Axios)**：封装 `src/api/index.js`，配置全局 `baseURL: 'http://localhost:3000/api'`。
     - 注意：旧 `src/api.js`（fetch 版）仍残留，建议清理，页面已统一使用 `api/index.js`。
   - [x] **数据动态替换**：把前端读取本地 `.json` 的代码，全部替换为通过 Axios 向 Fastify 请求真实数据。
   - [x] **加载与错误状态 (UX)**：开发日系简约风的"加载中..."动画；添加网络请求失败时的优雅错误提示 (Error Boundary)。

   ### P2 - 真实数据与仓库建设 (数据库)
   - [x] **连接 MongoDB**：在 Fastify 中集成 Mongoose 或官方驱动，连接本地 MongoDB 数据库。
   - [x] **数据播种 (Seed)**：编写 Node.js 脚本，把现有的 `articles.json` 等本地数据一键导入到 MongoDB 中。
   - [x] **开发真实 RESTful API**：
     - `GET /api/articles` (列表及分页)
     - `GET /api/articles/:slug` (单篇文章)
     - `GET /api/projects` 等...

   ---

   ## 待办执行计划 🚀 (按优先级排列)

   ### 第一步 — Markdown 渲染 + 文章详情页接入 API

   - [x] **安装 react-markdown**：`npm install react-markdown`
   - [x] **改造 ArticleDetail.jsx**：从读本地 `articles.json` 改为调用 `articleAPI.getBySlug(slug)`
   - [x] **渲染 Markdown 内容**：用 `<ReactMarkdown>` 渲染 `article.content`，支持代码块等基础格式
    - [x] **（可选）代码高亮**：引入 `react-syntax-highlighter` 实现代码语法高亮

   ### 第二步 — JWT 登录接口

   - [x] **创建 `server/src/routes/auth.ts`**：实现 `POST /api/login` 接口
     - 从 `.env` 读取管理员账号密码
     - 使用 bcrypt 验证密码
     - 成功返回 JWT token
   - [x] **注册 auth 路由**：在 `server/src/index.ts` 的 `registerRoutes()` 中添加

   ### 第三步 — CRUD 接口（受 auth 保护）

   - [x] **文章 CRUD**：为 `articles.ts` 添加 POST、PUT、DELETE 路由，使用 `authMiddleware` 保护
   - [x] **项目 CRUD**：为 `projects.ts` 添加 POST、PUT、DELETE 路由
   - [x] **友链 CRUD**：为 `links.ts` 添加 POST、PUT、DELETE 路由
   - [x] **配置 CRUD**：为 `config.ts` 添加 PUT 路由（更新网站配置）

   ### 第四步 — 管理端前端

   - [x] **创建登录页**：`client/src/pages/Login.jsx`，表单提交到 `POST /api/login`，存储 token 到 localStorage
   - [x] **创建管理页**：`client/src/pages/Admin.jsx`，文章/项目/友链列表 + 增删改表单
   - [x] **添加路由**：在 `App.jsx` 中添加 `/login` 和 `/admin` 路由
   - [x] **Axios 拦截器**：取消注释 `api/index.js` 中的 token 注入逻辑

   ### 第五步 — Markdown 编辑器

   - [x] **安装 react-md-editor**：`npm install @uiw/react-md-editor`
   - [x] **集成到 Admin 页**：在文章编辑表单中使用 `<MDEditor>`，左侧编辑右侧预览

   ### 第六步 — 图片处理

   - [x] **安装 sharp**：在 `server/` 目录下 `npm install sharp`
   - [x] **创建图片上传路由**：`POST /api/upload`，接收图片后自动压缩转码为 `.webp`
   - [x] **前端上传组件**：在管理端编辑表单中添加图片上传

   ### 第六点五步 — 日志系统

   - [x] **配置 Fastify 文件日志**：使用 Pino 多流输出，同时写入终端和日志文件
   - [x] **日志目录**：创建 `server/logs/`，按日期分割日志文件
   - [x] **Gitignore**：添加 `server/logs/` 到 `.gitignore`

    ### 第七步 — Docker 部署上线 & 阿里云部署

    **已完成的基础设施 ✅**
    - [x] **创建 docker-compose.yml**：定义 frontend/backend/mongodb 三个服务
    - [x] **创建 client/Dockerfile**：构建 React 静态文件，用 Nginx 托管（已改为官方镜像）
    - [x] **创建 server/Dockerfile**：构建 TypeScript，运行 Node.js（已改为官方镜像）
    - [x] **环境变量分离**：创建 .env.production，配置 MONGODB_URI 等
    - [x] **Nginx 配置**：反向代理 /api 到 backend 服务，其余托管静态文件
    - [x] **安全加固**：移除 MongoDB 端口对外暴露（仅 Docker 网络内部访问）
    - [x] **管理员系统重构**：从环境变量改为数据库角色系统（首个注册用户自动成为 admin）
    - [x] **首页引言显示修复**：Home.jsx 中 glass-quote-box 渲染逻辑优化
    - [x] **Docker 镜像源修复**：全部切换为官方镜像（node:20-alpine, nginx:alpine, mongo:7）

    **阿里云部署待办任务 🚀**
    - [ ] **服务器安全配置**：SSH 密钥登录 + 禁用密码登录 + UFW 防火墙（仅开放 22,80,443）
    - [ ] **Docker 环境安装**：在 Ubuntu 上安装 Docker 和 Docker Compose
    - [ ] **部署脚本创建**：编写 `deploy.sh` 一键部署脚本
    - [ ] **环境变量设置**：在服务器创建 `.env.production` 并设置强密码 JWT_SECRET
    - [ ] **数据库备份脚本**：创建 `backup-mongo.sh` 定期备份到 `/backups/`
    - [ ] **健康检查脚本**：创建 `health-check.sh` 监控服务状态并发送告警
    - [ ] **初次部署测试**：`git clone` + `docker-compose up -d` 验证服务运行
    - [ ] **HTTPS/SSL 配置**：使用 Certbot (Let's Encrypt) 或阿里云 SSL 证书服务
    - [ ] **域名配置**：购买域名后配置 DNS A 记录指向服务器 IP
    - [ ] **监控告警设置**：配置基础资源监控（CPU/内存/磁盘）和 HTTP 健康检查

    **安全隔离状态检查**
    - [x] MongoDB (27017)：✅ 仅 Docker 网络内部访问，不暴露到公网
    - [x] 后端 API (3000)：✅ 仅通过 Nginx `/api` 代理访问，不直接暴露
    - [x] 前端 (80/443)：✅ 公网可访问，配置安全响应头 (CSP, XSS 防护)
    - [x] JWT_SECRET：✅ 已添加生成指引，需在生产服务器上生成强随机密钥

    ### 第八步 — 部署脚本与服务器配置

    **脚本状态** ✅ 已创建全部脚本于 `scripts/` 目录
    - [x] **服务器初始化脚本**：`setup-server.sh` - 以 root 运行，配置 Ubuntu 服务器
    - [x] **部署脚本**：`deploy.sh` - 一键部署，包含环境检查和健康验证
    - [x] **备份脚本**：`backup-mongo.sh` - 每日自动备份，保留 7 天
    - [x] **健康检查脚本**：`health-check.sh` - 每小时监控，异常告警
    - [x] **清理脚本**：`cleanup-logs.sh` - 每周清理日志和临时文件
    - [x] **文档**：`README.md` - 完整部署指南和故障排除

    **服务器初始化待执行**（在阿里云服务器上运行）
    - [ ] **创建非 root 用户**：`deploy` 用户，配置 sudo 权限
    - [ ] **SSH 安全加固**：禁用 root SSH，仅允许密钥登录，更改 SSH 端口（可选）
    - [ ] **防火墙配置**：UFW 允许 22 (SSH), 80 (HTTP), 443 (HTTPS)，拒绝其他所有端口
    - [ ] **Docker 安装**：官方 Docker 仓库 + Docker Compose v2
    - [ ] **时区与时间同步**：配置 Asia/Shanghai 时区，启用 NTP
    - [ ] **基础监控工具**：安装 htop, nload, ncdu, fail2ban (防暴力破解)

    **首次部署待执行**
    - [ ] **上传代码到服务器**：通过 SCP 或 Git 克隆到 `/home/deploy/website`
    - [ ] **设置环境变量**：创建 `.env.production` 并生成强 JWT_SECRET
    - [ ] **运行部署脚本**：`./scripts/deploy.sh` 构建并启动服务
    - [ ] **验证部署**：访问 `http://服务器IP` 确认网站运行正常

    **HTTPS/SSL 配置选项**（域名就绪后）
    - [ ] **选项 A：Certbot (Let's Encrypt)**：使用 certbot 获取免费证书，配置 Nginx 自动续期
    - [ ] **选项 B：阿里云 SSL 证书**：上传证书文件到服务器，配置 Nginx SSL 虚拟主机
    - [ ] **选项 C：Docker 内 Certbot**：使用 `nginx-proxy` + `acme-companion` 容器自动管理

    **监控与告警配置**
    - [ ] **基础资源监控**：CPU、内存、磁盘使用率阈值告警
    - [ ] **HTTP 可用性监控**：每分钟检查网站首页和 `/api/health` 端点
    - [ ] **日志监控**：关键错误日志实时告警（可选集成阿里云日志服务）
    - [ ] **备份验证**：定期验证备份文件完整性和可恢复性
    - [ ] **配置自动化任务**：设置 cron 定时执行备份、健康检查、清理

    ### 第十步 — 用户注册 + 登录 + 评论系统

   - [x] **User 模型**：`server/src/models/User.ts`（username, email, password, avatar, role）
   - [x] **Comment 模型**：`server/src/models/Comment.ts`（articleId, userId, content）
   - [x] **用户路由**：`POST /api/register`、`POST /api/user-login`、`GET /api/profile`、`PUT /api/profile`
   - [x] **评论路由**：`GET /api/comments/:articleId`、`POST /api/comments`、`DELETE /api/comments/:id`
   - [x] **authMiddleware 更新**：JWT payload 支持 userId + role，新增 optionalAuthMiddleware
   - [x] **前端注册页**：`client/src/pages/Register.jsx`
   - [x] **前端用户登录页**：`client/src/pages/UserLogin.jsx`
   - [x] **评论区组件**：`client/src/components/CommentSection.jsx`（含用户头像显示）
   - [x] **NavBar 用户状态**：已登录显示头像+用户名+下拉菜单（上传头像/退出）
   - [x] **用户头像上传**：NavBar 下拉菜单上传头像，保存到用户资料
   - [x] **ArticleDetail 集成**：文章底部嵌入评论区
   - [x] **CSS 样式**：`client/src/styles/components/comments.css`
   - [x] **Server 测试**：`users.test.ts`（9 cases）、`comments.test.ts`（9 cases）
   - [x] **Client 测试**：`CommentSection.test.jsx`（4 cases）

    ### 第十一步 — 音乐播放器增强

   - [x] **Music 模型**：`server/src/models/Music.ts`（title, artist, src, cover, order）
   - [x] **音乐 CRUD 路由**：`GET/POST/PUT/DELETE /api/music`
   - [x] **FLAC 文件上传**：扩展 upload.ts 支持音频格式
   - [x] **播放器重写**：进度条+封面图+旋转碟片动画+播放模式+音量控制+播放列表
   - [x] **播放列表**：可滚动列表+双击选择+播放中声波动画
   - [x] **播放模式**：单曲循环/顺序播放/随机播放
   - [x] **Admin 音乐管理**：新增"音乐"Tab（FLAC上传+封面上传+列表管理）
   - [x] **Server 测试**：`music.test.ts`（9 cases）
   - [x] **Client 测试**：`MusicPlayer.test.jsx`（5 cases）

    ### 第十二步 — 壁纸轮播管理

   - [x] **Wallpaper 模型**：`server/src/models/Wallpaper.ts`（src, theme, order, active）
   - [x] **壁纸 CRUD 路由**：`GET/POST/PUT/DELETE /api/wallpapers`
   - [x] **壁纸专用上传**：`POST /api/upload/wallpaper`（保留原画质，不压缩不转格式）
   - [x] **WallpaperCarousel 组件**：滚动隐藏+sessionStorage 队列切换
   - [x] **Admin 壁纸管理**：新增"壁纸"Tab（上传+主题选择+启用/禁用+排序）
   - [x] **Server 测试**：`wallpapers.test.ts`（7 cases）

    ### 第十三步 — 无障碍 + 完善细节

   - [x] **404 页面**：`client/src/pages/NotFound.jsx`
   - [x] **ErrorBoundary**：`client/src/components/ErrorBoundary.jsx`
   - [x] **无障碍修复**：div→button + aria-label + dialog 语义
   - [x] **导航栏背景**：胶囊添加半透明背景，解决壁纸透过去看不清
   - [x] **文章贡献热力图**：Category 页左侧 GitHub 风格热力图
   - [x] **Footer 图片**：添加 commend 小图片
   - [x] **测试基础设施**：Client vitest + @testing-library/react（17 cases）
   - [x] **AGENTS.md 更新**：反映最新代码规范和测试命令

   ---

   ## 附录：数据库设计 Schema 参考 (MongoDB)

   **Article (文章)**
   ```javascript
   {
     _id: ObjectId,
     title: String,
     slug: String,           // URL友好标识
     content: String,        // 存放原始 Markdown 字符串 🆕
     excerpt: String,        // 摘要
     cover: String,          // 封面图 (存 WebP URL) 🆕
     tags: [String],         // 标签
     category: String,       // 分类
     published: Boolean,
     createdAt: Date,
      updatedAt: Date
    }
   ```

   **User (用户)**
   ```javascript
   {
     _id: ObjectId,
     username: String,       // unique, 2-20 字符
     email: String,          // unique
     password: String,       // bcrypt hashed
     avatar: String?,        // 可选头像 URL
     role: String,           // 'user' | 'admin'
     createdAt: Date
   }
   ```

   **Comment (评论)**
   ```javascript
   {
     _id: ObjectId,
     articleId: ObjectId,    // ref Article
     userId: ObjectId,       // ref User
     content: String,        // max 1000 字符
     createdAt: Date
   }
   ```

   **Music (音乐)**
   ```javascript
   {
     _id: ObjectId,
     title: String,          // 歌曲标题
     artist: String,         // 艺术家
     src: String,            // FLAC 文件路径
     cover: String?,         // 可选封面图
     order: Number,          // 排序
     createdAt: Date
   }
   ```

   **Wallpaper (壁纸)**
   ```javascript
   {
     _id: ObjectId,
     src: String,            // 图片路径
     theme: String,          // 'light' | 'dark' | 'both'
     order: Number,          // 排序
     active: Boolean,        // 是否启用
     createdAt: Date
   }
   ```
