'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore } from '@/firebase';
import { useRouter } from 'next/navigation';
import { serverTimestamp, collection, addDoc } from 'firebase/firestore';
import { JobPreviewCard } from '@/components/recruiter/JobPreviewCard';
import { SkillsInput } from '@/components/recruiter/SkillsInput';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

const jobFormSchema = z.object({
  title: z.string().min(1, 'Job title is required.'),
  roleType: z.enum(['internship', 'full-time', 'part-time']),
  experienceLevel: z.enum(['fresher', '0-1', '1-3', '3+']),
  domain: z.string().min(1, 'Domain is required.'),
  openings: z.coerce.number().min(1, 'At least one opening is required.'),
  city: z.string().min(1, 'City is required.'),
  remoteAllowed: z.boolean().default(false),
  currency: z.string().optional(),
  minSalary: z.coerce.number().optional(),
  maxSalary: z.coerce.number().optional(),
  description: z.string().min(50, 'Description must be at least 50 characters.'),
  requiredSkills: z.array(z.string()).min(1, 'At least one skill is required.'),
  screeningQuestion1: z.string().optional(),
  screeningQuestion2: z.string().optional(),
  screeningQuestion3: z.string().optional(),
});

type JobFormValues = z.infer<typeof jobFormSchema>;

export default function NewJobPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<JobFormValues>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      title: '',
      roleType: 'full-time',
      experienceLevel: '1-3',
      domain: '',
      openings: 1,
      city: '',
      remoteAllowed: false,
      currency: 'INR',
      minSalary: undefined,
      maxSalary: undefined,
      description: '',
      requiredSkills: [],
      screeningQuestion1: '',
      screeningQuestion2: '',
      screeningQuestion3: '',
    },
  });

  const watchedValues = form.watch();

  const onSubmit = async (values: JobFormValues) => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: 'You must be logged in to post a job.',
      });
      return;
    }

    const screeningQuestions = [
      values.screeningQuestion1,
      values.screeningQuestion2,
      values.screeningQuestion3,
    ].filter((q): q is string => !!q);

    const jobData = {
      title: values.title,
      roleType: values.roleType,
      experienceLevel: values.experienceLevel,
      domain: values.domain,
      openings: values.openings,
      location: {
        city: values.city,
        remoteAllowed: values.remoteAllowed,
      },
      salaryRange: {
        currency: values.currency,
        min: values.minSalary,
        max: values.maxSalary,
      },
      description: values.description,
      requiredSkills: values.requiredSkills,
      screeningQuestions,
      postedBy: user.uid,
      companyId: 'comp-1', // Mock companyId
      companyName: 'Innovate Inc.', // Mock companyName
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    try {
      if (!firestore) {
        throw new Error("Firestore is not initialized");
      }
      const jobsCollectionRef = collection(firestore, 'jobs');
      await addDoc(jobsCollectionRef, jobData);
      
      toast({
        title: 'Job Posted Successfully!',
        description: 'Your job is now live for seekers to discover.',
      });
      form.reset();
      router.push('/dashboard/recruiter');
    } catch (error) {
      console.error('Error posting job:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to Post Job',
        description: 'An unexpected error occurred. Please try again.',
      });
    }
  };

  return (
    <div className="space-y-6">
       <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard/recruiter">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Post a New Job</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <Card className="lg:col-span-2 shadow-lg rounded-2xl">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Create a New Job Posting</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* Job Details Section */}
                <section className="space-y-4">
                  <h3 className="text-lg font-semibold font-headline border-b pb-2">Job Details</h3>
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Frontend Developer" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <FormField
                      control={form.control}
                      name="roleType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Role Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="full-time">Full-time</SelectItem>
                              <SelectItem value="part-time">Part-time</SelectItem>
                              <SelectItem value="internship">Internship</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="experienceLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Experience Level</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="fresher">Fresher</SelectItem>
                              <SelectItem value="0-1">0-1 years</SelectItem>
                              <SelectItem value="1-3">1-3 years</SelectItem>
                              <SelectItem value="3+">3+ years</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="domain"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Domain</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., IT, Marketing" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="openings"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Number of Openings</FormLabel>
                          <FormControl>
                            <Input type="number" min="1" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </section>
                
                {/* Location Section */}
                <section className="space-y-4">
                  <h3 className="text-lg font-semibold font-headline border-b pb-2">Location & Salary</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Pune" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="remoteAllowed"
                        render={({ field }) => (
                            <FormItem className="flex items-end pb-2">
                               <div className='flex items-center space-x-2'>
                                <FormControl>
                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                                <FormLabel>Remote work allowed</FormLabel>
                               </div>
                            </FormItem>
                        )}
                        />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                        control={form.control}
                        name="currency"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Currency</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                <SelectItem value="INR">INR (₹)</SelectItem>
                                <SelectItem value="USD">USD ($)</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    <FormField
                        control={form.control}
                        name="minSalary"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Min Salary (Optional)</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder="e.g., 800000" {...field} value={field.value ?? ''} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                     <FormField
                        control={form.control}
                        name="maxSalary"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Max Salary (Optional)</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder="e.g., 1200000" {...field} value={field.value ?? ''} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                  </div>
                </section>

                {/* Description Section */}
                <section>
                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Job Description</FormLabel>
                            <FormControl>
                                <Textarea rows={6} placeholder="Describe responsibilities, tech stack, and what you expect from candidates." {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                </section>
                
                {/* Skills Section */}
                 <section>
                    <FormField
                        control={form.control}
                        name="requiredSkills"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Required Skills</FormLabel>
                            <FormControl>
                               <SkillsInput value={field.value} onChange={field.onChange} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                 </section>

                {/* Screening Questions Section */}
                <section className="space-y-4">
                  <h3 className="text-lg font-semibold font-headline border-b pb-2">Screening Questions (Optional)</h3>
                  <FormField
                    control={form.control}
                    name="screeningQuestion1"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Question 1</FormLabel>
                        <FormControl>
                            <Input placeholder="e.g., Have you built any projects using React?" {...field} value={field.value ?? ''} />
                        </FormControl>
                        </FormItem>
                    )}
                    />
                     <FormField
                    control={form.control}
                    name="screeningQuestion2"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Question 2</FormLabel>
                        <FormControl>
                            <Input {...field} value={field.value ?? ''} />
                        </FormControl>
                        </FormItem>
                    )}
                    />
                     <FormField
                    control={form.control}
                    name="screeningQuestion3"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Question 3</FormLabel>
                        <FormControl>
                            <Input {...field} value={field.value ?? ''} />
                        </FormControl>
                        </FormItem>
                    )}
                    />
                </section>

                <Button type="submit" size="lg" className='w-full' disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? 'Posting Job...' : 'Post Job'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        <div className="relative h-full">
            <div className="sticky top-20">
                <h3 className="text-lg font-semibold font-headline mb-4 text-center">Live Job Preview</h3>
                <JobPreviewCard formData={watchedValues} />
            </div>
        </div>
      </div>
    </div>
  );
}

    