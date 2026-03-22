```jsx
/**
 * @file src/components/NavBar.jsx
 * @brief 实现滚动收缩动画的导航栏
 */
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link, NavLink } from 'react-router-dom';
import useStore from '../store/useStore';
import { HomeIcon, CategoryIcon, LinksIcon, ChipIcon, AboutIcon, SearchIcon } from './Icons';
import '../App.css'; // 确保引入了样式

export default function NavBar() {
  const openSearch = useStore((state) => state.openSearch);

  // 1. 监测滚动的 Y 轴距离 (scrollY 是一个 MotionValue)
  const { scrollY } = useScroll();

  /**
   * 2. 定义映射 (Mapping)
   * 我们定义：在滚动距离从 0px 到 200px 的过程中，
   * 导航栏的各种属性要发生什么变化。
   */
  
  // 整体导航栏的顶部间距 (top): 从 20px 变成 10px
  const navTop = useTransform(scrollY, [0, 200], [20, 10]);

  // 胶囊的背景色透明度: 从 0.95 (实心) 变成 0.1 (几近透明)
  const pillOpacity = useTransform(scrollY, [0, 200], [0.95, 0.1]);

  // 胶囊的内边距 (padding): 从 '8px 24px' 变成 '6px 12px' (变瘦)
  const pillPadding = useTransform(scrollY, [0, 200], "8px 24px", "6px 12px");

  // 【核心】胶囊内部元素的间距 (gap): 从 18px 变成 2px (挤压在一起)
  // 这就是实现“图标和文字收缩”的关键
  const pillGap = useTransform(scrollY, [0, 200], [18, 2]);

  // 文字的透明度: 滚动时让文字变淡，突出图标
  const textOpacity = useTransform(scrollY, [100, 200], [1, 0.2]);

  // 头像的大小: 从 32px 变成 24px
  const avatarSize = useTransform(scrollY, [0, 200], [32, 24]);


  return (
    // 将映射后的 MotionValue 绑定到 style 属性上
    <motion.header 
      className="glass-nav-container"
      style={{ top: navTop }} // 绑定顶部间距
    >
      {/* 左侧：Logo 胶囊 (应用收缩动画) */}
      <Link to="/" className="nav-link">
        <motion.div 
          className="glass-pill logo-pill"
          style={{ 
            backgroundColor: `rgba(250, 250, 248, ${pillOpacity.get()})`, // 动态透明度
            backdropFilter: scrollY.get() > 100 ? "blur(4px)" : "blur(8px)", // 动态模糊
            padding: pillPadding,
            gap: pillGap // 核心：间距收缩
          }}
        >
          <motion.img 
            src="/avatar.jpg" 
            alt="avatar" 
            style={{ 
              width: avatarSize, // 动态大小
              height: avatarSize, 
              borderRadius: '50%', 
              objectFit: 'cover' 
            }} 
          />
          {/* 文字随滚动变淡 */}
          <motion.span style={{ fontWeight: 600, opacity: textOpacity }}>
            MBri の 小窝
          </motion.span>
        </motion.div>
      </Link>

      {/* 中间：一体化大胶囊 (同样应用收缩动画) */}
      <motion.div 
        className="glass-pill"
        style={{ 
          backgroundColor: `rgba(250, 250, 248, ${pillOpacity.get()})`,
          padding: pillPadding,
          gap: pillGap // 核心：间距收缩
        }}
      >
        <NavLink to="/" className="nav-link">
          <motion.span style={{ gap: pillGap }}>
            <HomeIcon /> 
            <motion.b style={{ opacity: textOpacity, fontWeight: 500 }}>首页</motion.b>
          </motion.span>
        </NavLink>
        <NavLink to="/category" className="nav-link">
          <motion.span style={{ gap: pillGap }}>
            <CategoryIcon /> 
            <motion.b style={{ opacity: textOpacity, fontWeight: 500 }}>分类</motion.b>
          </motion.span>
        </NavLink>
        <NavLink to="/chip" className="nav-link">
          <motion.span style={{ gap: pillGap }}>
            <ChipIcon /> 
            <motion.b style={{ opacity: textOpacity, fontWeight: 500 }}>奇妙小玩具</motion.b>
          </motion.span>
        </NavLink>
        {/* ... 其他导航项 ... */}

        {/* 竖线分割 (滚动时也收缩) */}
        <motion.div 
          className="nav-divider"
          style={{ height: useTransform(scrollY, [0, 200], [16, 12]) }}
        ></motion.div>

        {/* 搜索按钮 */}
        <span onClick={openSearch} style={{ cursor: 'pointer' }}>
          <SearchIcon />
        </span>
      </motion.div>

      {/* 右侧：独立的圆形按钮 (不受收缩影响，保持原样) */}
      <div className="circle-btn">
        <span style={{ fontSize: '1.2rem' }}>🌓</span>
      </div>
    </motion.header>
  );
}
```

```css
/* src/App.css */

/* ... (保留你的布局和颜色变量) ... */

.glass-nav-container {
  position: fixed;
  /* top 值现在由 React 动画控制 */
  left: 0;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  z-index: 50;
  /* 取消 CSS 自带的 transition，因为 Framer Motion 接管了数值变化 */
}

.glass-pill {
  /* 背景色现在由 React 动画控制 rgba */
  border-radius: 50px;
  /* padding 和 gap 现在由 React 动画控制 */
  display: flex;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
  font-size: 0.9rem;
  color: var(--text-ink);
  height: 44px;
  box-sizing: border-box;
}

/* 导航项里的 span，默认间距设为动画初始值 */
.glass-pill span {
  display: flex;
  align-items: center;
  gap: 6px; /* 图标和文字的默认间距 */
  transition: color 0.3s ease;
}

.nav-link b {
  font-weight: normal; /* 取消加粗，利于文字变淡时的视觉清晰度 */
}
```

