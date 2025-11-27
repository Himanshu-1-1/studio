'use client';

import React from 'react';
import type { Job } from '@/lib/types';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { JobCard } from './JobCard';
import { Check, X } from 'lucide-react';

interface TinderStyleJobCardProps {
  job: Job;
  isTop: boolean;
  onSwipe: (job: Job, direction: 'left' | 'right') => void;
}

const SWIPE_THRESHOLD = 120;

export function TinderStyleJobCard({ job, isTop, onSwipe }: TinderStyleJobCardProps) {
  const x = useMotionValue(0);

  // Card rotation based on drag position
  const rotate = useTransform(x, [-200, 200], [-15, 15]);

  // Card opacity and glow effects
  const greenGlow = useTransform(x, [0, 150], [0, 1]);
  const redGlow = useTransform(x, [-150, 0], [1, 0]);

  const handleDragEnd = (e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x > SWIPE_THRESHOLD) {
      onSwipe(job, 'right');
    } else if (info.offset.x < -SWIPE_THRESHOLD) {
      onSwipe(job, 'left');
    }
  };

  return (
    <motion.div
      className="absolute w-full h-full"
      style={{
        zIndex: isTop ? 10 : 1,
        x: isTop ? x : 0,
        rotate: isTop ? rotate : 0,
      }}
      drag={isTop ? 'x' : false}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.5}
      onDragEnd={handleDragEnd}
      initial={isTop ? { scale: 1, y: 0 } : { scale: 0.96, y: 10 }}
      animate={{ 
        scale: isTop ? 1 : 0.96, 
        y: isTop ? 0 : 10,
        transition: { type: 'spring', stiffness: 300, damping: 30 }
      }}
      whileDrag={isTop ? { scale: 1.02, cursor: 'grabbing', shadow: '2xl' } : {}}
      exit={{
        x: x.get() > 0 ? 500 : -500,
        opacity: 0,
        rotate: x.get() > 0 ? 20 : -20,
        transition: { duration: 0.3 },
      }}
    >
      {/* Visual Feedback Overlays */}
      {isTop && (
        <>
          <motion.div
            className="absolute inset-0 rounded-2xl pointer-events-none"
            style={{
              boxShadow: `0 0 40px rgba(0, 255, 0, ${greenGlow.get()})`,
              opacity: greenGlow,
            }}
          />
          <motion.div
            className="absolute inset-0 rounded-2xl pointer-events-none"
            style={{
              boxShadow: `0 0 40px rgba(255, 0, 0, ${redGlow.get()})`,
              opacity: redGlow,
            }}
          />
          <motion.div 
            style={{ opacity: greenGlow }} 
            className="absolute top-10 left-10 text-green-500 pointer-events-none"
          >
            <Check size={64} strokeWidth={3} />
          </motion.div>
          <motion.div 
            style={{ opacity: redGlow }} 
            className="absolute top-10 right-10 text-red-500 pointer-events-none"
          >
            <X size={64} strokeWidth={3} />
          </motion.div>
        </>
      )}
      
      <JobCard job={job} />
    </motion.div>
  );
}
