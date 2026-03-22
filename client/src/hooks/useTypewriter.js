import { useState, useEffect, useRef } from 'react';

const useTypewriter = (quotes, options = {}) => {
  const {
    typingSpeed = 80,
    deletingSpeed = 40,
    pauseDuration = 2500,
  } = options;

  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const indexRef = useRef(0);
  const charIndexRef = useRef(0);
  const timeoutRef = useRef(null);

  useEffect(() => {
    const tick = () => {
      const currentQuote = quotes[indexRef.current];

      if (!isDeleting) {
        if (charIndexRef.current <= currentQuote.length) {
          setDisplayText(currentQuote.slice(0, charIndexRef.current));
          charIndexRef.current++;
          timeoutRef.current = setTimeout(tick, typingSpeed);
        } else {
          timeoutRef.current = setTimeout(() => setIsDeleting(true), pauseDuration);
        }
      } else {
        if (charIndexRef.current > 0) {
          charIndexRef.current--;
          setDisplayText(currentQuote.slice(0, charIndexRef.current));
          timeoutRef.current = setTimeout(tick, deletingSpeed);
        } else {
          setIsDeleting(false);
          indexRef.current = (indexRef.current + 1) % quotes.length;
        }
      }
    };

    timeoutRef.current = setTimeout(tick, 100);
    return () => clearTimeout(timeoutRef.current);
  }, [isDeleting, quotes, typingSpeed, deletingSpeed, pauseDuration]);

  return { displayText, isDeleting };
};

export default useTypewriter;
