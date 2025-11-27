'use client';

import { RecruiterSignupForm } from '@/components/auth/RecruiterSignupForm';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Link from 'next/link';

export default function RecruiterSignupPage() {
  return (
    <Card className="w-full max-w-2xl">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-headline">
          Create Your Recruiter Account
        </CardTitle>
        <CardDescription>
          Post jobs, review matched candidates, and chat with verified job
          seekers.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RecruiterSignupForm />
        <div className="mt-4 text-center text-sm">
          Looking for a job?{' '}
          <Link href="/signup/job-seeker" className="underline text-primary">
            Sign up as a job seeker
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
