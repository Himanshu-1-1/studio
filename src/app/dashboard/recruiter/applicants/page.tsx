'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useUser, useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, Query } from 'firebase/firestore';
import type { Application } from '@/lib/types';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ApplicantRow } from '@/components/recruiter/ApplicantRow';
import { Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

function ApplicantsContent() {
  const { user } = useUser();
  const firestore = useFirestore();
  const searchParams = useSearchParams();
  const jobId = searchParams.get('jobId');

  const applicationsQuery = useMemoFirebase(() => {
    if (!user) return null;
    
    let q: Query = query(collection(firestore, 'applications'), where('recruiterId', '==', user.uid));
    
    if (jobId) {
      q = query(q, where('jobId', '==', jobId));
    }
    
    return q;
  }, [firestore, user, jobId]);

  const { data: applications, isLoading } = useCollection<Application>(applicationsQuery as Query<Application> | null);

  const cardTitle = jobId ? "Applicants for Selected Job" : "All Applicants";
  const cardDescription = jobId 
    ? "Review candidates who applied to this specific job."
    : "Review and manage all candidates who have applied to your job postings.";

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard/recruiter">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Applicants</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {jobId && (
        <Button variant="outline" asChild>
          <Link href="/dashboard/recruiter/applicants">View All Applicants</Link>
        </Button>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{cardTitle}</CardTitle>
          <CardDescription>{cardDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Candidate</TableHead>
                  <TableHead>Job Applied For</TableHead>
                  <TableHead>Match Score</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <ApplicantRow application={{} as Application} isLoading />
                <ApplicantRow application={{} as Application} isLoading />
                <ApplicantRow application={{} as Application} isLoading />
              </TableBody>
            </Table>
          ) : applications && applications.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Candidate</TableHead>
                  <TableHead>Job Applied For</TableHead>
                  <TableHead>Match Score</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((app) => (
                  <ApplicantRow key={app.id} application={app} />
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No applicants found.</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {jobId 
                  ? "No one has applied to this job yet." 
                  : "When candidates apply to your jobs, they will appear here."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function ApplicantsPage() {
  return (
    <Suspense fallback={<div>Loading applicants...</div>}>
      <ApplicantsContent />
    </Suspense>
  );
}
