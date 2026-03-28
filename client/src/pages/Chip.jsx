import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GithubIcon, ArrowIcon } from '../Icons';
import { projectAPI } from '../api/index.js';
import Loading from '../components/Loading.jsx';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
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

const Chip = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 从 API 获取项目数据
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await projectAPI.getList();
        setProjects(data || []);
      } catch (err) {
        console.error('Failed to fetch projects:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // 加载状态
  if (loading) {
    return <Loading />;
  }

  // 错误状态
  if (error) {
    return (
      <motion.main
        className="chip-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="chip-grid">
          <div className="chip-card" style={{ color: '#ff6b6b' }}>
            加载失败: {error}
          </div>
        </div>
      </motion.main>
    );
  }

  return (
    <motion.main
      key="content"
      className="chip-container"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.h1 variants={itemVariants} className="page-title">
        奇妙小<span className="highlight-blue">玩具</span>
      </motion.h1>

      <div className="chip-grid">
        {projects.map(project => (
          <motion.div
            key={project._id}
            variants={itemVariants}
            className="chip-card"
          >
            {project.featured && (
              <div className="chip-featured">精选</div>
            )}
            <div className="chip-content-wrapper">
              <div className="chip-text-box">
                <h3 className="chip-title">{project.title}</h3>
                <p className="chip-desc">{project.description}</p>
                <div className="chip-tech">
                  {project.techStack.map(tech => (
                    <span key={tech} className="tech-badge">{tech}</span>
                  ))}
                </div>
              </div>
              {project.cover && (
                <div className="chip-image-box">
                  <img src={project.cover} alt={project.title} />
                </div>
              )}
            </div>
            <div className="chip-meta">
              <span>{new Date(project.createdAt).toLocaleDateString('zh-CN')}</span>
              {project.category && <span>| {project.category}</span>}
              <span>|</span>
              <div className="chip-links">
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
            </div>
          </motion.div>
        ))}
      </div>
    </motion.main>
  );
};

export default Chip;
