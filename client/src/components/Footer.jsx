import { motion } from 'framer-motion';

const Footer = () => {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1, duration: 0.8 }}
      style={{
        position: 'relative',
        zIndex: 1,
        textAlign: 'center',
        padding: '40px 20px 30px',
        color: '#999',
        fontSize: '0.85rem',
      }}
    >
      <div style={{ marginBottom: '8px' }}>
        © {new Date().getFullYear()} MBri の 小窝
      </div>
      <div style={{ fontSize: '0.75rem', color: '#bbb' }}>
        Crafted with React & Vite
      </div>
    </motion.footer>
  );
};

export default Footer;
