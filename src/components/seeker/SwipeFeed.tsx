
'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { JobCard } from './JobCard';
import type { Job, Application } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { X, Heart, Undo } from 'lucide-react';
import { AnimatePresence, motion, PanInfo } from 'framer-motion';
import { HeartBalloonOverlay } from './HeartBalloonOverlay';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, serverTimestamp, query, where, addDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '../ui/skeleton';
import { mockJobs } from '@/lib/data';

const SWIPE_THRESHOLD = 50;

export function SwipeFeed() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [history, setHistory] = useState<{ job: Job, direction: 'like' | 'dislike' }[]>([]);
  const [isSwiping, setIsSwiping] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'like' | 'dislike' | null>(null);
  const [showHearts, setShowHearts] = useState(false);

  const jobsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'jobs'), where('isActive', '==', true));
  }, [firestore, user]);

  const { data: fetchedJobs, isLoading: isLoadingJobs } = useCollection<Job>(jobsQuery);

  const appliedJobsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'applications'), where('candidateId', '==', user.uid));
  }, [firestore, user]);

  const { data: appliedApplications, isLoading: isLoadingApplied } = useCollection<Application>(appliedJobsQuery);


  useEffect(() => {
    if (isLoadingJobs || isLoadingApplied) {
      return;
    }

    if (!user) {
        setIsLoading(false);
        setJobs([]);
        return;
    }

    let availableJobs: Job[] = [];

    if (fetchedJobs) {
      const appliedJobIds = new Set(appliedApplications?.map(app => app.jobId) || []);
      availableJobs = fetchedJobs.filter(job => !appliedJobIds.has(job.id));
    }

    // If after fetching and filtering, there are no jobs from Firestore, use mock data.
    if (availableJobs.length === 0) {
      const appliedJobIds = new Set(appliedApplications?.map(app => app.jobId) || []);
      const availableMockJobs = mockJobs.filter(job => !appliedJobIds.has(job.id));
      setJobs(availableMockJobs);
    } else {
      setJobs(availableJobs);
    }
    
    setIsLoading(false);

  }, [user, fetchedJobs, appliedApplications, isLoadingJobs, isLoadingApplied]);


  const activeIndex = jobs.length - 1;
  const activeJob = useMemo(() => jobs[activeIndex], [jobs, activeIndex]);

  const handleSwipeAction = useCallback((direction: 'like' | 'dislike') => {
    if (!activeJob || isSwiping) return;

    setIsSwiping(true);
    setSwipeDirection(direction);

    // Check if the job is from Firestore before attempting to write
    const isFirestoreJob = fetchedJobs?.some(job => job.id === activeJob.id);

    if (direction === 'like' && user && firestore && isFirestoreJob) {
        setShowHearts(true);
        setTimeout(() => setShowHearts(false), 2000);

        const applicationData = {
          candidateId: user.uid,
          jobId: activeJob.id,
          recruiterId: activeJob.postedBy,
          companyId: activeJob.companyId,
          answers: [], // Correctly an empty array for now
          resumeUrl: '', // This would be populated from the user's profile
          matchScore: Math.floor(Math.random() * 30) + 70, // Use the same logic as JobCard for now
          status: 'pending',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        } as Omit<Application, 'id'>;

        const applicationsCollection = collection(firestore, 'applications');
        addDoc(applicationsCollection, applicationData).then(() => {
          toast({
              title: "Application Sent!",
              description: `You've applied for the ${activeJob.title} position.`,
          });
        });
    } else if (direction === 'like' && !isFirestoreJob) {
        // This handles liking a mock job
        toast({
            title: "Liked!",
            description: `You liked the ${activeJob.title} position. (This is a demo action)`,
        });
    }
    
    // This timeout ensures the exit animation completes before the state updates
    setTimeout(() => {
        setHistory((prev) => [...prev, { job: activeJob, direction }]);
        setJobs((prev) => prev.slice(0, prev.length - 1));
        setIsSwiping(false);
        setSwipeDirection(null);
    }, 400);

  }, [activeJob, isSwiping, user, firestore, toast, fetchedJobs]);

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
  
  if (isLoading) {
      return (
          <div className="flex flex-col items-center justify-center w-full h-full p-4 gap-6">
              <div className="relative w-full max-w-sm h-[500px] flex items-center justify-center">
                  <Skeleton className="w-full h-full rounded-2xl" />
              </div>
              <div className="flex items-center gap-4">
                  <Skeleton className="w-16 h-16 rounded-full" />
                  <Skeleton className="w-20 h-20 rounded-full" />
                  <Skeleton className="w-20 h-20 rounded-full" />
              </div>
          </div>
      );
  }

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
                <h3 className="text-xl font-semibold font-headline text-slate-700">That’s all for now!</h3>
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
