'use client';

import React from 'react';
import type { Job } from '@/lib/types';
import { motion, useMotionValue, useTransform, PanInfo, AnimationControls } from 'framer-motion';
import { JobCard } from './JobCard';
import { Check, X } from 'lucide-react';

interface TinderStyleJobCardProps {
  job: Job;
  isTop: boolean;
  onSwipe: (job: Job, direction: 'left' | 'right') => void;
  animationControls: AnimationControls;
}

const SWIPE_DISTANCE_THRESHOLD = 80;
const SWIPE_VELOCITY_THRESHOLD = 0.4;

export function TinderStyleJobCard({ job, isTop, onSwipe, animationControls }: TinderStyleJobCardProps) {
  const x = useMotionValue(0);

  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const greenGlow = useTransform(x, [0, 150], [0, 1]);
  const redGlow = useTransform(x, [-150, 0], [1, 0]);

  const handleDragEnd = (e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const distance = info.offset.x;
    const velocity = info.velocity.x;

    if (distance > SWIPE_DISTANCE_THRESHOLD || velocity > SWIPE_VELOCITY_THRESHOLD) {
      animationControls.start({ x: 500, opacity: 0, rotate: 20, transition: { duration: 0.3 } }).then(() => {
        onSwipe(job, 'right');
      });
    } else if (distance < -SWIPE_DISTANCE_THRESHOLD || velocity < -SWIPE_VELOCITY_THRESHOLD) {
      animationControls.start({ x: -500, opacity: 0, rotate: -20, transition: { duration: 0.3 } }).then(() => {
        onSwipe(job, 'left');
      });
    } else {
        animationControls.start({ x: 0, rotate: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 25 } })
    }
  };

  return (
    <motion.div
      className="absolute w-full h-full"
      animate={animationControls}
      style={{
        zIndex: isTop ? 10 : 1,
        x: isTop ? x : 0,
        rotate: isTop ? rotate : 0,
        touchAction: 'pan-y',
      }}
      drag={isTop ? 'x' : false}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.5}
      onDragEnd={handleDragEnd}
      // This initial animation makes the next card scale up smoothly.
      initial={isTop ? { scale: 1, y: 0 } : { scale: 0.96, y: 10 }}
      // Animate the next card into place when the top one is removed
      animate={isTop ? animationControls : { scale: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 25 } }}
      // Use exit animation for the card that is being swiped away
      exit={{ opacity: 0, transition: { duration: 0.2 } }}
      whileDrag={isTop ? { scale: 1.02, cursor: 'grabbing' } : {}}
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
