'use client';

import { useEffect, useState } from 'react';
import { motion, useSpring } from 'framer-motion';

export function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isPointer, setIsPointer] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });

  const springConfig = { damping: 25, stiffness: 300 };
  const x = useSpring(position.x, springConfig);
  const y = useSpring(position.y, springConfig);
  const scale = useSpring(isPointer ? 1.2 : 1, springConfig);

  useEffect(() => {
    let lastX = 0;
    let lastY = 0;

    const onMouseMove = (e: MouseEvent) => {
      // Calculate rotation based on mouse movement
      const deltaX = e.clientX - lastX;
      const deltaY = e.clientY - lastY;
      
      setRotation({
        x: deltaY * 0.5, // Tilt based on vertical movement
        y: -deltaX * 0.5, // Tilt based on horizontal movement
      });

      lastX = e.clientX;
      lastY = e.clientY;
      
      setPosition({ x: e.clientX, y: e.clientY });
      const target = e.target as HTMLElement;
      setIsPointer(window.getComputedStyle(target).cursor === 'pointer');
      setIsVisible(true);
    };

    const onMouseLeave = () => setIsVisible(false);
    const onMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <>
      <motion.div
        className="cursor"
        animate={{
          x: position.x - 20,
          y: position.y - 20,
          scale: isPointer ? 1.2 : 1,
          rotateX: rotation.x,
          rotateY: rotation.y,
        }}
        transition={springConfig}
        style={{
          opacity: isVisible ? 1 : 0,
        }}
      />
      <motion.div
        className="cursor-dot"
        animate={{
          x: position.x,
          y: position.y,
          scale: isPointer ? 0.5 : 1,
        }}
        transition={springConfig}
        style={{
          opacity: isVisible ? 1 : 0,
        }}
      />
    </>
  );
}