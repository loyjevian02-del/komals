import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function ParallaxWrap({
  children,
  offset = 25,
  className = '',
  style = {},
}) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], [-offset, offset]);

  return (
    <div ref={ref} className={className} style={{ position: 'relative', ...style }}>
      <motion.div style={{ y }}>
        {children}
      </motion.div>
    </div>
  );
}
