/**
 * @file src/components/NavBar.jsx
 * @brief 实现滚动物理收缩动画的导航栏
 */
import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from 'framer-motion';
import { Link, NavLink, useLocation } from 'react-router-dom';
import useStore from '../store/useStore';
import { uploadAPI, userAPI } from '../api/index.js';
import { HomeIcon, CategoryIcon, LinksIcon, ChipIcon, AboutIcon, SearchIcon, SunIcon, MoonIcon } from '../Icons';

export default function NavBar({ setIsSearchOpen }) {
  const theme = useStore((s) => s.theme);
  const toggleTheme = useStore((s) => s.toggleTheme);
  const user = useStore((s) => s.user);
  const clearUser = useStore((s) => s.clearUser);
  const { scrollY } = useScroll();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const location = useLocation();
  
  // 1. 定义一个状态来记录"是否已滚动"
  const [isScrolled, setIsScrolled] = useState(false);
  // 2. 移动端菜单状态
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // 首次加载标记：只在初始加载时播放入场动画，页面切换时不动
  const hasMounted = useRef(false);
  useEffect(() => { hasMounted.current = true; }, []);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const res = await uploadAPI.uploadImage(file);
      const updated = await userAPI.updateProfile({ avatar: res.url });
      localStorage.setItem('user', JSON.stringify(updated));
      setUser(updated);
      setShowUserMenu(false);
    } catch (err) {
      console.error('头像上传失败:', err);
    }
  };

  // 3. 监听滚动位置，一旦超过 50px，就触发收缩状态
  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > 50) {
      setIsScrolled(true);
    } else {
      setIsScrolled(false);
    }
  });

  // 4. 路由变化时关闭菜单
  useEffect(() => {
    setIsMenuOpen(false);
    setShowUserMenu(false);
  }, [location.pathname]);

  // 点击外部关闭用户菜单
  const userMenuRef = useRef(null);
  useEffect(() => {
    const handleClick = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    if (showUserMenu) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showUserMenu]);

  // 5. 定义文字的收缩动画 Variants
  // 当 isScrolled 为 true 时，宽度变为 0，同时完全透明
  const textVariants = {
    expanded: { width: "auto", opacity: 1, marginLeft: 8 },
    collapsed: { width: 0, opacity: 0, marginLeft: 0 }
  };

  return (
    <>
      <motion.header 
        className="glass-nav-container"
        initial={hasMounted.current ? false : { y: -100 }}
        animate={{ y: 0, top: isScrolled ? 10 : 20 }}
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
          className="glass-pill nav-pill"
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
          <motion.button layout onClick={() => setIsSearchOpen(true)} aria-label="搜索" style={{ cursor: 'pointer', display: 'flex', background: 'none', border: 'none', padding: 0 }}>
            <SearchIcon />
          </motion.button>
        </motion.div>

        {/* ================= 汉堡菜单按钮 ================= */}
        <button
          className={`hamburger-menu ${isMenuOpen ? 'active' : ''}`}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="菜单"
          aria-expanded={isMenuOpen}
          style={{ background: 'none', border: 'none', padding: 0 }}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* ================= 右侧 主题切换按钮 ================= */}
        <motion.button
          layout
          className="circle-btn"
          onClick={toggleTheme}
          whileHover={{ scale: 1.05 }}
          aria-label={theme === 'light' ? '切换暗色模式' : '切换亮色模式'}
          style={{ cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}
        >
          {theme === 'light' ? <MoonIcon /> : <SunIcon />}
        </motion.button>

        {/* ================= 用户区域 ================= */}
        {user ? (
          <div className="nav-user-info" style={{ position: 'relative' }} ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', borderRadius: '20px' }}
              aria-label="用户菜单"
            >
              {user.avatar ? (
                <img src={user.avatar} alt="头像" style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(160,216,239,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-blue)' }}>
                  {user.username[0]}
                </span>
              )}
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{user.username}</span>
            </button>

            {showUserMenu && (
              <div className="nav-user-dropdown" style={{ position: 'absolute', top: '100%', right: 0, marginTop: '8px', background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)', border: '1px solid rgba(0,0,0,0.06)', borderRadius: '12px', padding: '8px', minWidth: '140px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', zIndex: 60 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', transition: 'background 0.15s' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(160,216,239,0.15)'} onMouseOut={e => e.currentTarget.style.background = 'none'}>
                  <input type="file" accept="image/*" onChange={handleAvatarUpload} style={{ display: 'none' }} />
                  上传头像
                </label>
                <button onClick={() => { clearUser(); setShowUserMenu(false); }} style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', borderRadius: '8px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.85rem', color: '#ff6b6b', transition: 'background 0.15s' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(255,107,107,0.1)'} onMouseOut={e => e.currentTarget.style.background = 'none'}>
                  退出登录
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="nav-user-links" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '8px' }}>
            <Link to="/user-login" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textDecoration: 'none' }}>登录</Link>
            <Link to="/register" style={{ fontSize: '0.85rem', color: 'var(--accent-blue, #a0d8ef)', textDecoration: 'none' }}>注册</Link>
          </div>
        )}
      </motion.header>

      {/* ================= 移动端导航菜单 ================= */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.nav
            className="mobile-menu open"
            aria-label="移动端导航"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <HomeIcon />
              <b>首页</b>
            </NavLink>
            <NavLink to="/category" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <CategoryIcon />
              <b>分类</b>
            </NavLink>
            <NavLink to="/chip" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <ChipIcon />
              <b>奇妙小玩具</b>
            </NavLink>
            <NavLink to="/links" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <LinksIcon />
              <b>友人帐</b>
            </NavLink>
            <NavLink to="/about" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <AboutIcon />
              <b>关于我</b>
            </NavLink>
            <button className="theme-toggle" onClick={toggleTheme} aria-label={theme === 'light' ? '切换暗色模式' : '切换亮色模式'} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              {theme === 'light' ? <MoonIcon /> : <SunIcon />}
              <b>{theme === 'light' ? '切换暗色模式' : '切换亮色模式'}</b>
            </button>
            {user ? (
              <>
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0', cursor: 'pointer' }}>
                  <input type="file" accept="image/*" onChange={handleAvatarUpload} style={{ display: 'none' }} />
                  {user.avatar ? (
                    <img src={user.avatar} alt="头像" style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(160,216,239,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-blue)' }}>
                      {user.username[0]}
                    </span>
                  )}
                  <b>上传头像</b>
                </label>
                <button onClick={clearUser} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px 0', color: '#ff6b6b' }}>
                  <b>退出登录 ({user.username})</b>
                </button>
              </>
            ) : (
              <>
                <NavLink to="/user-login" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                  <b>登录</b>
                </NavLink>
                <NavLink to="/register" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                  <b>注册</b>
                </NavLink>
              </>
            )}
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
}
