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
   - [ ] **（可选）代码高亮**：引入 `react-syntax-highlighter` 实现代码语法高亮 ✅ 已完成

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

   - [ ] **安装 sharp**：在 `server/` 目录下 `npm install sharp`
   - [ ] **创建图片上传路由**：`POST /api/upload`，接收图片后自动压缩转码为 `.webp`
   - [ ] **前端上传组件**：在管理端编辑表单中添加图片上传

   ### 第六点五步 — 日志系统

   - [ ] **配置 Fastify 文件日志**：使用 Pino 多流输出，同时写入终端和日志文件
   - [ ] **日志目录**：创建 `server/logs/`，按日期分割日志文件
   - [ ] **Gitignore**：添加 `server/logs/` 到 `.gitignore`

   ### 第七步 — Docker 部署上线

   - [ ] **创建 docker-compose.yml**：定义 frontend/backend/mongodb 三个服务
   - [ ] **创建 client/Dockerfile**：构建 React 静态文件，用 Nginx 托管
   - [ ] **创建 server/Dockerfile**：构建 TypeScript，运行 Node.js
   - [ ] **环境变量分离**：创建 .env.production，配置 MONGODB_URI 等
   - [ ] **Nginx 配置**：反向代理 /api 到 backend 服务，其余托管静态文件
   - [ ] **HTTPS 配置**：使用 Let's Encrypt 或 Nginx + Certbot
   - [ ] **服务器部署**：git clone + docker-compose up -d
   - [ ] **(可选) 购买域名**：绑定到服务器 IP，配置 DNS

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
