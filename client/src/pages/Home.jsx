import { useRef, useCallback, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  GithubIcon, MailIcon, ArrowIcon, TagIcon,
  BilibiliIcon, TelegramIcon, TwitterIcon, DiscordIcon,
  WeChatIcon, LinkedInIcon, InstagramIcon
} from '../Icons';
import useTypewriter from '../hooks/useTypewriter';
import { articleAPI, projectAPI, configAPI, socialLinkAPI } from '../api/index.js';
import Loading from '../components/Loading.jsx';

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

// 社交图标组件 - 根据平台名称渲染对应的SVG图标
const SocialIcon = ({ iconName, className }) => {
  // 图标映射表：将数据库中的icon字段映射到对应的SVG组件
  const iconMap = {
    // 直接平台名称映射
    'github': GithubIcon,
    'mail': MailIcon,
    'bilibili': BilibiliIcon,
    'telegram': TelegramIcon,
    'twitter': TwitterIcon,
    'x': TwitterIcon, // Twitter现在叫X
    'discord': DiscordIcon,
    'wechat': WeChatIcon,
    'linkedin': LinkedInIcon,
    'instagram': InstagramIcon,
    
    // Iconify格式兼容（向后兼容）
    'simple-icons:github': GithubIcon,
    'simple-icons:bilibili': BilibiliIcon,
    'simple-icons:telegram': TelegramIcon,
    'simple-icons:twitter': TwitterIcon,
    'simple-icons:discord': DiscordIcon,
    'simple-icons:wechat': WeChatIcon,
    'simple-icons:linkedin': LinkedInIcon,
    'simple-icons:instagram': InstagramIcon,
    'openmoji:github': GithubIcon,
    'openmoji:mail': MailIcon,
  };

  // 查找对应的图标组件
  const IconComponent = iconMap[iconName.toLowerCase()] || null;

  if (!IconComponent) {
    // 如果没有找到对应的图标，显示一个占位符
    console.warn(`未找到图标: ${iconName}`);
    return (
      <span className={`icon-placeholder ${className || ''}`} style={{ fontSize: '28px' }}>
        🔗
      </span>
    );
  }

  return <IconComponent className={className} />;
};

const Home = () => {
  const contentRef = useRef(null);
  const quote = useTypewriter(QUOTES);
  
  // 状态管理
  const [articles, setArticles] = useState([]);
  const [projects, setProjects] = useState([]);
  const [siteConfig, setSiteConfig] = useState(null);
  const [socialLinks, setSocialLinks] = useState([]);
  const [selectedSocialIndex, setSelectedSocialIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 从 API 获取数据
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 并行获取文章、项目和网站配置
        const [articlesRes, projectsRes, configRes, linksRes] = await Promise.all([
          articleAPI.getList({ limit: 5 }),
          projectAPI.getList(),
          configAPI.get(),
          socialLinkAPI.getList(),
        ]);

        // 设置文章数据
        setArticles(articlesRes.data || []);

        // 设置项目数据（筛选精选项目）
        const featuredProjects = (projectsRes || []).filter(p => p.featured);
        setProjects(featuredProjects);

        // 设置网站配置
        setSiteConfig(configRes);

        // 设置社交链接
        setSocialLinks(linksRes || []);
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
    return <Loading />;
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

        {/* 合并后的大毛玻璃框 - 引言 + 社交图标 */}
        {socialLinks.length > 0 && (
          <div className="glass-quote-box">
            <span className="glass-arrow left" onClick={() => setSelectedSocialIndex((selectedSocialIndex - 1 + socialLinks.length) % socialLinks.length)}>❮</span>
            
            <div className="glass-content">
              <p className="glass-text">
                {quote.displayText}
                <span className="typewriter-cursor"></span>
              </p>
              <a 
                href={socialLinks[selectedSocialIndex].url} 
                target="_blank" 
                rel="noopener noreferrer"
                className={`glass-icon ${socialLinks[selectedSocialIndex].icon}-icon`}
              >
                <SocialIcon iconName={socialLinks[selectedSocialIndex].icon} />
              </a>
            </div>
            
            <span className="glass-arrow right" onClick={() => setSelectedSocialIndex((selectedSocialIndex + 1) % socialLinks.length)}>❯</span>
          </div>
        )}

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
                <FadeInCard whileHover={{ x: 5 }} className="article-card">
                  <div className="article-card-cover-wrapper">
                    {article.cover ? (
                      <img src={article.cover} alt={article.title} className="article-card-cover" />
                    ) : (
                      <div className="article-card-cover-placeholder" />
                    )}
                    <div className="article-card-overlay">
                      <h3 className="article-card-title">{article.title}</h3>
                      <p className="article-card-excerpt">{article.excerpt}</p>
                    </div>
                  </div>
                  <div className="article-card-body">
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
