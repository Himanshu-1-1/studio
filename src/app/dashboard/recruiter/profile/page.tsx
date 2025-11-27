
'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, Globe, Linkedin, Mail, Pencil, Phone, User as UserIcon } from "lucide-react";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import type { RecruiterProfile, Company } from "@/lib/types";

export default function RecruiterProfilePage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();

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
        </div>
    );
}
