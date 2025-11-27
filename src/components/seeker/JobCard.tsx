import type { Job } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Briefcase, MapPin, CheckCircle } from 'lucide-react';

interface JobCardProps {
  job: Job;
}

export function JobCard({ job }: JobCardProps) {
  // Mock match score for demonstration
  const matchScore = Math.floor(Math.random() * 30) + 70;

  return (
    <Card className="w-full max-w-sm h-[500px] flex flex-col shadow-xl border-2 rounded-2xl overflow-hidden">
      <CardHeader className="bg-card p-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
            <Briefcase className="w-6 h-6 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <CardTitle className="font-headline text-lg leading-tight">{job.title}</CardTitle>
            <div className="flex items-center text-sm text-muted-foreground mt-1">
              <span>{job.companyName}</span>
              <CheckCircle className="w-3 h-3 text-green-500 ml-1.5" />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow overflow-y-auto">
        <div className="space-y-4 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>{job.location.city}{job.location.remoteAllowed && ', Remote'}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Briefcase className="w-4 h-4" />
            <span>{job.experienceLevel} years</span>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Top Skills</h4>
            <div className="flex flex-wrap gap-2">
              {job.requiredSkills.slice(0, 5).map((skill) => (
                <Badge key={skill} variant="secondary">{skill}</Badge>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Description</h4>
            <p className="text-muted-foreground line-clamp-4">{job.description}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 border-t bg-card">
        <div className="flex items-center justify-between w-full">
            <span className="text-xs text-muted-foreground">Match Score</span>
            <div className="flex items-center gap-2">
                <span className={`font-bold text-lg ${matchScore > 85 ? 'text-green-500' : 'text-amber-500'}`}>
                    {matchScore}%
                </span>
            </div>
        </div>
      </CardFooter>
    </Card>
  );
}
