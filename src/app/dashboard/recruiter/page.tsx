'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth, useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import type { Job, Application } from '@/lib/types';
import { collection, query, where } from 'firebase/firestore';
import { PlusCircle, ArrowRight, Briefcase, Users, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';

export default function RecruiterDashboard() {
  const { user } = useAuth();
  const firestore = useFirestore();

  const jobsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(firestore, 'jobs'), where('postedBy', '==', user.uid));
  }, [firestore, user]);

  const { data: jobs, isLoading: isLoadingJobs } = useCollection<Job>(jobsQuery);

  const applicationsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(firestore, 'applications'), where('recruiterId', '==', user.uid));
  }, [firestore, user]);

  const { data: applications, isLoading: isLoadingApps } = useCollection<Application>(applicationsQuery);

  const conversationsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(firestore, 'conversations'), where('participants', 'array-contains', user.uid));
  }, [firestore, user]);

  const { data: conversations, isLoading: isLoadingConvos } = useCollection(conversationsQuery);


  const stats = [
    { name: 'Active Jobs', value: jobs?.length ?? 0, icon: <Briefcase/>, isLoading: isLoadingJobs, href: '/dashboard/recruiter/jobs/new' },
    { name: 'Total Applicants', value: applications?.length ?? 0, icon: <Users/>, isLoading: isLoadingApps, href: '/dashboard/recruiter/applicants' },
    { name: 'New Messages', value: conversations?.length ?? 0, icon: <MessageSquare />, isLoading: isLoadingConvos, href: '/dashboard/recruiter/messages' },
  ];

  const recentJobs = jobs?.slice(0, 3) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-bold font-headline">Recruiter Dashboard</h1>
            <p className="text-muted-foreground">Here's what's happening with your job postings.</p>
        </div>
        <Button asChild size="lg">
            <Link href="/dashboard/recruiter/jobs/new">
                <PlusCircle className="mr-2 h-5 w-5" />
                Post a New Job
            </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.name}</CardTitle>
              <div className="text-muted-foreground">{stat.icon}</div>
            </CardHeader>
            <CardContent>
              {stat.isLoading ? (
                <Skeleton className="h-8 w-1/4 mt-1" />
              ) : (
                <div className="text-2xl font-bold">{stat.value}</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Recent Jobs List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Jobs</CardTitle>
          <CardDescription>A summary of your most recent job postings.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
             {isLoadingJobs ? (
              <>
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </>
            ) : recentJobs.length > 0 ? (
                recentJobs.map((job) => (
                <div key={job.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                    <div>
                    <p className="font-semibold">{job.title}</p>
                    <p className="text-sm text-muted-foreground">{job.location.city} - {job.openings} opening{job.openings > 1 ? 's' : ''}</p>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                    <Link href={`/dashboard/recruiter/applicants?jobId=${job.id}`}>
                        View Applicants <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                    </Button>
                </div>
                ))
            ) : (
                 <div className="text-center py-8">
                    <Briefcase className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">No jobs posted yet.</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Post a new job to start finding talent.
                    </p>
                    <Button asChild className="mt-4">
                        <Link href="/dashboard/recruiter/jobs/new">Post a Job</Link>
                    </Button>
                </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
