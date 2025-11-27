'use client';

import * as React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Briefcase, MapPin, CheckCircle, Clock } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';

interface JobPreviewCardProps {
  formData: any;
}

export function JobPreviewCard({ formData }: JobPreviewCardProps) {
  const { 
    title, 
    roleType, 
    experienceLevel,
    city, 
    remoteAllowed, 
    requiredSkills, 
    description,
    minSalary,
    maxSalary,
    currency,
    openings
  } = formData;

  const formatSalary = () => {
    if (minSalary && maxSalary) {
        const min = minSalary / 100000;
        const max = maxSalary / 100000;
        const currencySymbol = currency === 'INR' ? '₹' : '$';
        return `${currencySymbol}${min} - ${max} LPA`;
    }
    if(minSalary) {
        const currencySymbol = currency === 'INR' ? '₹' : '$';
        return `${currencySymbol}${minSalary / 100000} LPA`;
    }
    return "Not Disclosed";
  }

  const companyName = "Your Company Name"; // Placeholder
  const isVerified = true; // Placeholder

  const hasContent = title || roleType || city || requiredSkills?.length > 0 || description;

  if (!hasContent) {
      return (
          <Card className="w-full max-w-sm h-[500px] flex flex-col shadow-xl border-2 rounded-2xl overflow-hidden justify-center items-center bg-muted/30">
              <div className="text-center p-8">
                  <Briefcase className="w-16 h-16 mx-auto text-muted-foreground" />
                  <p className="mt-4 text-muted-foreground">Job preview will appear here as you fill out the form.</p>
              </div>
          </Card>
      );
  }

  return (
    <Card className="w-full max-w-sm h-[500px] flex flex-col shadow-xl border-2 rounded-2xl overflow-hidden">
      <CardHeader className="bg-card p-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
            <Briefcase className="w-6 h-6 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <CardTitle className="font-headline text-lg leading-tight">{title || <Skeleton className="h-6 w-3/4" />}</CardTitle>
            <div className="flex items-center text-sm text-muted-foreground mt-1">
              <span>{companyName}</span>
              {isVerified && <CheckCircle className="w-3 h-3 text-green-500 ml-1.5" />}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow overflow-y-auto">
        <div className="space-y-4 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>{city || 'Location'} {remoteAllowed && '· Remote friendly'}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{experienceLevel ? `${experienceLevel.replace('-', ' - ')} yrs` : 'Experience'} · {roleType || 'Role Type'}</span>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Top Skills</h4>
            <div className="flex flex-wrap gap-2">
              {requiredSkills && requiredSkills.length > 0 ? (
                requiredSkills.slice(0, 5).map((skill: string) => (
                  <Badge key={skill} variant="secondary">{skill}</Badge>
                ))
              ) : (
                <Badge variant="secondary">Skill 1</Badge>
              )}
               {requiredSkills && requiredSkills.length > 5 && (
                <Badge variant="outline">+{requiredSkills.length - 5} more</Badge>
              )}
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Description</h4>
            <p className="text-muted-foreground line-clamp-4">{description || "Your job description will appear here..."}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 border-t bg-card">
        <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
            <span>{formatSalary()}</span>
            <span>{openings || 1} opening{openings > 1 ? 's' : ''}</span>
        </div>
      </CardFooter>
    </Card>
  );
}
