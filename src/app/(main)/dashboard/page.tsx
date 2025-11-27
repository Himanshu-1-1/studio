'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

export default function Dashboard() {
  const router = useRouter();

  useEffect(() => {
    // In a real app, you would get user role from context/session
    const userRole = 'student'; // Mock role

    if (userRole === 'student' || userRole === 'graduate' || userRole === 'experienced') {
      router.replace('/dashboard/seeker');
    } else if (userRole === 'recruiter') {
      router.replace('/dashboard/recruiter');
    } else if (userRole === 'admin') {
      router.replace('/dashboard/admin');
    } else {
        // Handle unknown role or redirect to login
        router.replace('/login');
    }
  }, [router]);

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
