import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import { useSmoothScroll } from '../../lib/SmoothScrollProvider.jsx';

export default function ScrollToTopButton() {
  const { scrollTo } = useSmoothScroll();
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function handleScroll() {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPct = docHeight > 0 ? Math.min(1, Math.max(0, scrollY / docHeight)) : 0;

      setProgress(scrollPct);
      setVisible(scrollY > 280);
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const size = 44;
  const strokeWidth = 2.5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          aria-label="Scroll to top"
          title="Scroll to top"
          onClick={() => scrollTo(0)}
          initial={{ opacity: 0, scale: 0.7, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.7, y: 15 }}
          whileHover={{ scale: 1.1, translateY: -2 }}
          whileTap={{ scale: 0.92 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: 'fixed',
            right: 22,
            bottom: 82,
            width: size,
            height: size,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.96)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(211, 204, 204, 0.6)',
            boxShadow: '0 6px 20px -3px rgba(26, 20, 22, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 35,
            padding: 0,
            color: 'var(--primary)',
          }}
        >
          {/* Circular Progress Ring */}
          <svg
            width={size}
            height={size}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              transform: 'rotate(-90deg)',
              pointerEvents: 'none',
            }}
          >
            {/* Background ring track */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="rgba(211, 204, 204, 0.35)"
              strokeWidth={strokeWidth}
            />
            {/* Active progress stroke */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="var(--primary)"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              style={{
                transition: 'stroke-dashoffset 0.1s linear',
              }}
            />
          </svg>

          <ArrowUp size={18} strokeWidth={2.4} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
