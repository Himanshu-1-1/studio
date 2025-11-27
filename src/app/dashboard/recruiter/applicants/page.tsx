'use client';

import { useState } from 'react';
import { useAuth, useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import type { Application, Job, JobSeekerProfile } from '@/lib/types';
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
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ApplicantRow } from '@/components/recruiter/ApplicantRow';
import { Skeleton } from '@/components/ui/skeleton';
import { Users } from 'lucide-react';

export default function ApplicantsPage() {
  const { user } = useAuth();
  const firestore = useFirestore();

  const applicationsQuery = useMemoFirebase(() => {
    if (!user) return null;
    // Query applications where the recruiter is the one who received it
    return query(collection(firestore, 'applications'), where('recruiterId', '==', user.uid));
  }, [firestore, user]);

  const { data: applications, isLoading } = useCollection<Application>(applicationsQuery);

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

      <Card>
        <CardHeader>
          <CardTitle>All Applicants</CardTitle>
          <CardDescription>
            Review and manage all candidates who have applied to your job postings.
          </CardDescription>
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
                {/* Render skeleton loaders */}
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
              <h3 className="mt-4 text-lg font-semibold">No applicants yet.</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                When candidates apply to your jobs, they will appear here.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
