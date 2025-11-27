'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';

export default function Dashboard() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();

  useEffect(() => {
    if (isUserLoading) return; // Wait until user object is resolved
    
    if (!user) {
        router.replace('/login');
        return;
    }

    // In a real app, you would get user role from context/session/firestore
    const userRole = user?.role || 'student'; // Mock role, replace with dynamic role from user object later

    if (userRole === 'student' || userRole === 'graduate' || userRole === 'experienced') {
      router.replace('/dashboard/find-jobs');
    } else if (userRole === 'recruiter') {
      router.replace('/dashboard/recruiter');
    } else if (userRole === 'admin') {
      // router.replace('/dashboard/admin');
      // For now, redirect admin to find-jobs as admin dashboard is not built
       router.replace('/dashboard/find-jobs');
    } else {
        // Handle unknown role or redirect to login if not authenticated
        router.replace('/login');
    }
  }, [router, user, isUserLoading]);

  // Display a loading skeleton while redirecting
  return (
    <div className="space-y-4">
      <Skeleton className="h-12 w-1/4" />
      <div className="flex justify-center items-center h-96">
        <p className="text-muted-foreground">Loading your dashboard...</p>
      </div>
      <Skeleton className="h-64 w-full" />
    </div>
  );
}
