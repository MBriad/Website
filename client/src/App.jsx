/**
 * @file App.jsx
 * @brief 日系轻小说风个人网站主入口组件
 * @details 结合了大留白设计、天空蓝点缀，加入了底层模糊背景图片与半透明纸张遮罩。
 * @author MBri
 * @date 2026-03-17
 */

import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
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
import useStore from './store/useStore';

const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.3 }}
  >
    {children}
  </motion.div>
);

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

        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
            <Route path="/category" element={<PageWrapper><Category /></PageWrapper>} />
            <Route path="/article/:slug" element={<PageWrapper><ArticleDetail /></PageWrapper>} />
            <Route path="/links" element={<PageWrapper><Links /></PageWrapper>} />
            <Route path="/about" element={<PageWrapper><About /></PageWrapper>} />
            <Route path="/chip" element={<PageWrapper><Chip /></PageWrapper>} />
          </Routes>
        </AnimatePresence>

      <Footer />
    </>
  );
}

export default App;
