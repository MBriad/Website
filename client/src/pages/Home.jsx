import { useRef, useCallback, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { GithubIcon, MailIcon, ArrowIcon, TagIcon } from '../Icons';
import useTypewriter from '../hooks/useTypewriter';
import { articleAPI, projectAPI, configAPI } from '../api/index.js';

const QUOTES = [
  '忙点好啊，会发现忙里偷闲才是本事',
  '代码是诗，生活是远方',
  '每一次重构，都是与过去的自己和解',
  '在字节之间，寻找属于自己的节奏',
];

const FadeInCard = ({ children, className, style, whileHover }) => {
  const ref = useRef(null);

  const handleRef = useCallback((node) => {
    ref.current = node;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          node.classList.add('visible');
          observer.unobserve(node);
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(node);
  }, []);

  return (
    <motion.div
      ref={handleRef}
      className={`fade-in-card ${className || ''}`}
      style={style}
      whileHover={whileHover}
    >
      {children}
    </motion.div>
  );
};

const Home = () => {
  const contentRef = useRef(null);
  const quote = useTypewriter(QUOTES);
  
  // 状态管理
  const [articles, setArticles] = useState([]);
  const [projects, setProjects] = useState([]);
  const [siteConfig, setSiteConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 从 API 获取数据
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 并行获取文章、项目和网站配置
        const [articlesRes, projectsRes, configRes] = await Promise.all([
          articleAPI.getList({ limit: 5 }),
          projectAPI.getList(),
          configAPI.get(),
        ]);

        // 设置文章数据
        setArticles(articlesRes.data || []);

        // 设置项目数据（筛选精选项目）
        const featuredProjects = (projectsRes || []).filter(p => p.featured);
        setProjects(featuredProjects);

        // 设置网站配置
        setSiteConfig(configRes);
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 加载状态
  if (loading) {
    return (
      <main className="home-container">
        <section className="hero-section">
          <div className="typewriter-quote">加载中...</div>
        </section>
      </main>
    );
  }

  // 错误状态
  if (error) {
    return (
      <main className="home-container">
        <section className="hero-section">
          <div className="typewriter-quote" style={{ color: '#ff6b6b' }}>
            加载失败: {error}
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="home-container">
      {/* Hero 全屏首屏 */}
      <section className="hero-section">
        <motion.img
          src="/avatar.jpg"
          alt="avatar"
          className="hero-avatar"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />

        <div className="typewriter-quote">
          {quote.displayText}
          <span className="typewriter-cursor"></span>
        </div>

        <motion.div
          className="hero-links"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
        >
          <motion.a
            href={siteConfig?.socialLinks?.github || "https://github.com"}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ y: -2 }}
            className="hero-link"
          >
            <GithubIcon /> GitHub
          </motion.a>
          <motion.a
            href={siteConfig?.socialLinks?.email || "mailto:example@email.com"}
            whileHover={{ y: -2 }}
            className="hero-link"
          >
            <MailIcon /> 邮箱
          </motion.a>
        </motion.div>

        <motion.div
          className="scroll-hint"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 0.8 }}
        >
          <span>向下滑动</span>
          <ArrowIcon />
        </motion.div>
      </section>

      {/* 个人介绍区域 */}
      {siteConfig && (
        <section className="intro-section">
          <FadeInCard className="intro-card">
            <h2 style={{ fontSize: '1.3rem', fontWeight: 600, marginBottom: '16px' }}>
              关于<span className="highlight-blue">我</span>
            </h2>
            <div className="intro-content">
              {siteConfig.bio.split('\n\n').map((paragraph, index) => (
                <p key={index} className="intro-paragraph">{paragraph}</p>
              ))}
            </div>
            <div className="intro-links">
              <Link to="/about" className="intro-link">
                <motion.span whileHover={{ x: 5 }}>
                  了解更多 <ArrowIcon />
                </motion.span>
              </Link>
            </div>
          </FadeInCard>
        </section>
      )}

      {/* 下方内容区 */}
      <div className="content-section">
        {/* 最新文章 */}
        <section style={{ marginBottom: '60px' }}>
          <FadeInCard>
            <div className="section-header">
              <h2 style={{ fontSize: '1.3rem', fontWeight: 600 }}>
                <span className="highlight-blue">最近</span>的文章
              </h2>
              <Link to="/category" className="section-link">
                <motion.span whileHover={{ x: 5 }}>
                  查看全部 <ArrowIcon />
                </motion.span>
              </Link>
            </div>
          </FadeInCard>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {articles.map((article) => (
              <Link key={article._id} to={`/article/${article.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <FadeInCard whileHover={{ x: 5 }}>
                  <h3 style={{ fontWeight: 500, marginBottom: '6px', fontSize: '1.1rem' }}>
                    {article.title}
                  </h3>
                  <p className="article-excerpt">{article.excerpt}</p>
                  <div className="article-meta">
                    <span>{new Date(article.createdAt).toLocaleDateString('zh-CN')}</span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {article.tags.map(tag => (
                        <span key={tag} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <TagIcon /> {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </FadeInCard>
              </Link>
            ))}
          </div>
        </section>

        {/* 特色项目 */}
        <section style={{ marginBottom: '50px' }}>
          <FadeInCard>
            <div className="section-header">
              <h2 style={{ fontSize: '1.3rem', fontWeight: 600 }}>
                <span className="highlight-blue">特色</span>项目
              </h2>
              <Link to="/chip" className="section-link">
                <motion.span whileHover={{ x: 5 }}>
                  查看全部 <ArrowIcon />
                </motion.span>
              </Link>
            </div>
          </FadeInCard>

          <div className="projects-grid">
            {projects.map((project) => (
              <FadeInCard key={project._id} whileHover={{ y: -5 }}>
                <h3 style={{ fontWeight: 500, marginBottom: '8px' }}>{project.title}</h3>
                <p className="project-desc">{project.description}</p>
                <div className="project-tech">
                  {project.techStack.map(t => (
                    <span key={t} className="tech-badge">{t}</span>
                  ))}
                </div>
                <div className="project-links">
                  {project.github && (
                    <a href={project.github} target="_blank" rel="noopener noreferrer">
                      <GithubIcon /> 源码
                    </a>
                  )}
                  {project.demo && (
                    <a href={project.demo} target="_blank" rel="noopener noreferrer">
                      <ArrowIcon /> Demo
                    </a>
                  )}
                </div>
              </FadeInCard>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
};

export default Home;
