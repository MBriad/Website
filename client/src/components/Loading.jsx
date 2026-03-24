/**
 * @file src/components/Loading.jsx
 * @brief 统一加载指示器组件
 * @details 两种模式：page（全屏）和 inline（内联）
 */

import { motion } from 'framer-motion';

const Loading = ({ mode = 'page', text = '加载中...' }) => {
  if (mode === 'inline') {
    return (
      <span className="loading-inline">
        <motion.span
          className="loading-dot"
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 0.6, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.span
          className="loading-dot"
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 0.6, repeat: Infinity, ease: 'easeInOut', delay: 0.15 }}
        />
        <motion.span
          className="loading-dot"
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 0.6, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
        />
      </span>
    );
  }

  return (
    <motion.div
      className="loading-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="loading-spinner"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
      <p className="loading-text">{text}</p>
    </motion.div>
  );
};

export default Loading;
