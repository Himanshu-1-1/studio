'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  getAuth,
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from 'firebase/auth';
import { doc, serverTimestamp, collection, addDoc } from 'firebase/firestore';
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
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, setDocumentNonBlocking, addDocumentNonBlocking } from '@/firebase';
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

const formSchema = z
  .object({
    // Step 1
    fullName: z
      .string()
      .min(2, { message: 'Full name must be at least 2 characters.' }),
    workEmail: z
      .string()
      .email({ message: 'A valid work email is required.' }),
    password: passwordSchema,
    confirmPassword: passwordSchema,
    phone: z.string().optional(),

    // Step 2
    roleInCompany: z
      .string()
      .min(1, { message: 'Your role in the company is required.' }),
    linkedinUrl: z.string().url().optional().or(z.literal('')),
    companyName: z
      .string()
      .min(2, { message: 'Company name is required.' }),
    companyWebsite: z
      .string()
      .url({ message: 'Please enter a valid company website URL.' }),
    companyLinkedin: z.string().url().optional().or(z.literal('')),
    companyLocation: z.string().optional(),
    companySize: z.string().optional(),
    authorization: z
      .boolean()
      .default(false)
      .refine((val) => val === true, {
        message: 'You must be authorized to represent this company.',
      }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type RecruiterFormValues = z.infer<typeof formSchema>;

const Step1 = () => (
  <div className="space-y-4">
    <FormField
      control={useForm<RecruiterFormValues>().control}
      name="fullName"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Full Name</FormLabel>
          <FormControl>
            <Input placeholder="Jane Doe" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      name="workEmail"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Work Email</FormLabel>
          <FormControl>
            <Input placeholder="jane.doe@company.com" {...field} />
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
    <h3 className="text-lg font-medium">Your Profile</h3>
    <FormField
      control={useForm<RecruiterFormValues>().control}
      name="roleInCompany"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Your Role in Company</FormLabel>
          <FormControl>
            <Input placeholder="e.g., HR, Talent Acquisition, Founder" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      name="linkedinUrl"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Your LinkedIn URL (Recommended)</FormLabel>
          <FormControl>
            <Input placeholder="https://linkedin.com/in/yourprofile" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />

    <h3 className="text-lg font-medium pt-4">Company Information</h3>
    <FormField
      name="companyName"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Company Name</FormLabel>
          <FormControl>
            <Input placeholder="Acme Inc." {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      name="companyWebsite"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Company Website</FormLabel>
          <FormControl>
            <Input placeholder="https://acme.com" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
     <FormField
      name="authorization"
      render={({ field }) => (
        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
          <FormControl>
            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
          </FormControl>
          <div className="space-y-1 leading-none">
            <FormLabel>
              I confirm that I am authorized to represent this company for recruitment.
            </FormLabel>
            <FormMessage />
          </div>
        </FormItem>
      )}
    />
  </div>
);

const steps = [
  { id: 'Step 1', name: 'Account Info', fields: ['fullName', 'workEmail', 'password', 'confirmPassword'] },
  { id: 'Step 2', name: 'Company Info', fields: ['roleInCompany', 'companyName', 'companyWebsite', 'authorization'] },
];

export function RecruiterSignupForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const { toast } = useToast();
  const firestore = useFirestore();
  const router = useRouter();

  const form = useForm<RecruiterFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: '',
      workEmail: '',
      password: '',
      confirmPassword: '',
      phone: '',
      roleInCompany: '',
      linkedinUrl: '',
      companyName: '',
      companyWebsite: '',
      companyLinkedin: '',
      companyLocation: '',
      companySize: '',
      authorization: false,
    },
  });

  const handleNext = async () => {
    const fields = steps[currentStep].fields as (keyof RecruiterFormValues)[];
    const isValid = await form.trigger(fields);
    
    if (isValid) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const onSubmit = async (values: RecruiterFormValues) => {
    try {
      const auth = getAuth();
      const userCredential = await createUserWithEmailAndPassword(auth, values.workEmail, values.password);
      const user = userCredential.user;

      await sendEmailVerification(user);
      
      const timestamp = serverTimestamp();

      // Create company document
      const companyCollectionRef = collection(firestore, 'companies');
      const companyData = {
        name: values.companyName,
        website: values.companyWebsite,
        domain: new URL(values.companyWebsite).hostname,
        registrationNo: null,
        docs: [],
        verificationStatus: 'unverified',
        createdBy: user.uid,
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      const companyDocRef = await addDoc(companyCollectionRef, companyData);


      // Create user document
      const userDocRef = doc(firestore, 'users', user.uid);
      const userData = {
        email: values.workEmail,
        fullName: values.fullName,
        phone: values.phone || null,
        role: 'recruiter',
        verificationLevel: 'unverified',
        status: 'active',
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      setDocumentNonBlocking(userDocRef, userData, { merge: true });
      
      // Create recruiter profile
      const recruiterProfileDocRef = doc(firestore, 'recruiterProfiles', user.uid);
      const recruiterProfileData = {
        userId: user.uid,
        fullName: values.fullName,
        email: values.workEmail,
        phone: values.phone || null,
        roleInCompany: values.roleInCompany,
        companyId: companyDocRef.id,
        workEmailVerified: false,
        linkedinUrl: values.linkedinUrl || '',
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      setDocumentNonBlocking(recruiterProfileDocRef, recruiterProfileData, { merge: true });

      toast({
        title: 'Account Created!',
        description: 'Please verify your work email. Your company will be reviewed for verification.',
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
    const StepComponent = steps[currentStep].id === 'Step 1' ? Step1 : Step2;
    return <StepComponent />;
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
            <Button type="submit" className="ml-auto" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Creating Account...' : 'Create Account'}
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
