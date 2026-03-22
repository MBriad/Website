```jsx
/**
 * @file src/components/NavBar.jsx
 * @brief 实现滚动物理收缩动画的导航栏
 */
import { useState } from 'react';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { Link, NavLink } from 'react-router-dom';
import useStore from '../store/useStore';
import { HomeIcon, CategoryIcon, LinksIcon, ChipIcon, AboutIcon, SearchIcon } from './Icons';
import '../App.css'; 

export default function NavBar() {
  const openSearch = useStore((state) => state.openSearch);
  const { scrollY } = useScroll();
  
  // 1. 定义一个状态来记录“是否已滚动”
  const [isScrolled, setIsScrolled] = useState(false);

  // 2. 监听滚动位置，一旦超过 50px，就触发收缩状态
  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > 50) {
      setIsScrolled(true);
    } else {
      setIsScrolled(false);
    }
  });

  // 3. 定义文字的收缩动画 Variants
  // 当 isScrolled 为 true 时，宽度变为 0，同时完全透明
  const textVariants = {
    expanded: { width: "auto", opacity: 1, marginLeft: 8 },
    collapsed: { width: 0, opacity: 0, marginLeft: 0 }
  };

  return (
    <motion.header 
      className="glass-nav-container"
      initial={{ y: -100 }}
      animate={{ y: 0, top: isScrolled ? 10 : 20 }} // 滚动时稍微贴顶
      transition={{ duration: 0.5 }}
    >
      {/* ================= 左侧 Logo 胶囊 ================= */}
      <Link to="/" className="nav-link">
        {/* layout 属性能让胶囊在尺寸变化时极其丝滑 */}
        <motion.div 
          layout 
          className="glass-pill logo-pill"
          style={{ padding: isScrolled ? "6px 14px" : "8px 24px" }}
        >
          <motion.img 
            layout
            src="/avatar.jpg" 
            alt="avatar" 
            style={{ 
              width: isScrolled ? '24px' : '32px', 
              height: isScrolled ? '24px' : '32px', 
              borderRadius: '50%', 
              objectFit: 'cover' 
            }} 
          />
          {/* 控制文字的宽度坍缩 */}
          <motion.span 
            variants={textVariants}
            initial="expanded"
            animate={isScrolled ? "collapsed" : "expanded"}
            style={{ fontWeight: 600, overflow: "hidden", whiteSpace: "nowrap" }}
          >
            MBri の 小窝
          </motion.span>
        </motion.div>
      </Link>

      {/* ================= 中间 大胶囊 ================= */}
      <motion.div 
        layout
        className="glass-pill"
        style={{ padding: isScrolled ? "6px 14px" : "8px 24px", gap: isScrolled ? 12 : 18 }}
      >
        {/* 导航项 1: 首页 */}
        <NavLink to="/" className="nav-link">
          <motion.span layout style={{ display: 'flex', alignItems: 'center' }}>
            <HomeIcon /> 
            <motion.b 
              variants={textVariants} 
              initial="expanded" 
              animate={isScrolled ? "collapsed" : "expanded"}
              style={{ fontWeight: 500, overflow: "hidden", whiteSpace: "nowrap" }}
            >
              首页
            </motion.b>
          </motion.span>
        </NavLink>

        {/* 导航项 2: 分类 */}
        <NavLink to="/category" className="nav-link">
          <motion.span layout style={{ display: 'flex', alignItems: 'center' }}>
            <CategoryIcon /> 
            <motion.b 
              variants={textVariants} 
              initial="expanded" 
              animate={isScrolled ? "collapsed" : "expanded"}
              style={{ fontWeight: 500, overflow: "hidden", whiteSpace: "nowrap" }}
            >
              分类
            </motion.b>
          </motion.span>
        </NavLink>

        {/* 导航项 3: 奇妙小玩具 (芯片) */}
        <NavLink to="/chip" className="nav-link">
          <motion.span layout style={{ display: 'flex', alignItems: 'center' }}>
            <ChipIcon /> 
            <motion.b 
              variants={textVariants} 
              initial="expanded" 
              animate={isScrolled ? "collapsed" : "expanded"}
              style={{ fontWeight: 500, overflow: "hidden", whiteSpace: "nowrap" }}
            >
              奇妙小玩具
            </motion.b>
          </motion.span>
        </NavLink>

        {/* 导航项 4: 友链 */}
        <NavLink to="/links" className="nav-link">
          <motion.span layout style={{ display: 'flex', alignItems: 'center' }}>
            <LinksIcon /> 
            <motion.b 
              variants={textVariants} 
              initial="expanded" 
              animate={isScrolled ? "collapsed" : "expanded"}
              style={{ fontWeight: 500, overflow: "hidden", whiteSpace: "nowrap" }}
            >
              友人帐
            </motion.b>
          </motion.span>
        </NavLink>

        {/* 导航项 5: 关于我 */}
        <NavLink to="/about" className="nav-link">
          <motion.span layout style={{ display: 'flex', alignItems: 'center' }}>
            <AboutIcon /> 
            <motion.b 
              variants={textVariants} 
              initial="expanded" 
              animate={isScrolled ? "collapsed" : "expanded"}
              style={{ fontWeight: 500, overflow: "hidden", whiteSpace: "nowrap" }}
            >
              关于我
            </motion.b>
          </motion.span>
        </NavLink>

        {/* 竖线分割 */}
        <motion.div 
          layout
          className="nav-divider"
          animate={{ height: isScrolled ? 12 : 16 }}
        ></motion.div>

        {/* 搜索按钮 */}
        <motion.span layout onClick={openSearch} style={{ cursor: 'pointer', display: 'flex' }}>
          <SearchIcon />
        </motion.span>
      </motion.div>

      {/* ================= 右侧 主题切换按钮 ================= */}
      <motion.div layout className="circle-btn">
        <span style={{ fontSize: '1.2rem' }}>🌓</span>
      </motion.div>
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

