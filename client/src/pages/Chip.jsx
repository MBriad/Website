import { motion } from 'framer-motion';
import { GithubIcon, ArrowIcon } from '../Icons';
import projectsData from '../data/projects.json';

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
  return (
    <motion.main
      className="chip-container"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.h1 variants={itemVariants} className="page-title">
        <span className="highlight-blue">项目</span>
      </motion.h1>

      <div className="chip-grid">
        {projectsData.projects.map((project) => (
          <motion.div
            key={project.id}
            variants={itemVariants}
            whileHover={{ y: -5 }}
            className="chip-card"
          >
            {project.featured && (
              <span className="chip-featured">精选</span>
            )}
            <h3 className="chip-title">{project.title}</h3>
            <p className="chip-desc">{project.description}</p>
            <div className="chip-tech">
              {project.tech.map(t => (
                <span key={t} className="tech-badge">{t}</span>
              ))}
            </div>
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
          </motion.div>
        ))}
      </div>
    </motion.main>
  );
};

export default Chip;
