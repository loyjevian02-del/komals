import React from 'react';
import { motion } from 'framer-motion';

const directionVariants = {
  up: (blur, scale) => ({
    hidden: { opacity: 0, y: 35, ...(blur && { filter: 'blur(4px)' }), ...(scale && { scale: 0.98 }) },
    visible: { opacity: 1, y: 0, filter: 'blur(0px)', scale: 1 },
  }),
  down: (blur) => ({
    hidden: { opacity: 0, y: -35, ...(blur && { filter: 'blur(4px)' }) },
    visible: { opacity: 1, y: 0, filter: 'blur(0px)' },
  }),
  left: (blur) => ({
    hidden: { opacity: 0, x: -35, ...(blur && { filter: 'blur(4px)' }) },
    visible: { opacity: 1, x: 0, filter: 'blur(0px)' },
  }),
  right: (blur) => ({
    hidden: { opacity: 0, x: 35, ...(blur && { filter: 'blur(4px)' }) },
    visible: { opacity: 1, x: 0, filter: 'blur(0px)' },
  }),
  zoom: (blur) => ({
    hidden: { opacity: 0, scale: 0.92, ...(blur && { filter: 'blur(4px)' }) },
    visible: { opacity: 1, scale: 1, filter: 'blur(0px)' },
  }),
  fade: (blur) => ({
    hidden: { opacity: 0, ...(blur && { filter: 'blur(4px)' }) },
    visible: { opacity: 1, filter: 'blur(0px)' },
  }),
};

export default function Reveal({
  children,
  delay = 0,
  duration = 0.85,
  direction = 'up',
  blur = true,
  scale = false,
  className = '',
  style = {},
}) {
  const getVariants = directionVariants[direction] || directionVariants.up;
  const variants = getVariants(blur, scale);

  return (
    <motion.div
      className={className}
      style={style}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px 0px' }}
      variants={variants}
      transition={{
        duration,
        ease: [0.16, 1, 0.3, 1],
        delay,
      }}
    >
      {children}
    </motion.div>
  );
}
