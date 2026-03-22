import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { NavLink } from 'react-router-dom';
import { HomeIcon, CategoryIcon, LinksIcon, AboutIcon, ChipIcon, SearchIcon, SunIcon, MoonIcon } from '../Icons';
import useStore from '../store/useStore';

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
  const [isHidden, setIsHidden] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollDelta = currentScrollY - lastScrollY.current;
      
      // 只有滚动超过10px才触发隐藏/显示
      if (Math.abs(scrollDelta) > 10) {
        if (scrollDelta > 0 && currentScrollY > 100) {
          // 向下滚动超过100px时隐藏
          setIsHidden(true);
        } else if (scrollDelta < 0) {
          // 向上滚动时显示
          setIsHidden(false);
        }
        lastScrollY.current = currentScrollY;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.header 
      className={`glass-nav-container ${isHidden ? 'nav-hidden' : ''}`}
      variants={itemVariants} 
      initial="hidden" 
      animate="visible"
    >
      <NavLink to="/" className="glass-pill" style={{ textDecoration: 'none', color: 'inherit' }}>
        <img
          src="/avatar.jpg"
          alt="avatar"
          style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.8)' }}
        />
      </NavLink>

      <div className="glass-pill">
        {navItems.map(({ to, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
          >
            <motion.span whileHover={{ y: -2 }}>
              {icon}
            </motion.span>
          </NavLink>
        ))}
      </div>

      <div className="glass-pill">
        <motion.span
          whileHover={{ scale: 1.05, color: 'var(--accent-blue)' }}
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          onClick={() => setIsSearchOpen(true)}
        >
          <SearchIcon />
        </motion.span>
        <motion.span
          whileHover={{ scale: 1.05, color: 'var(--accent-blue)' }}
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          onClick={toggleTheme}
        >
          {theme === 'light' ? <MoonIcon /> : <SunIcon />}
        </motion.span>
      </div>
    </motion.header>
  );
};

export default NavBar;
