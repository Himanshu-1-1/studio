'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Send, MessageSquare } from "lucide-react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

// Mock data
const mockConversations = [
  { id: 'conv1', seekerName: 'Priya Patel', jobTitle: 'Frontend Developer', lastMessage: 'I am very interested in this role and have experience with Next.js.', time: '11:15 AM', unread: 1, avatar: 'https://i.pravatar.cc/150?u=priya' },
  { id: 'conv2', seekerName: 'Amit Singh', jobTitle: 'Data Scientist', lastMessage: 'Thank you for the opportunity!', time: 'Yesterday', unread: 0, avatar: 'https://i.pravatar.cc/150?u=amit' },
];

export default function RecruiterMessagesPage() {
  const selectedConversation = mockConversations[0];

  return (
    <div className="space-y-6 h-full flex flex-col">
       <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard/recruiter">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Messages</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      
      <div className="grid grid-cols-1 md:grid-cols-[350px_1fr] h-full gap-6 flex-1">
            {/* Conversation List */}
            <Card className="flex flex-col">
                <div className="p-4 border-b">
                    <h1 className="text-2xl font-bold font-headline">Candidate Messages</h1>
                    <div className="relative mt-4">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search by name or job..." className="pl-8" />
                    </div>
                </div>
                <CardContent className="p-0 flex-grow overflow-y-auto">
                    <div className="space-y-1">
                        {mockConversations.map((conv) => (
                            <div key={conv.id} className={`flex items-start gap-4 p-4 cursor-pointer hover:bg-muted/50 ${selectedConversation.id === conv.id ? 'bg-muted' : ''}`}>
                                <Avatar>
                                    <AvatarImage src={conv.avatar} />
                                    <AvatarFallback>{conv.seekerName.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 overflow-hidden">
                                    <div className="flex justify-between items-center">
                                        <p className="font-semibold truncate">{conv.seekerName}</p>
                                        <span className="text-xs text-muted-foreground">{conv.time}</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground truncate">{conv.jobTitle}</p>
                                    <p className="text-sm text-muted-foreground truncate mt-1">{conv.lastMessage}</p>
                                </div>
                                {conv.unread > 0 && <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">{conv.unread}</span>}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Chat Area */}
            <Card className="flex flex-col">
                {selectedConversation ? (
                    <>
                        <div className="p-4 border-b flex items-center gap-4">
                            <Avatar>
                                <AvatarImage src={selectedConversation.avatar} />
                                <AvatarFallback>{selectedConversation.seekerName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold">{selectedConversation.seekerName}</p>
                                <p className="text-sm text-muted-foreground">Applying for: {selectedConversation.jobTitle}</p>
                            </div>
                        </div>
                        <CardContent className="flex-grow p-4 space-y-4 overflow-y-auto">
                           {/* Placeholder for messages */}
                           <div className="flex justify-start">
                                <div className="bg-muted p-3 rounded-lg max-w-md">
                                    <p>I am very interested in this role and have experience with Next.js.</p>
                                </div>
                           </div>
                           <div className="flex justify-end">
                                <div className="bg-primary text-primary-foreground p-3 rounded-lg max-w-md">
                                     <p>Thanks for your interest, Priya. Could you share a link to your portfolio?</p>
                                </div>
                           </div>
                        </CardContent>
                        <div className="p-4 border-t bg-background">
                            <div className="relative">
                                <Input placeholder="Type a message..." className="pr-12"/>
                                <Button size="icon" variant="ghost" className="absolute top-1/2 right-1 -translate-y-1/2">
                                    <Send className="h-5 w-5 text-muted-foreground" />
                                </Button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center p-8">
                        <MessageSquare className="h-16 w-16 text-muted-foreground" />
                        <h2 className="mt-4 text-xl font-semibold">No Conversation Selected</h2>
                        <p className="text-muted-foreground mt-1">Select a conversation from the left to start chatting.</p>
                    </div>
                )}
            </Card>
        </div>
    </div>
  );
}
