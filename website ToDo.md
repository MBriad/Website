## 个人网站项目规划

### 技术栈

**前端 (React)**
- React 19 + Vite 6
- React Router 7 (SPA路由)
- Zustand 5 (状态管理)
- Framer Motion 12 (动画)

**后端 (Node.js)** - 待开发
- Express / Fastify
- MongoDB / PostgreSQL
- JWT (认证)

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

**数据文件**
- [x] articles.json - 文章数据
- [x] projects.json - 项目数据
- [x] siteConfig.json - 网站配置
- [x] links.json - 友链数据
- [x] playlist.json - 音乐播放列表

### 进行中 🔄
- [ ] 全局搜索功能完善

### 待开发 📋

**P0 - 高优先级**
- [ ] 响应式布局适配（移动端优化）
- [ ] SEO 元信息配置（meta tags）

**P1 - 中优先级**
- [ ] 全局搜索功能完善（文章 + 项目搜索）
- [ ] 文章详情页开发
- [ ] 项目详情页开发

**P2 - 低优先级**
- [ ] 后端 API 开发
- [ ] 数据库设计
- [ ] 管理员后台

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
- Railway / Render / VPS
- PM2 进程管理
- Nginx 反向代理

---

## 开发优先级

1. **P0** - 响应式布局适配
2. **P0** - SEO 元信息配置
3. **P1** - 全局搜索功能完善
4. **P1** - 文章详情页开发
5. **P2** - 后端 API 开发
6. **P2** - 数据库设计
7. **P3** - 管理员后台
8. **P3** - 部署配置
