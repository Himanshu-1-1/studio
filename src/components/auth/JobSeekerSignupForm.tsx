'use client';

import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  getAuth,
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from 'firebase/auth';
import { doc, serverTimestamp } from 'firebase/firestore';
import { AnimatePresence, motion } from 'framer-motion';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  useFirestore,
  setDocumentNonBlocking,
} from '@/firebase';
import { useRouter } from 'next/navigation';
import { Textarea } from '../ui/textarea';

const passwordSchema = z
  .string()
  .min(8, { message: 'Password must be at least 8 characters long.' })
  .regex(/[a-z]/, {
    message: 'Password must contain at least one lowercase letter.',
  })
  .regex(/[A-Z]/, {
    message: 'Password must contain at least one uppercase letter.',
  })
  .regex(/[0-9]/, { message: 'Password must contain at least one number.' });

const baseSchema = z.object({
  fullName: z
    .string()
    .min(2, { message: 'Full name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Invalid email address.' }),
  password: passwordSchema,
  confirmPassword: passwordSchema,
  phone: z.string().optional(),
});

const formSchema = baseSchema
  .extend({
    seekerType: z.enum(['student', 'graduate', 'experienced'], {
      required_error: 'You must select a job seeker type.',
    }),
    collegeEmail: z.string().optional(),
    collegeName: z.string().optional(),
    branch: z.string().optional(),
    graduationYear: z.coerce.number().optional(),
    domain: z.string().optional(),
    skills: z.string().optional(),
    preferredRoles: z.string().optional(),
    preferredLocations: z.string().optional(),
    linkedinUrl: z.string().optional(),
    githubUrl: z.string().optional(),
    currentCompany: z.string().optional(),
    currentJobTitle: z.string().optional(),
    experienceYears: z.string().optional(),
    workEmail: z.string().optional(),
    portfolioUrl: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })
  .refine(
    (data) => {
      if (data.seekerType === 'student') {
        return (
          !!data.collegeEmail &&
          !!data.collegeName &&
          !!data.branch &&
          !!data.graduationYear
        );
      }
      return true;
    },
    {
      message:
        'College email, name, branch and graduation year are required for students.',
      path: ['collegeEmail'],
    }
  );

type JobSeekerFormValues = z.infer<typeof formSchema>;

const Step1 = () => (
  <div className="space-y-4">
    <FormField
      control={useForm<JobSeekerFormValues>().control}
      name="fullName"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Full Name</FormLabel>
          <FormControl>
            <Input placeholder="John Doe" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      name="email"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Email</FormLabel>
          <FormControl>
            <Input placeholder="name@example.com" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      name="password"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Password</FormLabel>
          <FormControl>
            <Input type="password" placeholder="********" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      name="confirmPassword"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Confirm Password</FormLabel>
          <FormControl>
            <Input type="password" placeholder="********" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      name="phone"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Phone (Optional)</FormLabel>
          <FormControl>
            <Input placeholder="+1 234 567 890" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  </div>
);

const Step2 = () => (
  <div className="space-y-4">
    <FormField
      control={useForm<JobSeekerFormValues>().control}
      name="seekerType"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Which best describes you?</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select your current status" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="student">Current Student</SelectItem>
              <SelectItem value="graduate">Recent Graduate (Unplaced)</SelectItem>
              <SelectItem value="experienced">
                Experienced Professional
              </SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  </div>
);

