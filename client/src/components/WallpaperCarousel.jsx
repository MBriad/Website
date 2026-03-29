import { useState, useEffect, useRef } from 'react';
import { wallpaperAPI } from '../api/index.js';

const WallpaperCarousel = ({ isHome, theme }) => {
  const [wallpaper, setWallpaper] = useState(null);
  const [visible, setVisible] = useState(true);
  const hasFetched = useRef(false);

  // 仅首次进入首页时获取壁纸列表，按队列顺序显示
  useEffect(() => {
    if (!isHome) return;
    
    // 主题改变时重置fetch状态，重新获取壁纸
    if (wallpaper && wallpaper.theme !== theme && wallpaper.theme !== 'both') {
      hasFetched.current = false;
    }
    
    if (hasFetched.current) return;
    hasFetched.current = true;

    const fetchWallpaper = async () => {
      try {
        const data = await wallpaperAPI.getList();
        const filtered = (data || []).filter(
          (w) => w.theme === theme || w.theme === 'both'
        );
        if (filtered.length > 0) {
          const idx = parseInt(sessionStorage.getItem('wpIdx') || '0', 10) % filtered.length;
          sessionStorage.setItem('wpIdx', (idx + 1) % filtered.length);
          setWallpaper(filtered[idx]);
        } else {
          setWallpaper(null); // 没有匹配主题的壁纸时清除
        }
      } catch {
        // API 失败时使用纯色背景
        setWallpaper(null);
      }
    };
    fetchWallpaper();
  }, [isHome, theme]);

  // 滚动超过首屏后隐藏壁纸
  useEffect(() => {
    if (!isHome) return;

    const handleScroll = () => {
      setVisible(window.scrollY < window.innerHeight * 0.5);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHome]);

  if (!isHome) return null;

  return (
    <>
      <div
        className="bg-image-layer"
        style={{
          backgroundImage: wallpaper ? `url(${wallpaper.src})` : undefined,
          opacity: visible ? 1 : 0,
        }}
        aria-hidden="true"
      />
      <div
        className="bg-overlay-layer"
        style={{ backgroundColor: visible ? 'transparent' : 'var(--bg-paper)' }}
        aria-hidden="true"
      />
    </>
  );
};

export default WallpaperCarousel;
