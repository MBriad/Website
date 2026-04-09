import { motion } from 'framer-motion';
import '../styles/components/footer.css';

const Footer = () => {
  return (
    <motion.footer
      className="footer-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1, duration: 0.8 }}
    >
      <img src="/commend.jpg" alt="commend" className="footer-commend" />
      <div className="footer-text">
        © {new Date().getFullYear()} MBri の 小窝
      </div>
      <div className="footer-copyright">
        Crafted with React & Vite
      </div>
      <div className="footer-icp">
        <span className="icp-badge">粤ICP备</span>
        <span className="icp-number">2026037331号</span>
      </div>
    </motion.footer>
  );
};

export default Footer;