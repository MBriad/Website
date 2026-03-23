import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowIcon, TagIcon } from '../Icons';
import { searchAPI } from '../api/index.js';

const SearchModal = ({ isSearchOpen, setIsSearchOpen }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ articles: [], projects: [] });
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();
  const resultsRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  // 防抖搜索
  const performSearch = useCallback(async (searchQuery) => {
    if (!searchQuery.trim()) {
      setResults({ articles: [], projects: [] });
      return;
    }

    setIsSearching(true);
    try {
      const searchResults = await searchAPI.search(searchQuery);
      setResults(searchResults);
    } catch (error) {
      console.error('Search failed:', error);
      setResults({ articles: [], projects: [] });
    } finally {
      setIsSearching(false);
    }
  }, []);

  // 处理输入变化
  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedIndex(-1);

    // 清除之前的定时器
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // 设置新的防抖定时器
    searchTimeoutRef.current = setTimeout(() => {
      performSearch(value);
    }, 300);
  };

  // 扁平化的所有结果，用于键盘导航
  const allResults = [];
  results.articles.forEach(a => allResults.push({ type: 'article', data: a }));
  results.projects.forEach(p => allResults.push({ type: 'project', data: p }));

  // 键盘导航
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isSearchOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < allResults.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0 && selectedIndex < allResults.length) {
            const item = allResults[selectedIndex];
            goTo(item.type === 'article' ? `/article/${item.data.slug}` : '/chip');
          }
          break;
        case 'Escape':
          handleClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, selectedIndex, allResults]);

  // 滚动选中项到视图
  useEffect(() => {
    if (selectedIndex >= 0 && resultsRef.current) {
      const items = resultsRef.current.querySelectorAll('.search-result-item');
      if (items[selectedIndex]) {
        items[selectedIndex].scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const handleClose = () => {
    setQuery('');
    setSelectedIndex(-1);
    setResults({ articles: [], projects: [] });
    setIsSearchOpen(false);
  };

  const goTo = (path) => {
    handleClose();
    navigate(path);
  };

  // 高亮搜索词
  const highlightText = (text, query) => {
    if (!query.trim()) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === query.toLowerCase() 
        ? <mark key={i} className="search-highlight">{part}</mark>
        : part
    );
  };

  const hasResults = results.articles.length > 0 || results.projects.length > 0;
  const hasQuery = query.trim().length > 0;

  // 搜索建议
  const suggestions = [
    'React', 'IoT', 'Vite', 'TypeScript', 'Docker',
    '前端', '硬件', '开源', 'ESP32', 'CSS'
  ];

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
              onChange={handleInputChange}
            />

            {/* 搜索建议 */}
            {!hasQuery && (
              <div className="search-suggestions">
                <div className="search-suggestions-title">热门搜索</div>
                <div className="search-suggestions-list">
                  {suggestions.map((tag, i) => (
                    <motion.span
                      key={tag}
                      className="search-suggestion-tag"
                      onClick={() => {
                        setQuery(tag);
                        performSearch(tag);
                      }}
                      whileHover={{ scale: 1.05 }}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <TagIcon /> {tag}
                    </motion.span>
                  ))}
                </div>
              </div>
            )}

            {/* 搜索结果 */}
            {hasQuery && (
              <div className="search-results" ref={resultsRef}>
                {isSearching && (
                  <div className="search-empty">搜索中...</div>
                )}

                {!isSearching && !hasResults && (
                  <div className="search-empty">
                    <div className="search-empty-icon">🔍</div>
                    <div className="search-empty-text">未找到相关内容</div>
                    <div className="search-empty-hint">
                      试试其他关键词，或浏览热门搜索
                    </div>
                  </div>
                )}

                {!isSearching && results.articles.length > 0 && (
                  <div className="search-group">
                    <div className="search-group-title">
                      文章 ({results.articles.length})
                    </div>
                    {results.articles.map((a, idx) => {
                      const globalIdx = idx;
                      return (
                        <div
                          key={a._id}
                          className={`search-result-item ${selectedIndex === globalIdx ? 'selected' : ''}`}
                          onClick={() => goTo(`/article/${a.slug}`)}
                          onMouseEnter={() => setSelectedIndex(globalIdx)}
                        >
                          <div className="search-result-name">
                            {highlightText(a.title, query)}
                          </div>
                          <div className="search-result-desc">
                            {highlightText(a.excerpt, query)}
                          </div>
                          <div className="search-result-tags">
                            {a.tags.map(tag => (
                              <span key={tag} className="search-result-tag">
                                <TagIcon /> {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {!isSearching && results.projects.length > 0 && (
                  <div className="search-group">
                    <div className="search-group-title">
                      项目 ({results.projects.length})
                    </div>
                    {results.projects.map((p, idx) => {
                      const globalIdx = results.articles.length + idx;
                      return (
                        <div
                          key={p._id}
                          className={`search-result-item ${selectedIndex === globalIdx ? 'selected' : ''}`}
                          onClick={() => goTo('/chip')}
                          onMouseEnter={() => setSelectedIndex(globalIdx)}
                        >
                          <div className="search-result-name">
                            {highlightText(p.title, query)}
                          </div>
                          <div className="search-result-desc">
                            {highlightText(p.description, query)}
                          </div>
                          <div className="search-result-tech">
                            {p.techStack.map(t => (
                              <span key={t} className="tech-badge">{t}</span>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* 键盘提示 */}
            <div className="search-keyboard-hints">
              <span><kbd>↑</kbd><kbd>↓</kbd> 导航</span>
              <span><kbd>Enter</kbd> 选择</span>
              <span><kbd>Esc</kbd> 关闭</span>
            </div>

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
