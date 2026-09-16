import React from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';

export default function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      style={{
        scaleX,
        transformOrigin: '0%',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '3px',
        background: 'linear-gradient(90deg, var(--primary, #A31F2A) 0%, #E06D53 45%, #D4AF37 80%, var(--primary-light, #C0323D) 100%)',
        boxShadow: '0 0 12px rgba(163, 31, 42, 0.45), 0 0 4px rgba(212, 175, 55, 0.6)',
        zIndex: 9999,
        pointerEvents: 'none',
      }}
      aria-hidden="true"
    />
  );
}
