
'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, Globe, Linkedin, Mail, Pencil, Phone, User as UserIcon, Trash2 } from "lucide-react";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc, deleteDoc } from "firebase/firestore";
import { getAuth, deleteUser } from "firebase/auth";
import { Skeleton } from "@/components/ui/skeleton";
import type { RecruiterProfile, Company } from "@/lib/types";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";


export default function RecruiterProfilePage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const router = useRouter();
    const { toast } = useToast();

    const recruiterProfileRef = useMemoFirebase(() => {
        if (!user) return null;
        return doc(firestore, 'recruiterProfiles', user.uid);
    }, [firestore, user]);

    const { data: recruiterProfile, isLoading: isRecruiterLoading } = useDoc<RecruiterProfile>(recruiterProfileRef);
    
    const companyRef = useMemoFirebase(() => {
        if (!recruiterProfile?.companyId) return null;
        return doc(firestore, 'companies', recruiterProfile.companyId);
    }, [firestore, recruiterProfile]);

    const { data: company, isLoading: isCompanyLoading } = useDoc<Company>(companyRef);

    const isLoading = isUserLoading || isRecruiterLoading || isCompanyLoading;

    const handleDeleteAccount = async () => {
        if (!user || !firestore || !recruiterProfile) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Could not delete account. User not found.",
            });
            return;
        }

        try {
            // Firestore documents
            const profileDoc = doc(firestore, 'recruiterProfiles', user.uid);
            const userDoc = doc(firestore, 'users', user.uid);
            
            await deleteDoc(profileDoc);
            await deleteDoc(userDoc);
            
            // Delete company if this is the user who created it
            if (recruiterProfile.companyId) {
                const companyDoc = doc(firestore, 'companies', recruiterProfile.companyId);
                // Optional: You might want to add a check here to see if other recruiters are associated with the company before deleting.
                // For simplicity, we delete it.
                await deleteDoc(companyDoc);
            }


            // Firebase Auth user
            const auth = getAuth();
            const authUser = auth.currentUser;
            if (authUser) {
                await deleteUser(authUser);
            }

            toast({
                title: "Account Deleted",
                description: "Your recruiter account has been permanently deleted.",
            });

            router.push('/login');

        } catch (error: any) {
            console.error("Error deleting account:", error);
            toast({
                variant: "destructive",
                title: "Deletion Failed",
                description: "An error occurred. You may need to log in again to complete this action.",
            });
            // Re-authentication might be required for security-sensitive operations
            if(error.code === 'auth/requires-recent-login') {
                router.push('/login');
            }
        }
    };


    if (isLoading) {
        return (
             <div className="space-y-6">
                <Skeleton className="h-10 w-1/3" />
                <Card>
                    <CardHeader className="flex flex-row items-start justify-between">
                         <div className="flex items-center gap-4">
                            <Skeleton className="h-20 w-20 rounded-full" />
                            <div className="space-y-2">
                                <Skeleton className="h-6 w-48" />
                                <Skeleton className="h-4 w-32" />
                            </div>
                        </div>
                        <Skeleton className="h-10 w-32" />
                    </CardHeader>
                    <CardContent className="space-y-8 pt-6">
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-16 w-full" />
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (!recruiterProfile || !company) {
        return <div>Profile or company information not found.</div>;
    }

    return (
        <div className="space-y-6">
             <div>
                <h1 className="text-3xl font-bold font-headline">Recruiter Profile</h1>
                <p className="text-muted-foreground">Manage your recruiter profile and company information.</p>
            </div>
            <Card>
                <CardHeader className="flex flex-row items-start justify-between">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-20 w-20 border">
                            <AvatarImage src={user?.photoURL || "https://github.com/shadcn.png"} />
                            <AvatarFallback>{recruiterProfile.fullName.slice(0,2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                            <CardTitle className="text-2xl font-headline">{recruiterProfile.fullName}</CardTitle>
                            <CardDescription className="capitalize flex items-center gap-2">
                                <UserIcon className="h-4 w-4" /> {recruiterProfile.roleInCompany}
                            </CardDescription>
                            <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                               <Mail className="h-4 w-4" /> {recruiterProfile.email}
                            </p>
                             {recruiterProfile.phone && (
                                 <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                                    <Phone className="h-4 w-4" /> {recruiterProfile.phone}
                                </p>
                             )}
                        </div>
                    </div>
                    <Button variant="outline">
                        <Pencil className="mr-2 h-4 w-4" /> Edit Profile
                    </Button>
                </CardHeader>
                <CardContent className="space-y-8 pt-6">
                    <section>
                        <h3 className="font-semibold text-lg mb-3 border-b pb-2">Company Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div className="flex items-center gap-3">
                               <Building className="w-8 h-8 text-muted-foreground" />
                               <div>
                                   <h4 className="font-medium">Company</h4>
                                   <p className="text-muted-foreground">{company.name}</p>
                               </div>
                           </div>
                           <div className="flex items-center gap-3">
                               <Globe className="w-8 h-8 text-muted-foreground" />
                               <div>
                                   <h4 className="font-medium">Website</h4>
                                   <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{company.website}</a>
                               </div>
                           </div>
                           <div className="flex items-center gap-3">
                                <Badge variant={company.verificationStatus === 'verified' ? 'default' : 'secondary'} className="capitalize">
                                    {company.verificationStatus}
                                </Badge>
                           </div>
                        </div>
                    </section>
                    
                    <section>
                        <h3 className="font-semibold text-lg mb-3 border-b pb-2">Online Presence</h3>
                        <div className="flex flex-wrap gap-4">
                           {recruiterProfile.linkedinUrl && (
                             <Button variant="outline" asChild>
                                <a href={recruiterProfile.linkedinUrl} target="_blank" rel="noopener noreferrer">
                                    <Linkedin className="mr-2"/> LinkedIn Profile
                                </a>
                            </Button>
                           )}
                        </div>
                    </section>
                </CardContent>
            </Card>

            <Card className="border-destructive">
                <CardHeader>
                    <CardTitle className="text-destructive">Danger Zone</CardTitle>
                    <CardDescription>
                        Permanently delete your account and all associated data. This action is irreversible.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete My Account
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your account,
                            your profile, and remove all of your company and job data from our servers.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive hover:bg-destructive/90">
                            Yes, delete my account
                        </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                    </AlertDialog>
                </CardContent>
            </Card>
        </div>
    );
}
