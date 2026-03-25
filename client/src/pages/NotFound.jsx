import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const NotFound = () => (
  <motion.main
    className="not-found-container"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5 }}
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      textAlign: 'center',
      gap: '16px',
    }}
  >
    <h1 style={{ fontSize: '4rem', margin: 0, color: 'var(--accent-blue, #a0d8ef)' }}>404</h1>
    <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary, #888)', margin: 0 }}>
      页面不存在
    </p>
    <Link
      to="/"
      style={{
        marginTop: '16px',
        padding: '10px 24px',
        borderRadius: '20px',
        background: 'var(--accent-blue, #a0d8ef)',
        color: '#fff',
        textDecoration: 'none',
        fontWeight: 500,
      }}
    >
      返回首页
    </Link>
  </motion.main>
);

export default NotFound;
