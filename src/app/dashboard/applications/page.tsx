'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { FileSearch } from "lucide-react";
import { useUser, useCollection, useDoc, useFirestore, useMemoFirebase } from "@/firebase";
import type { Application, Job, Company } from "@/lib/types";
import { collection, query, where, doc } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";

const statusVariant = {
    pending: 'secondary',
    accepted: 'default',
    rejected: 'destructive',
} as const;

const ApplicationRow = ({ application }: { application: Application }) => {
    const firestore = useFirestore();

    const jobRef = useMemoFirebase(() => 
        application.jobId ? doc(firestore, 'jobs', application.jobId) : null
    , [firestore, application.jobId]);
    const { data: job, isLoading: isJobLoading } = useDoc<Job>(jobRef);

    const companyRef = useMemoFirebase(() =>
        application.companyId ? doc(firestore, 'companies', application.companyId) : null
    , [firestore, application.companyId]);
    const { data: company, isLoading: isCompanyLoading } = useDoc<Company>(companyRef);

    if (isJobLoading || isCompanyLoading) {
        return (
            <TableRow>
                <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-6 w-16 ml-auto" /></TableCell>
            </TableRow>
        );
    }

    if (!job || !company) {
        // This can happen if a related job or company is deleted.
        return null;
    }

    return (
        <TableRow>
            <TableCell className="font-medium">{job.title}</TableCell>
            <TableCell>{company.name}</TableCell>
            <TableCell>{application.createdAt.toDate().toLocaleDateString()}</TableCell>
            <TableCell className="text-right">
                <Badge variant={statusVariant[application.status as keyof typeof statusVariant]} className="capitalize">
                    {application.status}
                </Badge>
            </TableCell>
        </TableRow>
    );
};

export default function ApplicationsPage() {
    const { user } = useUser(); // Correctly use useUser hook
    const firestore = useFirestore();

    const applicationsQuery = useMemoFirebase(() => {
        if (!user) return null;
        return query(collection(firestore, 'applications'), where('candidateId', '==', user.uid));
    }, [firestore, user]);

    const { data: applications, isLoading } = useCollection<Application>(applicationsQuery);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold font-headline">Your Applications</h1>
                <p className="text-muted-foreground">Track the status of jobs you’ve applied for.</p>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Application History</CardTitle>
                    <CardDescription>A list of all your submitted applications.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                         <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Job Title</TableHead>
                                    <TableHead>Company</TableHead>
                                    <TableHead>Date Applied</TableHead>
                                    <TableHead className="text-right">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <ApplicationRow application={{} as Application} />
                                <ApplicationRow application={{} as Application} />
                                <ApplicationRow application={{} as Application} />
                            </TableBody>
                        </Table>
                    ) : applications && applications.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Job Title</TableHead>
                                    <TableHead>Company</TableHead>
                                    <TableHead>Date Applied</TableHead>
                                    <TableHead className="text-right">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {applications.map((app) => (
                                    <ApplicationRow key={app.id} application={app} />
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="text-center py-12">
                            <FileSearch className="mx-auto h-12 w-12 text-muted-foreground" />
                            <h3 className="mt-4 text-lg font-semibold">You haven’t applied to any jobs yet.</h3>
                            <p className="mt-1 text-sm text-muted-foreground">Start swiping to find your next opportunity.</p>
                            <Button asChild className="mt-6">
                                <Link href="/dashboard/find-jobs">Browse Jobs</Link>
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
