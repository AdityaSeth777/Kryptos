'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isPointer, setIsPointer] = useState(false);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });

      const target = e.target as HTMLElement;
      setIsPointer(window.getComputedStyle(target).cursor === 'pointer');
    };

    window.addEventListener('mousemove', onMouseMove);
    return () => window.removeEventListener('mousemove', onMouseMove);
  }, []);

  return (
    <>
      <motion.div
        className="cursor-dot"
        animate={{
          x: position.x,
          y: position.y,
          scale: isPointer ? 1.5 : 1,
        }}
        transition={{
          type: "spring",
          damping: 50,
          stiffness: 500,
          mass: 0.1
        }}
      >
        <svg width="20" height="20" viewBox="0 0 20 20">
          <motion.circle
            cx="10"
            cy="10"
            r="5"
            fill="#64ffda"
            animate={{
              scale: isPointer ? [1, 1.2, 1] : 1,
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </svg>
      </motion.div>
      <motion.div
        className="cursor-ring"
        animate={{
          x: position.x,
          y: position.y,
          scale: isPointer ? 1.5 : 1,
          borderColor: isPointer ? "rgba(100, 255, 218, 0.8)" : "rgba(255, 255, 255, 0.8)"
        }}
        transition={{
          type: "spring",
          damping: 30,
          stiffness: 200,
          mass: 0.5
        }}
      />
    </>
  );
}