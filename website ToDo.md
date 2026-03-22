## 个人网站项目规划

### 技术栈

**前端 (React)**
- React 19 + Vite 6
- React Router 7 (SPA路由)
- Zustand 5 (状态管理)
- Framer Motion 12 (动画)

**后端 (Node.js)**
- Express / Fastify
- MongoDB / PostgreSQL
- JWT (认证)

---

## 前端开发任务

### 已完成 ✅
- [x] 项目初始化 (Vite + React)
- [x] 路由配置 (App.jsx)
- [x] 导航栏组件 (NavBar.jsx)
- [x] 搜索弹窗组件 (SearchModal.jsx)
- [x] 首页框架 (Home.jsx)
- [x] Home.jsx 内容填充（打字机语录 + 滚动进度条 + 淡入动画）
- [x] Category.jsx - 文章分类/归档页（标签筛选 + 时间线视图）
- [x] About.jsx - 关于我页面（个人介绍 + 联系方式）
- [x] Links.jsx - 友链页面（卡片网格 + 申请入口）
- [x] Chip.jsx - 硬件项目展示（项目卡片 + 技术栈标签 + 精选标记）
- [x] Footer.jsx - 页脚组件
- [x] ScrollProgress.jsx - 滚动进度条
- [x] 数据文件（articles.json / projects.json / siteConfig.json / links.json）

### 已完成 ✅
- [x] Home.jsx 内容填充
  - [x] 个人介绍区域
  - [x] 最新文章展示
  - [x] 特色项目卡片

### 待开发 📋

**页面开发**
- [ ] Category.jsx - 文章分类/归档页
  - 标签筛选
  - 时间线视图
  - 文章列表卡片
- [ ] Links.jsx - 友链页面
  - 友链卡片网格
  - 申请入口
- [ ] Chip.jsx - 硬件项目展示
  - 项目卡片
  - 技术栈标签
  - 项目详情弹窗
- [ ] About.jsx - 关于我
  - 个人简历
  - 技能雷达图
  - 联系方式

**组件开发**
- [ ] Icons.jsx - 手绘SVG图标库
- [ ] ArticleCard.jsx - 文章卡片组件
- [ ] ProjectCard.jsx - 项目卡片组件
- [ ] Footer.jsx - 页脚组件
- [ ] BackToTop.jsx - 返回顶部按钮

**功能特性**
- [ ] 全局搜索功能 (SearchModal 完善)
  - 文章搜索
  - 项目搜索
- [ ] 暗色/亮色主题切换
- [ ] 页面切换过渡动画
- [ ] 响应式布局适配
- [ ] SEO 元信息配置

---

## 后端开发任务

### 数据库设计 (MongoDB)

**Article (文章)**
```javascript
{
  _id: ObjectId,
  title: String,
  slug: String,           // URL友好标识
  content: String,        // Markdown内容
  excerpt: String,        // 摘要
  cover: String,          // 封面图
  tags: [String],         // 标签
  category: String,       // 分类
  published: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

**Project (项目)**
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  cover: String,
  techStack: [String],    // 技术栈
  github: String,          // GitHub链接
  demo: String,            // 演示链接
  featured: Boolean,       // 是否精选
  createdAt: Date
}
```

**Link (友链)**
```javascript
{
  _id: ObjectId,
  name: String,
  url: String,
  avatar: String,
  description: String,
  createdAt: Date
}
```

**SiteConfig (网站配置)**
```javascript
{
  _id: ObjectId,
  avatar: String,
  nickname: String,
  bio: String,
  socialLinks: {
    github: String,
    email: String,
    twitter: String
  }
}
```

### API 接口设计

**文章**
- `GET /api/articles` - 获取文章列表 (支持分页、标签筛选)
- `GET /api/articles/:slug` - 获取单篇文章
- `GET /api/articles/featured` - 获取精选文章

**项目**
- `GET /api/projects` - 获取项目列表
- `GET /api/projects/:id` - 获取单个项目

**友链**
- `GET /api/links` - 获取友链列表

**配置**
- `GET /api/config` - 获取网站配置

### 待开发
- [ ] 后端项目初始化
- [ ] 数据库连接配置
- [ ] RESTful API 开发
- [ ] 数据迁移/填充脚本
- [ ] 管理员后台

---

## 部署方案

**前端**
- Vercel / Netlify (静态部署)
- 域名绑定
- SSL证书

**后端**
- Railway / Render / 自己的VPS
- PM2 进程管理
- Nginx 反向代理

---

## 开发优先级

1. **P0** - 首页内容完善
2. **P0** - 文章分类页面
3. **P1** - 关于页面
4. **P1** - 友链页面
5. **P2** - 硬件项目页面
6. **P2** - 后端API搭建
7. **P3** - 管理后台
