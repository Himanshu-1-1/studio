'use client';

import { useDoc, useFirestore, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import type { Application, Job, JobSeekerProfile } from '@/lib/types';
import { doc } from 'firebase/firestore';
import { TableCell, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const statusVariant = {
  pending: 'secondary',
  accepted: 'default',
  rejected: 'destructive',
} as const;

interface ApplicantRowProps {
  application: Application;
  isLoading?: boolean;
}

export function ApplicantRow({ application, isLoading }: ApplicantRowProps) {
  const firestore = useFirestore();
  const { toast } = useToast();

  const { data: job, isLoading: isJobLoading } = useDoc<Job>(
    useMemoFirebase(
      () => (application.jobId ? doc(firestore, 'jobs', application.jobId) : null),
      [firestore, application.jobId]
    )
  );

  const { data: candidate, isLoading: isCandidateLoading } = useDoc<JobSeekerProfile>(
    useMemoFirebase(
      () =>
        application.candidateId ? doc(firestore, 'jobSeekerProfiles', application.candidateId) : null,
      [firestore, application.candidateId]
    )
  );

  const handleStatusChange = (newStatus: 'accepted' | 'rejected') => {
    if (!application.id) return;
    const appRef = doc(firestore, 'applications', application.id);
    updateDocumentNonBlocking(appRef, { status: newStatus });
    toast({
        title: `Application ${newStatus}`,
        description: `${candidate?.fullName}'s application for ${job?.title} has been updated.`,
    });
  };

  if (isLoading || isJobLoading || isCandidateLoading) {
    return (
      <TableRow>
        <TableCell>
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        </TableCell>
        <TableCell>
          <Skeleton className="h-4 w-40" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-5 w-12" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-6 w-20" />
        </TableCell>
        <TableCell className="text-right">
          <Skeleton className="h-8 w-8 ml-auto" />
        </TableCell>
      </TableRow>
    );
  }

  if (!job || !candidate) {
    // This can happen if a related job or profile is deleted.
    return null;
  }

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={`https://i.pravatar.cc/150?u=${candidate.userId}`} />
            <AvatarFallback>{candidate.fullName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{candidate.fullName}</p>
            <p className="text-sm text-muted-foreground">{candidate.domain}</p>
          </div>
        </div>
      </TableCell>
      <TableCell>{job.title}</TableCell>
      <TableCell>
        <span
          className={`font-semibold ${
            application.matchScore > 85 ? 'text-green-600' : 'text-amber-600'
          }`}
        >
          {application.matchScore}%
        </span>
      </TableCell>
      <TableCell>
        <Badge
          variant={statusVariant[application.status as keyof typeof statusVariant]}
          className="capitalize"
        >
          {application.status}
        </Badge>
      </TableCell>
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>View Profile</DropdownMenuItem>
            <DropdownMenuItem>Message Candidate</DropdownMenuItem>
            {application.status !== 'accepted' && (
                <DropdownMenuItem onClick={() => handleStatusChange('accepted')} className="text-green-600 focus:text-green-700">
                    Accept
                </DropdownMenuItem>
            )}
            {application.status !== 'rejected' && (
                 <DropdownMenuItem onClick={() => handleStatusChange('rejected')} className="text-red-600 focus:text-red-700">
                    Reject
                </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
