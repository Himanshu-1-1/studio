'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Link from 'next/link';

export default function SignupPage() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-headline">Join HireSwipe</CardTitle>
        <CardDescription>
          Are you looking for a job or are you here to hire?
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/signup/job-seeker"
          className="bg-primary text-primary-foreground hover:bg-primary/90 text-center p-6 rounded-lg transition-all"
        >
          <h3 className="font-bold text-lg">I'm a Job Seeker</h3>
          <p className="text-sm text-primary-foreground/80 mt-1">
            Find your next career move.
          </p>
        </Link>
        <Link
          href="/signup/recruiter"
          className="bg-secondary text-secondary-foreground hover:bg-secondary/80 text-center p-6 rounded-lg transition-all"
        >
          <h3 className="font-bold text-lg">I'm a Recruiter</h3>
          <p className="text-sm text-secondary-foreground/80 mt-1">
            Hire the best talent.
          </p>
        </Link>
      </CardContent>
      <div className="mt-4 text-center text-sm p-6 pt-0">
          Already have an account?{" "}
          <Link href="/login" className="underline text-primary">
            Log in
          </Link>
        </div>
    </Card>
  );
}
