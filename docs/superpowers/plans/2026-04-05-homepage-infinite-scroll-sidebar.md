# 首页文章无限滚动 + 侧边栏布局实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**目标:** 实现首页文章下拉加载更多，并将特色项目移至右侧侧边栏

**架构:**
- 使用 IntersectionObserver 监听文章列表底部，实现无限滚动
- 桌面端 (>1024px) 采用左右双栏布局：左侧文章列表 (70%)，右侧侧边栏固定显示特色项目 (30%)
- 移动端保持单栏堆叠，特色项目显示在文章列表上方

**技术栈:** React (useState, useEffect, useCallback, useRef), IntersectionObserver API, CSS Flexbox/Grid

---

## 文件结构

### 修改文件
- `client/src/pages/Home.jsx` - 添加无限滚动逻辑和侧边栏布局
- `client/src/styles/components/home.css` - 添加侧边栏布局样式

---

## 任务清单

### 任务 1: 修改 Home.jsx - 添加无限滚动状态和逻辑

**文件:** Modify: `client/src/pages/Home.jsx`

- [ ] **步骤 1: 添加分页状态变量**

- [ ] **步骤 2: 修改数据获取逻辑**

- [ ] **步骤 3: 添加 IntersectionObserver**

- [ ] **步骤 4: 修改渲染部分 - 添加加载更多触发器和指示器**

- [ ] **步骤 5: 重构布局 - 添加侧边栏**

- [ ] **步骤 6: 验证构建**

---

### 任务 2: 修改 home.css - 添加侧边栏布局样式

**文件:** Modify: `client/src/styles/components/home.css`

- [ ] **步骤 1: 修改桌面端 content-section 布局**

- [ ] **步骤 2: 调整平板端布局**

- [ ] **步骤 3: 修改移动端 - 特色项目在文章上方**

- [ ] **步骤 4: 验证构建**

---

### 任务 3: 测试验证

- [ ] **步骤 1: 启动开发服务器**

- [ ] **步骤 2: 验证无限滚动**

- [ ] **步骤 3: 验证侧边栏布局**

- [ ] **步骤 4: 运行 lint**

---

### 任务 4: 提交

- [ ] **步骤 1: 提交更改**
