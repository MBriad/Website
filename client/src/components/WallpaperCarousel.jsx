import { useState, useEffect, useRef } from 'react';
import { wallpaperAPI } from '../api/index.js';

const INTERVAL = 8000; // 8 秒切换一次

const WallpaperCarousel = ({ isHome, theme }) => {
  const [wallpapers, setWallpapers] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);
  const [visible, setVisible] = useState(true);
  const timerRef = useRef(null);
  const hasFetched = useRef(false);

  // 仅首次进入首页时获取壁纸列表，刷新才更新
  useEffect(() => {
    if (!isHome || hasFetched.current) return;
    hasFetched.current = true;

    const fetchWallpapers = async () => {
      try {
        const data = await wallpaperAPI.getList();
        const filtered = (data || []).filter(
          (w) => w.theme === theme || w.theme === 'both'
        );
        setWallpapers(filtered);
      } catch {
        // API 失败时使用纯色背景
      }
    };
    fetchWallpapers();
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

  // 轮播定时器
  useEffect(() => {
    if (!isHome || wallpapers.length <= 1) return;

    timerRef.current = setInterval(() => {
      setFadeIn(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % wallpapers.length);
        setFadeIn(true);
      }, 600); // 淡出时间
    }, INTERVAL);

    return () => clearInterval(timerRef.current);
  }, [isHome, wallpapers.length]);

  if (!isHome) return null;

  // 没有壁纸时使用纯色背景
  if (wallpapers.length === 0) {
    return (
      <>
        <div
          className="bg-image-layer"
          style={{ opacity: isHome && visible ? 1 : 0 }}
          aria-hidden="true"
        />
        <div
          className="bg-overlay-layer"
          style={{ backgroundColor: isHome && visible ? 'transparent' : 'var(--bg-paper)' }}
          aria-hidden="true"
        />
      </>
    );
  }

  const current = wallpapers[currentIndex];

  return (
    <>
      <div
        className="bg-image-layer wallpaper-carousel"
        style={{
          backgroundImage: `url(${current.src})`,
          opacity: fadeIn && visible ? 1 : 0,
        }}
        aria-hidden="true"
      />
      <div
        className="bg-overlay-layer"
        style={{ backgroundColor: visible ? 'transparent' : 'var(--bg-paper)' }}
        aria-hidden="true"
      />

      {/* 轮播指示器 */}
      {wallpapers.length > 1 && visible && (
        <div className="wallpaper-dots" aria-hidden="true">
          {wallpapers.map((_, i) => (
            <span
              key={i}
              className={`wallpaper-dot ${i === currentIndex ? 'active' : ''}`}
            />
          ))}
        </div>
      )}
    </>
  );
};

export default WallpaperCarousel;
