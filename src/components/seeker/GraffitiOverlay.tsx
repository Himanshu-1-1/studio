'use client';

import { motion } from 'framer-motion';

export function GraffitiOverlay() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: 'easeOut',
      },
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.5,
        ease: 'easeIn',
      },
    },
  };

  const cardVariants = {
    hidden: { scale: 0.5, rotate: -15, opacity: 0 },
    visible: {
      scale: 1,
      rotate: 5,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 260,
        damping: 20,
        delay: 0.1,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40"
    >
      <motion.div
        variants={cardVariants}
        className="relative transform -rotate-3 overflow-hidden rounded-2xl bg-gradient-to-tr from-blue-600 via-fuchsia-500 to-orange-400 p-1 shadow-2xl"
      >
        <div className="relative rounded-xl bg-gray-800/50 p-8 text-center text-white backdrop-blur-sm">
          <h2 className="font-headline text-5xl font-bold tracking-tighter text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]">
            Match Energy!
          </h2>
          <p className="mt-2 text-lg font-semibold text-gray-200 drop-shadow-md">
            💥 Nice Swipe 💥
          </p>
          <div className="pointer-events-none absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/spray-paint.png')] opacity-10" />
        </div>
      </motion.div>
    </motion.div>
  );
}
