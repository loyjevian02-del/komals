import React from 'react';
import { motion } from 'framer-motion';

export default function StaggerGrid({
  children,
  stagger = 0.07,
  delay = 0,
  duration = 0.75,
  className = '',
  style = {},
}) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: stagger,
        delayChildren: delay,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 24, scale: 0.98, filter: 'blur(3px)' },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: 'blur(0px)',
      transition: {
        duration,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  return (
    <motion.div
      className={className}
      style={style}
      variants={container}
      initial="hidden"
      animate="show"
    >
      {React.Children.map(children, (child) => {
        if (!child) return null;
        return <motion.div variants={item}>{child}</motion.div>;
      })}
    </motion.div>
  );
}
