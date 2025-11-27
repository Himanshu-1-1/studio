'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export function HeartBalloonOverlay() {
  const [hearts, setHearts] = useState<any[]>([]);

  useEffect(() => {
    const createHeart = () => ({
      id: Math.random(),
      left: `${Math.random() * 90 + 5}%`, // Random horizontal position (5% to 95%)
      size: `${Math.random() * 1.5 + 1}rem`, // Random font size (1rem to 2.5rem)
      animationDelay: `${Math.random() * 0.5}s`, // Random delay
    });
    
    setHearts(Array.from({ length: 8 }, createHeart));
  }, []);

  return (
    <div
      className="fixed inset-0 pointer-events-none z-50 overflow-hidden"
      aria-hidden="true"
    >
      {hearts.map(heart => (
        <motion.div
          key={heart.id}
          className="absolute bottom-0 text-green-500"
          style={{
            left: heart.left,
            fontSize: heart.size,
          }}
          initial={{ y: 0, opacity: 1 }}
          animate={{
            y: '-100vh',
            opacity: 0,
            scale: [1, 1.2, 1],
            rotate: [0, Math.random() > 0.5 ? 15: -15, 0],
          }}
          transition={{
            duration: 1.5 + Math.random() * 0.5,
            ease: "easeOut",
            delay: parseFloat(heart.animationDelay),
          }}
        >
          💚
        </motion.div>
      ))}
    </div>
  );
}
