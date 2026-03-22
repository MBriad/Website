import { useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { GithubIcon, MailIcon, ArrowIcon, TagIcon } from '../Icons';
import useTypewriter from '../hooks/useTypewriter';
import articlesData from '../data/articles.json';
import projectsData from '../data/projects.json';
import siteConfig from '../data/siteConfig.json';

const QUOTES = [
  '忙点好啊，会发现忙里偷闲才是本事',
  '代码是诗，生活是远方',
  '每一次重构，都是与过去的自己和解',
  '在字节之间，寻找属于自己的节奏',
];

const articles = articlesData.articles.slice(0, 5);
const projects = projectsData.projects.filter(p => p.featured);

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
  const { displayText } = useTypewriter(QUOTES);

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
          {displayText}
          <span className="typewriter-cursor"></span>
        </div>

        <motion.div
          className="hero-links"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
        >
          <motion.a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ y: -2 }}
            className="hero-link"
          >
            <GithubIcon /> GitHub
          </motion.a>
          <motion.a
            href="mailto:example@email.com"
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
              <FadeInCard key={article.id} whileHover={{ x: 5, backgroundColor: 'rgba(160, 216, 239, 0.1)' }}>
                <h3 style={{ fontWeight: 500, marginBottom: '6px', fontSize: '1.1rem' }}>
                  {article.title}
                </h3>
                <p className="article-excerpt">{article.excerpt}</p>
                <div className="article-meta">
                  <span>{article.date}</span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {article.tags.map(tag => (
                      <span key={tag} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <TagIcon /> {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </FadeInCard>
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
              <FadeInCard key={project.id} whileHover={{ y: -5 }}>
                <h3 style={{ fontWeight: 500, marginBottom: '8px' }}>{project.title}</h3>
                <p className="project-desc">{project.description}</p>
                <div className="project-tech">
                  {project.tech.map(t => (
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
