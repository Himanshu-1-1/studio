'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { JobCard } from './JobCard';
import { mockJobs } from '@/lib/data';
import type { Job, Application } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { X, Heart, Undo } from 'lucide-react';
import { AnimatePresence, motion, PanInfo } from 'framer-motion';
import { HeartBalloonOverlay } from './HeartBalloonOverlay';
import { useAuth, useFirestore, addDocumentNonBlocking } from '@/firebase';
import { collection, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

const SWIPE_THRESHOLD = 50;

export function SwipeFeed() {
  const [jobs, setJobs] = useState<Job[]>(mockJobs);
  const [history, setHistory] = useState<{ job: Job, direction: 'like' | 'dislike' }[]>([]);
  const [isSwiping, setIsSwiping] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'like' | 'dislike' | null>(null);
  const [showHearts, setShowHearts] = useState(false);
  const { user } = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();

  const activeIndex = jobs.length - 1;
  const activeJob = useMemo(() => jobs[activeIndex], [jobs, activeIndex]);

  const handleSwipeAction = useCallback((direction: 'like' | 'dislike') => {
    if (!activeJob || isSwiping || !user) return;

    setIsSwiping(true);
    setSwipeDirection(direction);

    if (direction === 'like') {
      setShowHearts(true);
      setTimeout(() => setShowHearts(false), 1500);

      const applicationData = {
        candidateId: user.uid,
        jobId: activeJob.id,
        recruiterId: activeJob.postedBy,
        companyId: activeJob.companyId,
        answers: [], // Will be filled in when screening questions are implemented
        resumeUrl: '', // This should be retrieved from the user's profile
        matchScore: Math.floor(Math.random() * 30) + 70, // Temporary random score
        status: 'pending' as const,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const applicationsCollection = collection(firestore, 'applications');
      addDocumentNonBlocking(applicationsCollection, applicationData);

      toast({
        title: "Application Sent!",
        description: `You've applied for the ${activeJob.title} position.`,
      });
    }

    setTimeout(() => {
        setHistory((prev) => [...prev, { job: activeJob, direction }]);
        setJobs((prev) => prev.slice(0, prev.length - 1));
        setIsSwiping(false);
        setSwipeDirection(null);
    }, 400); // Wait for exit animation to complete

  }, [activeJob, isSwiping, user, firestore, toast]);

  const handleUndo = () => {
    if (history.length > 0) {
      const lastAction = history[history.length - 1];
      setJobs((prev) => [...prev, lastAction.job]);
      setHistory((prev) => prev.slice(0, -1));
    }
  };

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (Math.abs(info.offset.x) > SWIPE_THRESHOLD) {
      const direction = info.offset.x > 0 ? 'like' : 'dislike';
      handleSwipeAction(direction);
    }
  };

  const variants = {
    initial: { scale: 0.95, y: 30, opacity: 0.8 },
    animate: { 
      scale: 1, 
      y: 0, 
      opacity: 1, 
      transition: { type: 'spring', stiffness: 300, damping: 30, duration: 0.3 } 
    },
    exit: (customDirection: 'like' | 'dislike') => ({
      x: customDirection === 'like' ? 400 : -400,
      opacity: 0,
      rotate: customDirection === 'like' ? 20 : -20,
      transition: { duration: 0.4, ease: 'easeIn' }
    }),
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-4 gap-6">
      {showHearts && <HeartBalloonOverlay />}
      <div className="relative w-full max-w-sm h-[500px] flex items-center justify-center">
        <AnimatePresence>
          {activeJob ? (
            <>
              <div className="absolute w-full h-full rounded-2xl bg-secondary transform-gpu scale-95 top-2" />
               <motion.div
                  key={activeJob.id}
                  custom={swipeDirection}
                  variants={variants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  drag="x"
                  dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                  onDragEnd={handleDragEnd}
                  className="absolute cursor-grab active:cursor-grabbing"
                >
                  <JobCard job={activeJob} />
                </motion.div>
            </>
          ) : (
            <div className="text-center p-8 bg-card rounded-2xl shadow-md w-full">
                <h3 className="text-xl font-semibold font-headline text-slate-700">That’s all for your profile for now.</h3>
                <p className="text-muted-foreground mt-2 text-sm">New opportunities will appear as soon as they match your profile.</p>
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
          aria-label="Undo last swipe"
        >
          <Undo className="h-8 w-8 text-amber-500" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="w-20 h-20 rounded-full bg-white shadow-lg hover:bg-red-100"
          onClick={() => handleSwipeAction('dislike')}
          disabled={!activeJob || isSwiping}
          aria-label="Skip job"
        >
          <X className="h-10 w-10 text-red-500" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="w-20 h-20 rounded-full bg-white shadow-lg hover:bg-green-100"
          onClick={() => handleSwipeAction('like')}
          disabled={!activeJob || isSwiping}
          aria-label="I'm interested"
        >
          <Heart className="h-10 w-10 text-green-500" />
        </Button>
      </div>
    </div>
  );
}
