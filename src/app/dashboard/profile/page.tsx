'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Github, Linkedin, Pencil, Link as LinkIcon, Briefcase, Trash2 } from "lucide-react";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc, deleteDoc } from "firebase/firestore";
import { getAuth, deleteUser } from "firebase/auth";
import { Skeleton } from "@/components/ui/skeleton";
import type { JobSeekerProfile } from "@/lib/types";
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

export default function ProfilePage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const router = useRouter();
    const { toast } = useToast();

    const profileRef = useMemoFirebase(() => {
        if (!user) return null;
        return doc(firestore, 'jobSeekerProfiles', user.uid);
    }, [firestore, user]);

    const { data: profile, isLoading: isProfileLoading } = useDoc<JobSeekerProfile>(profileRef);

    const handleDeleteAccount = async () => {
        if (!user || !firestore) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Could not delete account. User not found.",
            });
            return;
        }

        try {
            // Firestore documents
            const profileDoc = doc(firestore, 'jobSeekerProfiles', user.uid);
            const userDoc = doc(firestore, 'users', user.uid);

            await deleteDoc(profileDoc);
            await deleteDoc(userDoc);

            // Firebase Auth user
            const auth = getAuth();
            const authUser = auth.currentUser;
            if (authUser) {
                await deleteUser(authUser);
            }

            toast({
                title: "Account Deleted",
                description: "Your account has been permanently deleted.",
            });

            router.push('/');

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

    if (isUserLoading || isProfileLoading) {
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
                                <Skeleton className="h-4 w-40" />
                            </div>
                        </div>
                        <Skeleton className="h-10 w-32" />
                    </CardHeader>
                    <CardContent className="space-y-8 pt-6">
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-12 w-full" />
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (!profile) {
        return <div>Profile not found. Please complete your profile.</div>
    }

    return (
        <div className="space-y-6">
             <div>
                <h1 className="text-3xl font-bold font-headline">Your Profile</h1>
                <p className="text-muted-foreground">Manage your job seeker profile and preferences.</p>
            </div>
            <Card>
                <CardHeader className="flex flex-row items-start justify-between">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-20 w-20 border">
                            <AvatarImage src={user?.photoURL || "https://github.com/shadcn.png"} />
                            <AvatarFallback>{profile.fullName.slice(0,2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                            <CardTitle className="text-2xl font-headline">{profile.fullName}</CardTitle>
                            <CardDescription className="capitalize flex items-center gap-2">
                               <Briefcase className="h-4 w-4" /> {profile.type}
                            </CardDescription>
                            <p className="text-sm text-muted-foreground">{user?.email}</p>
                        </div>
                    </div>
                    <Button variant="outline">
                        <Pencil className="mr-2 h-4 w-4" /> Edit Profile
                    </Button>
                </CardHeader>
                <CardContent className="space-y-8 pt-6">
                    <section>
                        <h3 className="font-semibold text-lg mb-3 border-b pb-2">Skills & Domain</h3>
                        <div className="flex flex-wrap gap-2">
                            {profile.skills.map(skill => <Badge key={skill} variant="secondary">{skill}</Badge>)}
                        </div>
                        <p className="text-sm text-muted-foreground mt-3">Primary Domain: <span className="font-semibold text-foreground">{profile.domain}</span></p>
                    </section>

                     <section>
                        <h3 className="font-semibold text-lg mb-3 border-b pb-2">Preferences</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <h4 className="font-medium">Preferred Roles</h4>
                                <p className="text-muted-foreground">{profile.preferredRoles.join(', ')}</p>
                            </div>
                            <div>
                                <h4 className="font-medium">Preferred Locations</h4>
                                <p className="text-muted-foreground">{profile.preferredLocations.join(', ')}</p>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h3 className="font-semibold text-lg mb-3 border-b pb-2">Online Presence</h3>
                        <div className="flex flex-wrap gap-4">
                           {profile.linkedinUrl && (
                             <Button variant="outline" asChild>
                                <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer">
                                    <Linkedin className="mr-2"/> LinkedIn
                                </a>
                            </Button>
                           )}
                             {profile.githubUrl && (
                                <Button variant="outline" asChild>
                                    <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer">
                                        <Github className="mr-2"/> GitHub
                                    </a>
                                </Button>
                             )}
                             {profile.portfolioUrl && (
                                <Button variant="outline" asChild>
                                    <a href={profile.portfolioUrl} target="_blank" rel="noopener noreferrer">
                                        <LinkIcon className="mr-2"/> Portfolio
                                    </a>
                                </Button>
                             )}
                             {profile.resumeUrl && (
                                <Button variant="outline" asChild>
                                    <a href={profile.resumeUrl} target="_blank" rel="noopener noreferrer">
                                        <FileText className="mr-2"/> View Resume
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
                            your profile, and remove all of your application data from our servers.
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
