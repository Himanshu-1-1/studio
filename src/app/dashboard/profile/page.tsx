'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Github, Linkedin, Pencil, Link as LinkIcon } from "lucide-react";
import { useUser } from "@/firebase";

// Mock data - replace with Firestore data later
const mockProfile = {
    fullName: "Alex Doe",
    email: "alex.doe@example.com",
    role: "graduate",
    skills: ["React", "TypeScript", "Node.js", "GraphQL", "Next.js", "Tailwind CSS"],
    domain: "IT",
    preferredRoles: ["Frontend Developer", "Full Stack Developer"],
    preferredLocations: ["Pune", "Bangalore", "Remote"],
    linkedinUrl: "https://linkedin.com/in/alex-doe",
    githubUrl: "https://github.com/alex-doe",
    portfolioUrl: "https://alex-doe.dev",
};

export default function ProfilePage() {
    const { user } = useUser();
    // In a real app, you'd fetch the profile from Firestore based on user.uid
    // const { data: profile } = useDoc(doc(firestore, 'jobSeekerProfiles', user.uid));

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
                            <AvatarFallback>{mockProfile.fullName.slice(0,2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                            <CardTitle className="text-2xl font-headline">{user?.displayName || mockProfile.fullName}</CardTitle>
                            <CardDescription className="capitalize">{mockProfile.role}</CardDescription>
                            <p className="text-sm text-muted-foreground">{user?.email || mockProfile.email}</p>
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
                            {mockProfile.skills.map(skill => <Badge key={skill} variant="secondary">{skill}</Badge>)}
                        </div>
                        <p className="text-sm text-muted-foreground mt-3">Primary Domain: <span className="font-semibold text-foreground">{mockProfile.domain}</span></p>
                    </section>

                     <section>
                        <h3 className="font-semibold text-lg mb-3 border-b pb-2">Preferences</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <h4 className="font-medium">Preferred Roles</h4>
                                <p className="text-muted-foreground">{mockProfile.preferredRoles.join(', ')}</p>
                            </div>
                            <div>
                                <h4 className="font-medium">Preferred Locations</h4>
                                <p className="text-muted-foreground">{mockProfile.preferredLocations.join(', ')}</p>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h3 className="font-semibold text-lg mb-3 border-b pb-2">Online Presence</h3>
                        <div className="flex flex-wrap gap-4">
                            <Button variant="outline" asChild>
                                <a href={mockProfile.linkedinUrl} target="_blank" rel="noopener noreferrer">
                                    <Linkedin className="mr-2"/> LinkedIn
                                </a>
                            </Button>
                             <Button variant="outline" asChild>
                                <a href={mockProfile.githubUrl} target="_blank" rel="noopener noreferrer">
                                    <Github className="mr-2"/> GitHub
                                </a>
                            </Button>
                             <Button variant="outline" asChild>
                                <a href={mockProfile.portfolioUrl} target="_blank" rel="noopener noreferrer">
                                    <LinkIcon className="mr-2"/> Portfolio
                                </a>
                            </Button>
                             <Button variant="outline" asChild>
                                <a href="#" target="_blank" rel="noopener noreferrer">
                                    <FileText className="mr-2"/> View Resume
                                </a>
                            </Button>
                        </div>
                    </section>
                </CardContent>
            </Card>
        </div>
    );
}