const StudentFields = () => (
  <div className="space-y-4">
    <FormField
      control={useForm<JobSeekerFormValues>().control}
      name="collegeEmail"
      render={({ field }) => (
        <FormItem>
          <FormLabel>College Email</FormLabel>
          <FormControl>
            <Input
              placeholder="you@yourcollege.edu"
              {...field}
              value={field.value || ''}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      name="collegeName"
      render={({ field }) => (
        <FormItem>
          <FormLabel>College Name</FormLabel>
          <FormControl>
            <Input
              placeholder="University of Example"
              {...field}
              value={field.value || ''}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      name="branch"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Branch/Department</FormLabel>
          <FormControl>
            <Input
              placeholder="Computer Science"
              {...field}
              value={field.value || ''}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      name="graduationYear"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Graduation Year</FormLabel>
          <FormControl>
            <Input
              type="number"
              placeholder="2025"
              {...field}
              value={field.value || ''}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <SharedFields />
  </div>
);

const GraduateFields = () => (
  <div className="space-y-4">
    <FormField
      control={useForm<JobSeekerFormValues>().control}
      name="collegeName"
      render={({ field }) => (
        <FormItem>
          <FormLabel>College Name</FormLabel>
          <FormControl>
            <Input
              placeholder="University of Example"
              {...field}
              value={field.value || ''}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      name="graduationYear"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Graduation Year</FormLabel>
          <FormControl>
            <Input
              type="number"
              placeholder="2023"
              {...field}
              value={field.value || ''}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <SharedFields />
  </div>
);

const ExperiencedFields = () => (
  <div className="space-y-4">
    <FormField
      control={useForm<JobSeekerFormValues>().control}
      name="currentCompany"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Current or Last Company (Optional)</FormLabel>
          <FormControl>
            <Input
              placeholder="Acme Corp"
              {...field}
              value={field.value || ''}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      name="currentJobTitle"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Current or Last Job Title (Optional)</FormLabel>
          <FormControl>
            <Input
              placeholder="Software Engineer"
              {...field}
              value={field.value || ''}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      name="experienceYears"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Years of Experience</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select years of experience" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="0-1">0 - 1 years</SelectItem>
              <SelectItem value="1-3">1 - 3 years</SelectItem>
              <SelectItem value="3-5">3 - 5 years</SelectItem>
              <SelectItem value="5+">5+ years</SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      name="workEmail"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Work Email (Optional)</FormLabel>
          <FormControl>
            <Input
              placeholder="you@acme.com"
              {...field}
              value={field.value || ''}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <SharedFields />
  </div>
);

const SharedFields = () => (
  <>
    <FormField
      control={useForm<JobSeekerFormValues>().control}
      name="domain"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Primary Domain</FormLabel>
          <FormControl>
            <Input
              placeholder="e.g., IT, Electronics, Marketing"
              {...field}
              value={field.value || ''}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      name="skills"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Skills</FormLabel>
          <FormControl>
            <Textarea
              placeholder="e.g., React, Node.js, Python"
              {...field}
              value={field.value || ''}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      name="preferredRoles"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Preferred Roles</FormLabel>
          <FormControl>
            <Textarea
              placeholder="e.g., Frontend Developer, Data Scientist"
              {...field}
              value={field.value || ''}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      name="preferredLocations"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Preferred Locations</FormLabel>
          <FormControl>
            <Textarea
              placeholder="e.g., Pune, Bangalore, Remote"
              {...field}
              value={field.value || ''}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      name="linkedinUrl"
      render={({ field }) => (
        <FormItem>
          <FormLabel>LinkedIn URL (Optional)</FormLabel>
          <FormControl>
            <Input
              placeholder="https://linkedin.com/in/yourprofile"
              {...field}
              value={field.value || ''}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      name="githubUrl"
      render={({ field }) => (
        <FormItem>
          <FormLabel>GitHub URL (Optional)</FormLabel>
          <FormControl>
            <Input
              placeholder="https://github.com/yourusername"
              {...field}
              value={field.value || ''}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      name="portfolioUrl"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Portfolio URL (Optional)</FormLabel>
          <FormControl>
            <Input
              placeholder="https://yourportfolio.com"
              {...field}
              value={field.value || ''}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  </>
);

const steps = [
  { id: 'Step 1', name: 'Account Info', component: Step1 },
  { id: 'Step 2', name: 'Role', component: Step2 },
  { id: 'Step 3', name: 'Profile Details', component: null }, // Placeholder
];

export function JobSeekerSignupForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const { toast } = useToast();
  const firestore = useFirestore();
  const router = useRouter();

  const form = useForm<JobSeekerFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {},
  });

  const seekerType = useWatch({ control: form.control, name: 'seekerType' });

  const renderStep3 = () => {
    switch (seekerType) {
      case 'student':
        return <StudentFields />;
      case 'graduate':
        return <GraduateFields />;
      case 'experienced':
        return <ExperiencedFields />;
      default:
        return null;
    }
  };

  const handleNext = async () => {
    const fieldsToValidate: (keyof JobSeekerFormValues)[][] = [
      ['fullName', 'email', 'password', 'confirmPassword'],
      ['seekerType'],
      [], // Step 3 validation is part of the final submit
    ];

    const isValid = await form.trigger(fieldsToValidate[currentStep]);
    if (isValid) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const onSubmit = async (values: JobSeekerFormValues) => {
    try {
      const auth = getAuth();
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        values.email,
        values.password
      );
      const user = userCredential.user;

      await sendEmailVerification(user);

      const timestamp = serverTimestamp();

      const userDocRef = doc(firestore, 'users', user.uid);
      const userData = {
        email: values.email,
        fullName: values.fullName,
        phone: values.phone || null,
        role: values.seekerType,
        verificationLevel: 'unverified',
        status: 'active',
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      setDocumentNonBlocking(userDocRef, userData, { merge: true });

      const profileDocRef = doc(firestore, 'jobSeekerProfiles', user.uid);
      const profileData = {
        userId: user.uid,
        type: values.seekerType,
        fullName: values.fullName,
        headline: '',
        skills: values.skills ? values.skills.split(',').map((s) => s.trim()) : [],
        domain: values.domain || '',
        preferredRoles: values.preferredRoles ? values.preferredRoles.split(',').map((s) => s.trim()) : [],
        preferredLocations: values.preferredLocations ? values.preferredLocations.split(',').map((s) => s.trim()) : [],
        graduationYear: values.graduationYear || null,
        collegeName: values.collegeName || null,
        experienceYears: values.experienceYears || null,
        linkedinUrl: values.linkedinUrl || '',
        githubUrl: values.githubUrl || '',
        portfolioUrl: values.portfolioUrl || '',
        verification: {
          level: 'unverified',
          badges: [],
          identityVerified: false,
          educationVerified: false,
          experienceVerified: false,
          lastReviewedAt: null,
        },
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      setDocumentNonBlocking(profileDocRef, profileData, { merge: true });

      toast({
        title: 'Account Created!',
        description: 'Please check your email to verify your account.',
      });

      router.push('/dashboard');
    } catch (error: any) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description:
          error.code === 'auth/email-already-in-use'
            ? 'This email is already registered.'
            : error.message,
      });
    }
  };

  const renderCurrentStep = () => {
    if (currentStep === 2) {
      return renderStep3();
    }
    const StepComponent = steps[currentStep].component;
    return StepComponent ? <StepComponent /> : null;
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            {renderCurrentStep()}
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-between mt-8">
          {currentStep > 0 && (
            <Button type="button" variant="secondary" onClick={handlePrev}>
              Back
            </Button>
          )}
          {currentStep < steps.length - 1 && (
            <Button type="button" onClick={handleNext} className="ml-auto">
              Next
            </Button>
          )}
          {currentStep === steps.length - 1 && (
            <Button type="submit" className="ml-auto">
              Create Account
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
