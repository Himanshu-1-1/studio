'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { doc, getDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';

export default function Dashboard() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  useEffect(() => {
    if (isUserLoading) return; // Wait until user object is resolved
    
    if (!user) {
        router.replace('/login');
        return;
    }

    const fetchRoleAndRedirect = async () => {
      const userDocRef = doc(firestore, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const role = userDocSnap.data()?.role;
        if (role === 'student' || role === 'graduate' || role === 'experienced') {
          router.replace('/dashboard/find-jobs');
        } else if (role === 'recruiter') {
          router.replace('/dashboard/recruiter');
        } else if (role === 'admin') {
          // For now, redirect admin to find-jobs as admin dashboard is not built
           router.replace('/dashboard/find-jobs');
        } else {
            // Handle unknown role or redirect to login if not authenticated
            router.replace('/login');
        }
      } else {
        // User doc doesn't exist, something is wrong
        router.replace('/login');
      }
    };

    fetchRoleAndRedirect();

  }, [router, user, isUserLoading, firestore]);

  // Display a loading skeleton while redirecting
  return (
    <div className="space-y-4 p-8">
      <Skeleton className="h-12 w-1/4" />
      <div className="flex justify-center items-center h-96">
        <p className="text-muted-foreground">Loading your dashboard...</p>
      </div>
      <Skeleton className="h-64 w-full" />
    </div>
  );
}
