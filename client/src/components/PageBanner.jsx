/**
 * @file src/components/PageBanner.jsx
 * @brief 页面横幅组件 - 显示在非首页页面顶部
 */
import { useState, useEffect, useRef } from 'react';
import { bannerAPI } from '../api/index.js';

const PAGE_BANNER_MAP = {
  '/category': 'banner_category',
  '/links': 'banner_links',
  '/about': 'banner_about',
  '/chip': 'banner_chip',
};

const getBannerKey = (pathname) => {
  if (pathname.startsWith('/article/')) {
    return 'banner_article';
  }
  return PAGE_BANNER_MAP[pathname];
};

const PageBanner = ({ pathname, theme }) => {
  const [banner, setBanner] = useState(null);
  const hasFetched = useRef(false);

  useEffect(() => {
    const bannerKey = getBannerKey(pathname);
    if (!bannerKey || hasFetched.current) return;
    hasFetched.current = true;

    const fetchBanner = async () => {
      try {
        const data = await bannerAPI.getByPage(bannerKey);
        if (data && data.active) {
          if (data.theme === 'both' || data.theme === theme) {
            setBanner(data);
          }
        }
      } catch {
        // API 失败时使用纯色背景
      }
    };
    fetchBanner();
  }, [pathname, theme]);

  if (!banner) return null;

  return (
    <div
      className="page-banner"
      style={{
        width: '100%',
        height: '45vh',
        backgroundImage: `url(${banner.src})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
        backgroundRepeat: 'no-repeat',
        position: 'relative',
      }}
      aria-hidden="true"
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(255,255,255,0.15)',
          backdropFilter: 'blur(2px)',
        }}
      />
    </div>
  );
};

export default PageBanner;