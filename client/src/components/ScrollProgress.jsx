import { useEffect } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';

const ScrollProgress = () => {
  const scrollY = useMotionValue(0);
  const progressWidth = useTransform(scrollY, [0, 1], ['0%', '100%']);
  const smoothWidth = useSpring(progressWidth, { stiffness: 100, damping: 30 });

  useEffect(() => {
    const updateScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      scrollY.set(docHeight > 0 ? scrollTop / docHeight : 0);
    };

    updateScroll();
    window.addEventListener('scroll', updateScroll, { passive: true });
    window.addEventListener('resize', updateScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', updateScroll);
      window.removeEventListener('resize', updateScroll);
    };
  }, [scrollY]);

  return (
    <motion.div
      className="scroll-progress-bar"
      style={{ width: smoothWidth }}
    />
  );
};

export default ScrollProgress;
