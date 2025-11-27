'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { FileSearch } from "lucide-react";

// Mock data - replace with Firestore data later
const mockApplications = [
    { id: 'app1', jobTitle: 'Frontend Developer', companyName: 'Innovate Inc.', status: 'pending', appliedOn: '2023-10-26' },
    { id: 'app2', jobTitle: 'UX/UI Designer Intern', companyName: 'Creative Solutions', status: 'accepted', appliedOn: '2023-10-24' },
    { id: 'app3', jobTitle: 'Data Scientist', companyName: 'DataDriven Co.', status: 'rejected', appliedOn: '2023-10-22' },
];

const statusVariant = {
    pending: 'secondary',
    accepted: 'default',
    rejected: 'destructive',
} as const;


export default function ApplicationsPage() {
    const applications = mockApplications; // Use mock data for now

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
                    {applications.length > 0 ? (
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
                                    <TableRow key={app.id}>
                                        <TableCell className="font-medium">{app.jobTitle}</TableCell>
                                        <TableCell>{app.companyName}</TableCell>
                                        <TableCell>{new Date(app.appliedOn).toLocaleDateString()}</TableCell>
                                        <TableCell className="text-right">
                                            <Badge variant={statusVariant[app.status as keyof typeof statusVariant]} className="capitalize">
                                                {app.status}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
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
