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
import PageBanner from './components/PageBanner';
import Home from './pages/Home';
import Category from './pages/Category';
import About from './pages/About';
import Links from './pages/Links';
import Chip from './pages/Chip';
import ArticleDetail from './pages/ArticleDetail';
import Login from './pages/Login';
import UserLogin from './pages/UserLogin';
import Admin from './pages/Admin';
import Register from './pages/Register';
import NotFound from './pages/NotFound';
import ErrorBoundary from './components/ErrorBoundary';
import WallpaperCarousel from './components/WallpaperCarousel';
import useStore from './store/useStore';
import { userAPI } from './api/index.js';

function App() {
  const isSearchOpen = useStore((state) => state.isSearchOpen);
  const openSearch = useStore((state) => state.openSearch);
  const closeSearch = useStore((state) => state.closeSearch);
  const theme = useStore((state) => state.theme);
  const location = useLocation();
  const isHome = location.pathname === '/';
  const noBannerPaths = ['/login', '/user-login', '/register', '/admin'];
  const showPageBanner = !isHome && !noBannerPaths.includes(location.pathname);

  const setUser = useStore((s) => s.setUser);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch { /* ignore */ }
    }
  }, []);

  const setIsSearchOpen = (value) => {
    if (value) {
      openSearch();
    } else {
      closeSearch();
    }
  };

  return (
    <>
      <WallpaperCarousel isHome={isHome} theme={theme} />

      <SearchModal isSearchOpen={isSearchOpen} setIsSearchOpen={setIsSearchOpen} />
      <ScrollProgress />
      <MusicPlayer />
      <BackToTop />
      <NavBar setIsSearchOpen={setIsSearchOpen} />

      {showPageBanner && <PageBanner pathname={location.pathname} theme={theme} />}

      <ErrorBoundary>
        <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/category" element={<Category />} />
        <Route path="/article/:slug" element={<ArticleDetail />} />
        <Route path="/links" element={<Links />} />
        <Route path="/about" element={<About />} />
        <Route path="/chip" element={<Chip />} />
          <Route path="/login" element={<Login />} />
          <Route path="/user-login" element={<UserLogin />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      </ErrorBoundary>

      <Footer />
    </>
  );
}

export default App;
