import { motion } from 'framer-motion';
import { ArrowIcon } from '../Icons';
import linksData from '../data/links.json';

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

const Links = () => {
  return (
    <motion.main
      className="links-container"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.h1 variants={itemVariants} className="page-title">
        <span className="highlight-blue">友</span>链
      </motion.h1>

      <div className="links-grid">
        {linksData.links.map((link) => (
          <motion.a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            variants={itemVariants}
            whileHover={{ y: -5 }}
            className="link-card"
          >
            <img src={link.avatar} alt={link.name} className="link-avatar" />
            <h3 className="link-name">{link.name}</h3>
            <p className="link-desc">{link.description}</p>
            <span className="link-arrow"><ArrowIcon /></span>
          </motion.a>
        ))}
      </div>

      <motion.div variants={itemVariants} className="link-apply">
        <h3 className="link-apply-title">申请友链</h3>
        <p className="link-apply-text">
          如果你也想交换友链，欢迎通过邮箱联系我。
          希望你的站点有原创内容、更新稳定，且风格独特。
        </p>
        <a href="mailto:mbri@example.com" className="link-apply-btn">
          联系我
        </a>
      </motion.div>
    </motion.main>
  );
};

export default Links;
