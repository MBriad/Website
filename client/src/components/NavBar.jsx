/**
 * @file src/components/NavBar.jsx
 * @brief 实现滚动收缩动画的导航栏
 */
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link, NavLink } from 'react-router-dom';
import useStore from '../store/useStore';
import { HomeIcon, CategoryIcon, LinksIcon, ChipIcon, AboutIcon, SearchIcon, SunIcon, MoonIcon } from '../Icons';

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: "easeOut" }
  },
};

const navItems = [
  { to: '/', icon: <HomeIcon />, label: '首页' },
  { to: '/category', icon: <CategoryIcon />, label: '分类' },
  { to: '/links', icon: <LinksIcon />, label: '友链' },
  { to: '/chip', icon: <ChipIcon />, label: '芯片' },
  { to: '/about', icon: <AboutIcon />, label: '关于我' },
];

const NavBar = ({ setIsSearchOpen }) => {
  const theme = useStore((s) => s.theme);
  const toggleTheme = useStore((s) => s.toggleTheme);

  // 1. 监测滚动的 Y 轴距离
  const { scrollY } = useScroll();

  // 2. 定义映射 (Mapping)
  // 在滚动距离从 0px 到 200px 的过程中，导航栏的各种属性要发生什么变化
  
  // 整体导航栏的顶部间距 (top): 从 20px 变成 10px
  const navTop = useTransform(scrollY, [0, 200], [20, 10]);

  // 胶囊的背景色透明度: 从 0.95 (实心) 变成 0.1 (几近透明)
  const pillOpacity = useTransform(scrollY, [0, 200], [0.95, 0.1]);

  // 胶囊的内边距 (padding): 从 '8px 24px' 变成 '6px 12px' (变瘦)
  const pillPadding = useTransform(scrollY, [0, 200], ["8px 24px", "6px 12px"]);

  // 【核心】胶囊内部元素的间距 (gap): 从 18px 变成 2px (挤压在一起)
  const pillGap = useTransform(scrollY, [0, 200], [18, 2]);

  // 文字的透明度: 滚动时让文字变淡，突出图标
  const textOpacity = useTransform(scrollY, [100, 200], [1, 0.2]);

  // 头像的大小: 从 32px 变成 24px
  const avatarSize = useTransform(scrollY, [0, 200], [32, 24]);

  // 竖线分割的高度: 从 16px 变成 12px
  const dividerHeight = useTransform(scrollY, [0, 200], [16, 12]);

  return (
    // 将映射后的 MotionValue 绑定到 style 属性上
    <motion.header 
      className="glass-nav-container"
      style={{ top: navTop }}
      variants={itemVariants}
      initial="hidden"
      animate="visible"
    >
      {/* 左侧：Logo 胶囊 (应用收缩动画) */}
      <Link to="/" className="nav-link">
        <motion.div 
          className="glass-pill logo-pill"
          style={{ 
            backgroundColor: useTransform(pillOpacity, (v) => `rgba(250, 250, 248, ${v})`),
            backdropFilter: useTransform(scrollY, (v) => v > 100 ? "blur(4px)" : "blur(8px)"),
            padding: pillPadding,
            gap: pillGap
          }}
        >
          <motion.img 
            src="/avatar.jpg" 
            alt="avatar" 
            style={{ 
              width: avatarSize,
              height: avatarSize, 
              borderRadius: '50%', 
              objectFit: 'cover',
              border: '1px solid rgba(255,255,255,0.8)'
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
          backgroundColor: useTransform(pillOpacity, (v) => `rgba(250, 250, 248, ${v})`),
          padding: pillPadding,
          gap: pillGap
        }}
      >
        {navItems.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
          >
            <motion.span style={{ gap: pillGap }}>
              {icon} 
              <motion.b style={{ opacity: textOpacity, fontWeight: 500 }}>{label}</motion.b>
            </motion.span>
          </NavLink>
        ))}

        {/* 竖线分割 (滚动时也收缩) */}
        <motion.div 
          className="nav-divider"
          style={{ height: dividerHeight }}
        ></motion.div>

        {/* 搜索按钮 */}
        <motion.span
          whileHover={{ scale: 1.05, color: 'var(--accent-blue)' }}
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          onClick={() => setIsSearchOpen(true)}
        >
          <SearchIcon />
        </motion.span>

        {/* 主题切换按钮 */}
        <motion.span
          whileHover={{ scale: 1.05, color: 'var(--accent-blue)' }}
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          onClick={toggleTheme}
        >
          {theme === 'light' ? <MoonIcon /> : <SunIcon />}
        </motion.span>
      </motion.div>
    </motion.header>
  );
};

export default NavBar;
