/**
 * @file src/components/NavBar.jsx
 * @brief 实现滚动物理收缩动画的导航栏
 */
import { useState } from 'react';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { Link, NavLink } from 'react-router-dom';
import useStore from '../store/useStore';
import { HomeIcon, CategoryIcon, LinksIcon, ChipIcon, AboutIcon, SearchIcon, SunIcon, MoonIcon } from '../Icons';

export default function NavBar({ setIsSearchOpen }) {
  const theme = useStore((s) => s.theme);
  const toggleTheme = useStore((s) => s.toggleTheme);
  const { scrollY } = useScroll();
  
  // 1. 定义一个状态来记录"是否已滚动"
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
              objectFit: 'cover',
              border: '1px solid rgba(255,255,255,0.8)'
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
        <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
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
        <NavLink to="/category" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
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
        <NavLink to="/chip" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
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
        <NavLink to="/links" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
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
        <NavLink to="/about" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
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
        <motion.span layout onClick={() => setIsSearchOpen(true)} style={{ cursor: 'pointer', display: 'flex' }}>
          <SearchIcon />
        </motion.span>
      </motion.div>

      {/* ================= 右侧 主题切换按钮 ================= */}
      <motion.div 
        layout 
        className="circle-btn"
        onClick={toggleTheme}
        whileHover={{ scale: 1.05 }}
        style={{ cursor: 'pointer' }}
      >
        {theme === 'light' ? <MoonIcon /> : <SunIcon />}
      </motion.div>
    </motion.header>
  );
}
