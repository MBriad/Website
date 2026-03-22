import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowIcon, TagIcon } from '../Icons';
import articlesData from '../data/articles.json';

const ArticleDetail = () => {
  const { slug } = useParams();
  const article = articlesData.articles.find(a => a.slug === slug);

  if (!article) {
    return (
      <div className="article-detail-container">
        <div className="article-not-found">
          <h1>文章未找到</h1>
          <p>抱歉，您要查找的文章不存在。</p>
          <Link to="/category" className="back-link">
            <ArrowIcon /> 返回文章列表
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="article-detail-container">
      <motion.article
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
            <span className="article-date">{article.date}</span>
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
        <motion.div
          className="article-excerpt"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          {article.excerpt}
        </motion.div>

        {/* 文章内容 */}
        <motion.div
          className="article-content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <div className="article-placeholder">
            <p>📝 文章内容加载中...</p>
            <p className="placeholder-hint">
              这是一个示例文章详情页。实际内容将从后端 API 或 Markdown 文件加载。
            </p>
            <div className="placeholder-code">
              <pre><code>{`// 示例代码
function hello() {
  console.log("Hello, World!");
}

hello();`}</code></pre>
            </div>
            <p>
              在这个页面中，我们将实现以下功能：
            </p>
            <ul>
              <li>Markdown 内容渲染</li>
              <li>代码语法高亮</li>
              <li>响应式布局</li>
              <li>暗色模式支持</li>
            </ul>
          </div>
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
