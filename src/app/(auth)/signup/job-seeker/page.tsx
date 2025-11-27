'use client';

import { JobSeekerSignupForm } from '@/components/auth/JobSeekerSignupForm';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Link from 'next/link';

export default function JobSeekerSignupPage() {
  return (
    <Card className="w-full max-w-2xl">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-headline">
          Create Your Job Seeker Account
        </CardTitle>
        <CardDescription>
          Swipe on relevant jobs, answer quick questions, and get directly in
          touch with recruiters.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <JobSeekerSignupForm />
        <div className="mt-4 text-center text-sm">
          Looking to hire?{' '}
          <Link href="/signup/recruiter" className="underline text-primary">
            Sign up as a recruiter
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
