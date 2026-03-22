import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GithubIcon, MailIcon } from '../Icons';
import { configAPI } from '../api.js';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  },
};

const About = () => {
  const [siteConfig, setSiteConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 从 API 获取网站配置
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await configAPI.get();
        setSiteConfig(data);
      } catch (err) {
        console.error('Failed to fetch site config:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  // 加载状态
  if (loading) {
    return (
      <motion.main
        className="about-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="about-content">加载中...</div>
      </motion.main>
    );
  }

  // 错误状态
  if (error) {
    return (
      <motion.main
        className="about-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="about-content" style={{ color: '#ff6b6b' }}>
          加载失败: {error}
        </div>
      </motion.main>
    );
  }

  const paragraphs = siteConfig.bio.split('\n\n');

  return (
    <motion.main
      className="about-container"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.h1 variants={itemVariants} className="page-title">
        关于<span className="highlight-blue">我</span>
      </motion.h1>

      <motion.div variants={itemVariants} className="about-content">
        {paragraphs.map((paragraph, index) => (
          <p key={index} className="about-paragraph">{paragraph}</p>
        ))}
      </motion.div>

      <motion.div variants={itemVariants} className="about-contact">
        <div className="about-contact-title">联系方式</div>
        <div className="about-contact-links">
          <a href={siteConfig.socialLinks.github} target="_blank" rel="noopener noreferrer" className="about-contact-link">
            <GithubIcon /> GitHub
          </a>
          <a href={siteConfig.socialLinks.email} className="about-contact-link">
            <MailIcon /> 邮箱
          </a>
        </div>
      </motion.div>
    </motion.main>
  );
};

export default About;
