import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { TagIcon } from '../Icons';
import { articleAPI } from '../api.js';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.2 },
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

const Category = () => {
  const [activeTag, setActiveTag] = useState(null);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 从 API 获取文章数据
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await articleAPI.getList();
        setArticles(response.data || []);
      } catch (err) {
        console.error('Failed to fetch articles:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  const allTags = useMemo(() => {
    const tagSet = new Set();
    articles.forEach(a => a.tags.forEach(t => tagSet.add(t)));
    return Array.from(tagSet);
  }, [articles]);

  const filteredArticles = useMemo(() => {
    if (!activeTag) return articles;
    return articles.filter(a => a.tags.includes(activeTag));
  }, [activeTag, articles]);

  const groupedByMonth = useMemo(() => {
    const groups = {};
    filteredArticles.forEach(article => {
      const month = article.createdAt.slice(0, 7);
      if (!groups[month]) groups[month] = [];
      groups[month].push(article);
    });
    return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a));
  }, [filteredArticles]);

  // 加载状态
  if (loading) {
    return (
      <motion.main
        className="category-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="timeline-empty">加载中...</div>
      </motion.main>
    );
  }

  // 错误状态
  if (error) {
    return (
      <motion.main
        className="category-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="timeline-empty" style={{ color: '#ff6b6b' }}>
          加载失败: {error}
        </div>
      </motion.main>
    );
  }

  return (
    <motion.main
      className="category-container"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.h1 variants={itemVariants} className="page-title">
        文章<span className="highlight-blue">归档</span>
      </motion.h1>

      {/* 标签筛选 */}
      <motion.div variants={itemVariants} className="tag-filter">
        <span
          className={`tag-pill ${!activeTag ? 'tag-pill-active' : ''}`}
          onClick={() => setActiveTag(null)}
        >
          全部
        </span>
        {allTags.map(tag => (
          <span
            key={tag}
            className={`tag-pill ${activeTag === tag ? 'tag-pill-active' : ''}`}
            onClick={() => setActiveTag(tag)}
          >
            <TagIcon /> {tag}
          </span>
        ))}
      </motion.div>

      {/* 时间线 */}
      <motion.div variants={itemVariants} className="timeline">
        <AnimatePresence mode="wait">
          {groupedByMonth.map(([month, articles]) => (
            <div key={month} className="timeline-group">
              <div className="timeline-month">{month}</div>
              <div className="timeline-line">
                {articles.map(article => (
                  <Link key={article._id} to={`/article/${article.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <motion.div
                      whileHover={{ x: 5 }}
                      className="timeline-article"
                    >
                      <div className="timeline-dot"></div>
                      <div className="timeline-content">
                        <div className="timeline-date">{new Date(article.createdAt).toLocaleDateString('zh-CN')}</div>
                        <h3 className="timeline-title">{article.title}</h3>
                        <p className="timeline-excerpt">{article.excerpt}</p>
                        <div className="timeline-tags">
                          {article.tags.map(tag => (
                            <span key={tag} className="timeline-tag">
                              <TagIcon /> {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </AnimatePresence>

        {filteredArticles.length === 0 && (
          <div className="timeline-empty">暂无相关文章</div>
        )}
      </motion.div>
    </motion.main>
  );
};

export default Category;
