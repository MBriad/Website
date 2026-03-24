import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowIcon } from '../Icons';
import { linkAPI } from '../api/index.js';
import Loading from '../components/Loading.jsx';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" }
  },
};

const Links = () => {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 从 API 获取友链数据
  useEffect(() => {
    const fetchLinks = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await linkAPI.getList();
        setLinks(data || []);
      } catch (err) {
        console.error('Failed to fetch links:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLinks();
  }, []);

  // 加载状态
  if (loading) {
    return <Loading />;
  }

  // 错误状态
  if (error) {
    return (
      <motion.main
        className="links-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="links-grid">
          <div className="link-card" style={{ color: '#ff6b6b' }}>
            加载失败: {error}
          </div>
        </div>
      </motion.main>
    );
  }

  return (
    <motion.main
      key="content"
      className="links-container"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.h1 variants={itemVariants} className="page-title">
        友人<span className="highlight-blue">帐</span>
      </motion.h1>

      <div className="links-grid">
        {links.map(link => (
          <motion.a
            key={link._id}
            variants={itemVariants}
            className="link-card"
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src={link.avatar} alt={link.name} className="link-avatar" />
            <div className="link-name">{link.name}</div>
            <div className="link-desc">{link.description}</div>
            <div className="link-arrow">
              <ArrowIcon />
            </div>
          </motion.a>
        ))}
      </div>

      <motion.div variants={itemVariants} className="link-apply">
        <div className="link-apply-title">申请友链</div>
        <div className="link-apply-text">
          如果你也想加入友人帐，请通过以下方式联系我
        </div>
        <a href="mailto:mbri@example.com" className="link-apply-btn">
          发送邮件
        </a>
      </motion.div>
    </motion.main>
  );
};

export default Links;
