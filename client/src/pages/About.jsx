import { motion } from 'framer-motion';
import { GithubIcon, MailIcon } from '../Icons';
import siteConfig from '../data/siteConfig.json';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  },
};

const About = () => {
  const paragraphs = siteConfig.bio.split('\n\n');

  return (
    <motion.main
      className="about-container"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.h1 variants={itemVariants} className="page-title">
        关于<span className="highlight-blue">我</span>
      </motion.h1>

      <motion.div variants={itemVariants} className="about-content">
        {paragraphs.map((p, i) => (
          <p key={i} className="about-paragraph">{p}</p>
        ))}
      </motion.div>

      <motion.div variants={itemVariants} className="about-contact">
        <h3 className="about-contact-title">联系方式</h3>
        <div className="about-contact-links">
          <motion.a
            href={siteConfig.socialLinks.github}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ y: -2 }}
            className="hero-link"
          >
            <GithubIcon /> GitHub
          </motion.a>
          <motion.a
            href={siteConfig.socialLinks.email}
            whileHover={{ y: -2 }}
            className="hero-link"
          >
            <MailIcon /> 邮箱
          </motion.a>
        </div>
      </motion.div>
    </motion.main>
  );
};

export default About;
