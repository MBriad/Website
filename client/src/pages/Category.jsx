import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { TagIcon } from '../Icons';
import articlesData from '../data/articles.json';

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

  const allTags = useMemo(() => {
    const tagSet = new Set();
    articlesData.articles.forEach(a => a.tags.forEach(t => tagSet.add(t)));
    return Array.from(tagSet);
  }, []);

  const filteredArticles = useMemo(() => {
    if (!activeTag) return articlesData.articles;
    return articlesData.articles.filter(a => a.tags.includes(activeTag));
  }, [activeTag]);

  const groupedByMonth = useMemo(() => {
    const groups = {};
    filteredArticles.forEach(article => {
      const month = article.date.slice(0, 7);
      if (!groups[month]) groups[month] = [];
      groups[month].push(article);
    });
    return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a));
  }, [filteredArticles]);

  return (
    <motion.main
      className="category-container"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.h1 variants={itemVariants} className="page-title">
        文章<span className="highlight-blue">归档</span>
      </motion.h1>

      {/* 标签筛选 */}
      <motion.div variants={itemVariants} className="tag-filter">
        <motion.span
          whileHover={{ scale: 1.05 }}
          className={`tag-pill ${!activeTag ? 'tag-pill-active' : ''}`}
          onClick={() => setActiveTag(null)}
        >
          全部
        </motion.span>
        {allTags.map(tag => (
          <motion.span
            key={tag}
            whileHover={{ scale: 1.05 }}
            className={`tag-pill ${activeTag === tag ? 'tag-pill-active' : ''}`}
            onClick={() => setActiveTag(activeTag === tag ? null : tag)}
          >
            <TagIcon /> {tag}
          </motion.span>
        ))}
      </motion.div>

      {/* 时间线视图 */}
      <div className="timeline">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTag || 'all'}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {groupedByMonth.map(([month, articles]) => (
              <div key={month} className="timeline-group">
                <div className="timeline-month">{month}</div>
                <div className="timeline-line">
                  {articles.map(article => (
                    <Link key={article.id} to={`/article/${article.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <motion.div
                        whileHover={{ x: 5 }}
                        className="timeline-article"
                      >
                        <div className="timeline-dot"></div>
                        <div className="timeline-content">
                          <div className="timeline-date">{article.date}</div>
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

            {filteredArticles.length === 0 && (
              <div className="timeline-empty">暂无相关文章</div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.main>
  );
};

export default Category;
