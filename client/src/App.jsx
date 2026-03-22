/**
 * @file App.jsx
 * @brief 日系轻小说风个人网站主入口组件
 * @details 结合了大留白设计、天空蓝点缀，加入了底层模糊背景图片与半透明纸张遮罩。
 * @author MBri
 * @date 2026-03-17
 */

import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import NavBar from './components/NavBar';
import SearchModal from './components/SearchModal';
import ScrollProgress from './components/ScrollProgress';
import MusicPlayer from './components/MusicPlayer';
import BackToTop from './components/BackToTop';
import Footer from './components/Footer';
import Home from './pages/Home';
import Category from './pages/Category';
import About from './pages/About';
import Links from './pages/Links';
import Chip from './pages/Chip';
import ArticleDetail from './pages/ArticleDetail';
import Login from './pages/Login';
import Admin from './pages/Admin';
import useStore from './store/useStore';

function App() {
  const isSearchOpen = useStore((state) => state.isSearchOpen);
  const openSearch = useStore((state) => state.openSearch);
  const closeSearch = useStore((state) => state.closeSearch);
  const theme = useStore((state) => state.theme);
  const location = useLocation();
  const isHome = location.pathname === '/';

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const setIsSearchOpen = (value) => {
    if (value) {
      openSearch();
    } else {
      closeSearch();
    }
  };

  const bgClass = isHome ? '' : 'bg-hidden';

  return (
    <>
      <div className={`bg-image-layer ${bgClass}`}></div>
      <div className={`bg-overlay-layer ${bgClass}`}></div>

      <SearchModal isSearchOpen={isSearchOpen} setIsSearchOpen={setIsSearchOpen} />
      <ScrollProgress />
      <MusicPlayer />
      <BackToTop />
      <NavBar setIsSearchOpen={setIsSearchOpen} />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/category" element={<Category />} />
        <Route path="/article/:slug" element={<ArticleDetail />} />
        <Route path="/links" element={<Links />} />
        <Route path="/about" element={<About />} />
        <Route path="/chip" element={<Chip />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>

      <Footer />
    </>
  );
}

export default App;
