import { motion } from 'framer-motion';

const Footer = () => {
  return (
    <motion.footer
      className="footer-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1, duration: 0.8 }}
    >
      <div className="footer-text">
        © {new Date().getFullYear()} MBri の 小窝
      </div>
      <div className="footer-copyright">
        Crafted with React & Vite
      </div>
    </motion.footer>
  );
};

export default Footer;
