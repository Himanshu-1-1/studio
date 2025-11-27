'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { TinderStyleJobCard } from './TinderStyleJobCard';
import type { Job, Application } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { X, Heart, Undo } from 'lucide-react';
import { AnimatePresence, useAnimationControls } from 'framer-motion';
import { HeartBalloonOverlay } from './HeartBalloonOverlay';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, serverTimestamp, query, where, addDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '../ui/skeleton';
import { mockJobs } from '@/lib/data';

type SwipeDirection = 'left' | 'right';
type HistoryItem = { job: Job; direction: SwipeDirection };

export function SwipeFeed() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [stack, setStack] = useState<Job[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showHearts, setShowHearts] = useState(false);
  const controls = useAnimationControls();
  
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
        setStack([]);
        return;
    }
  
    const appliedJobIds = new Set(appliedApplications?.map(app => app.jobId) || []);
    let availableJobs = (fetchedJobs || []).filter(job => !appliedJobIds.has(job.id));
    
    // If no jobs are fetched from Firestore OR the fetched jobs list is empty, use mock jobs
    if (availableJobs.length === 0) {
      const availableMockJobs = mockJobs.filter(job => !appliedJobIds.has(job.id));
      setStack(availableMockJobs);
    } else {
      setStack(availableJobs);
    }
    
    setIsLoading(false);
  
  }, [user, fetchedJobs, appliedApplications, isLoadingJobs, isLoadingApplied]);

  const currentJob = stack[0];

  const handleSwipe = useCallback((job: Job, direction: SwipeDirection) => {
    setHistory((prev) => [{ job, direction }, ...prev]);
    setStack((prev) => prev.slice(1));

    if (direction === 'right' && user && firestore) {
      setShowHearts(true);
      setTimeout(() => setShowHearts(false), 2000);

      const applicationData = {
        candidateId: user.uid,
        jobId: job.id,
        jobTitle: job.title,
        companyId: job.companyId,
        companyName: job.companyName,
        recruiterId: job.postedBy,
        answers: [],
        resumeUrl: '',
        matchScore: Math.floor(Math.random() * 30) + 70,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      } as Omit<Application, 'id'>;

      const applicationsCollection = collection(firestore, 'applications');
      addDoc(applicationsCollection, applicationData).then(() => {
        toast({
          title: "Application Sent!",
          description: `You've applied for the ${job.title} position.`,
        });
      });
    }
  }, [user, firestore, toast]);

  const triggerSwipe = (direction: 'left' | 'right') => {
    if (!currentJob) return;

    const swipeAnimation = direction === 'right'
      ? { x: 500, opacity: 0, rotate: 20, transition: { duration: 0.3 } }
      : { x: -500, opacity: 0, rotate: -20, transition: { duration: 0.3 } };

    controls.start(swipeAnimation).then(() => {
      handleSwipe(currentJob, direction);
    });
  }

  const handleUndo = () => {
    if (history.length > 0) {
      const lastAction = history[0];
      setHistory((prev) => prev.slice(1));
      setStack((prev) => [lastAction.job, ...prev]);

      // If the undone action was a 'right' swipe, you might want to handle the created application.
      // For simplicity here, we are just restoring the card to the stack.
    }
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
                <Skeleton className="w-16 h-16 rounded-full" />
            </div>
        </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-4 gap-6">
      {showHearts && <HeartBalloonOverlay />}
      <div className="relative w-full max-w-sm h-[500px] flex items-center justify-center">
        <AnimatePresence>
          {stack.length > 0 ? (
            stack.map((job, index) => {
              const isTop = index === 0;
              return (
                <TinderStyleJobCard
                  key={job.id}
                  job={job}
                  isTop={isTop}
                  onSwipe={handleSwipe}
                  animationControls={controls}
                />
              );
            }).reverse() // Reverse to render the top card last (visually on top)
          ) : (
            !isLoading && (
              <div className="text-center p-8 bg-card rounded-2xl shadow-md w-full">
                  <h3 className="text-xl font-semibold font-headline text-slate-700">That’s all for now!</h3>
                  <p className="text-muted-foreground mt-2 text-sm">New opportunities will appear as soon as they match your profile.</p>
              </div>
            )
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          className="w-16 h-16 rounded-full bg-white shadow-lg hover:bg-amber-100 active:scale-95"
          onClick={handleUndo}
          disabled={history.length === 0}
          aria-label="Undo last swipe"
        >
          <Undo className="h-8 w-8 text-amber-500" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="w-20 h-20 rounded-full bg-white shadow-lg hover:bg-red-100 active:scale-95"
          onClick={() => triggerSwipe('left')}
          disabled={stack.length === 0}
          aria-label="Skip job"
        >
          <X className="h-10 w-10 text-red-500" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="w-20 h-20 rounded-full bg-white shadow-lg hover:bg-green-100 active:scale-95"
          onClick={() => triggerSwipe('right')}
          disabled={stack.length === 0}
          aria-label="I'm interested"
        >
          <Heart className="h-10 w-10 text-green-500" />
        </Button>
      </div>
    </div>
  );
}
