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
