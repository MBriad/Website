import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { ArrowIcon, TagIcon } from '../Icons';
import { articleAPI } from '../api/index.js';

const ArticleDetail = () => {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await articleAPI.getBySlug(slug);
        setArticle(data);
      } catch (err) {
        console.error('Failed to fetch article:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [slug]);

  if (loading) {
    return (
      <div className="article-detail-container">
        <motion.div
          key="loading"
          className="article-detail"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="article-placeholder">
            <p>加载中...</p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="article-detail-container">
        <motion.div
          key="error"
          className="article-detail"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="article-not-found">
            <h1>文章未找到</h1>
            <p>{error || '抱歉，您要查找的文章不存在。'}</p>
            <Link to="/category" className="back-link">
              <ArrowIcon /> 返回文章列表
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="article-detail-container">
      <motion.article
        key="content"
        className="article-detail"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* 文章头部 */}
        <header className="article-header">
          <Link to="/category" className="back-link">
            <ArrowIcon /> 返回文章列表
          </Link>

          <motion.h1
            className="article-title"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            {article.title}
          </motion.h1>

          <div className="article-meta">
            <span className="article-date">
              {new Date(article.createdAt).toLocaleDateString('zh-CN')}
            </span>
            <span className="article-category">{article.category}</span>
            <div className="article-tags">
              {article.tags.map(tag => (
                <span key={tag} className="article-tag">
                  <TagIcon /> {tag}
                </span>
              ))}
            </div>
          </div>
        </header>

        {/* 文章摘要 */}
        {article.excerpt && (
          <motion.div
            className="article-excerpt"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            {article.excerpt}
          </motion.div>
        )}

        {/* 文章内容 */}
        <motion.div
          className="article-content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <ReactMarkdown
            components={{
              code({ node, inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');
                return !inline && match ? (
                  <SyntaxHighlighter style={oneDark} language={match[1]} PreTag="div" {...props}>
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                ) : (
                  <code className={className} {...props}>{children}</code>
                );
              }
            }}
          >
            {article.content}
          </ReactMarkdown>
        </motion.div>

        {/* 文章底部 */}
        <motion.footer
          className="article-footer"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <div className="article-nav">
            <Link to="/category" className="nav-button">
              <ArrowIcon /> 返回文章列表
            </Link>
          </div>
        </motion.footer>
      </motion.article>
    </div>
  );
};

export default ArticleDetail;
