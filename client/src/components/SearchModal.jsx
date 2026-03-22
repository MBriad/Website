import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowIcon } from '../Icons';
import articlesData from '../data/articles.json';
import projectsData from '../data/projects.json';

const SearchModal = ({ isSearchOpen, setIsSearchOpen }) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const results = useMemo(() => {
    if (!query.trim()) return { articles: [], projects: [] };
    const q = query.toLowerCase();

    const articles = articlesData.articles.filter(a =>
      a.title.toLowerCase().includes(q) ||
      a.excerpt.toLowerCase().includes(q) ||
      a.tags.some(t => t.toLowerCase().includes(q))
    );

    const projects = projectsData.projects.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.tech.some(t => t.toLowerCase().includes(q))
    );

    return { articles, projects };
  }, [query]);

  const handleClose = () => {
    setQuery('');
    setIsSearchOpen(false);
  };

  const goTo = (path) => {
    handleClose();
    navigate(path);
  };

  const hasResults = results.articles.length > 0 || results.projects.length > 0;
  const hasQuery = query.trim().length > 0;

  return (
    <AnimatePresence>
      {isSearchOpen && (
        <motion.div
          className="search-modal-overlay"
          initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
          animate={{ opacity: 1, backdropFilter: "blur(15px)" }}
          exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
          transition={{ duration: 0.4 }}
          onClick={handleClose}
        >
          <motion.div
            className="search-inner"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            onClick={(e) => e.stopPropagation()}
          >
            <input
              autoFocus
              type="text"
              className="search-input"
              placeholder="搜索物语..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />

            {hasQuery && (
              <div className="search-results">
                {!hasResults && (
                  <div className="search-empty">未找到相关内容</div>
                )}

                {results.articles.length > 0 && (
                  <div className="search-group">
                    <div className="search-group-title">文章</div>
                    {results.articles.map(a => (
                      <div
                        key={a.id}
                        className="search-result-item"
                        onClick={() => goTo('/category')}
                      >
                        <div className="search-result-name">{a.title}</div>
                        <div className="search-result-desc">{a.excerpt}</div>
                      </div>
                    ))}
                  </div>
                )}

                {results.projects.length > 0 && (
                  <div className="search-group">
                    <div className="search-group-title">项目</div>
                    {results.projects.map(p => (
                      <div
                        key={p.id}
                        className="search-result-item"
                        onClick={() => goTo('/chip')}
                      >
                        <div className="search-result-name">{p.title}</div>
                        <div className="search-result-desc">{p.description}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <motion.span
              className="close-search"
              onClick={handleClose}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              [ 关闭 ]
            </motion.span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SearchModal;
