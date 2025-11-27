'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { mockJobs } from '@/lib/data';
import { PlusCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function RecruiterDashboard() {
  const stats = [
    { name: 'Active Jobs', value: '4' },
    { name: 'Total Applicants', value: '128' },
    { name: 'New Messages', value: '3' },
  ];

  const recentJobs = mockJobs.slice(0, 3);

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
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Recent Jobs List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentJobs.map((job) => (
              <div key={job.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                <div>
                  <p className="font-semibold">{job.title}</p>
                  <p className="text-sm text-muted-foreground">{job.location.city} - {job.openings} openings</p>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="#">
                    View Applicants <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
