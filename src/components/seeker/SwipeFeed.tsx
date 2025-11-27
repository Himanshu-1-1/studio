'use client';

import React, { useState, useMemo } from 'react';
import { JobCard } from './JobCard';
import { mockJobs } from '@/lib/data';
import type { Job } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { X, Heart, Undo } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export function SwipeFeed() {
  const [jobs, setJobs] = useState<Job[]>(mockJobs);
  const [history, setHistory] = useState<Job[]>([]);
  const [direction, setDirection] = useState<'like' | 'dislike' | null>(null);

  const activeIndex = jobs.length - 1;
  const activeJob = useMemo(() => jobs[activeIndex], [jobs, activeIndex]);

  const handleSwipe = (swipeDirection: 'like' | 'dislike') => {
    if (activeIndex < 0) return;
    setDirection(swipeDirection);
    
    // The `onAnimationComplete` will handle removing the card
  };

  const handleUndo = () => {
    if (history.length > 0) {
      const lastJob = history[history.length - 1];
      setJobs((prev) => [...prev, lastJob]);
      setHistory((prev) => prev.slice(0, -1));
      setDirection(null);
    }
  };

  const animationComplete = () => {
    setHistory((prev) => [...prev, activeJob]);
    setJobs((prev) => prev.slice(0, activeIndex));
    setDirection(null);
  }

  const variants = {
    initial: { scale: 0.95, y: 20, opacity: 0 },
    animate: { scale: 1, y: 0, opacity: 1, transition: { duration: 0.3 } },
    exit: (custom: 'like' | 'dislike') => ({
      x: custom === 'like' ? 300 : -300,
      opacity: 0,
      rotate: custom === 'like' ? 15 : -15,
      transition: { duration: 0.4 }
    }),
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-4 gap-6">
      <div className="relative w-full max-w-sm h-[500px] flex items-center justify-center">
        <AnimatePresence custom={direction}>
          {activeJob ? (
             <motion.div
                key={activeJob.id}
                custom={direction}
                variants={variants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="absolute"
                onAnimationComplete={animationComplete}
              >
                <JobCard job={activeJob} />
              </motion.div>
          ) : (
            <div className="text-center p-8 bg-card rounded-lg shadow-md">
                <h3 className="text-xl font-bold font-headline">That's all for now!</h3>
                <p className="text-muted-foreground mt-2">Check back later for new job opportunities.</p>
            </div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          className="w-16 h-16 rounded-full bg-white shadow-lg hover:bg-amber-100"
          onClick={handleUndo}
          disabled={history.length === 0}
        >
          <Undo className="h-8 w-8 text-amber-500" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="w-20 h-20 rounded-full bg-white shadow-lg hover:bg-red-100"
          onClick={() => handleSwipe('dislike')}
          disabled={activeIndex < 0}
        >
          <X className="h-10 w-10 text-red-500" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="w-20 h-20 rounded-full bg-white shadow-lg hover:bg-green-100"
          onClick={() => handleSwipe('like')}
          disabled={activeIndex < 0}
        >
          <Heart className="h-10 w-10 text-green-500" />
        </Button>
      </div>
    </div>
  );
}
