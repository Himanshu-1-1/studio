'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Send, MessageSquare } from "lucide-react";

// Mock data
const mockConversations = [
  { id: 'conv1', recruiterName: 'Aisha Sharma', companyName: 'Innovate Inc.', lastMessage: 'Sounds great, let\'s schedule an interview.', time: '10:42 AM', unread: 2, avatar: 'https://i.pravatar.cc/150?u=aisha' },
  { id: 'conv2', recruiterName: 'Rohan Verma', companyName: 'Creative Solutions', lastMessage: 'Can you share your portfolio?', time: 'Yesterday', unread: 0, avatar: 'https://i.pravatar.cc/150?u=rohan' },
];

export default function MessagesPage() {
  const selectedConversation = mockConversations[0];

  return (
    <div className="h-full">
        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] h-[calc(100vh-5rem-48px)] gap-6">
            {/* Conversation List */}
            <Card className="flex flex-col">
                <div className="p-4 border-b">
                    <h1 className="text-2xl font-bold font-headline">Messages</h1>
                    <div className="relative mt-4">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search conversations..." className="pl-8" />
                    </div>
                </div>
                <CardContent className="p-0 flex-grow overflow-y-auto">
                    <div className="space-y-1">
                        {mockConversations.map((conv) => (
                            <div key={conv.id} className={`flex items-start gap-4 p-4 cursor-pointer hover:bg-muted/50 ${selectedConversation.id === conv.id ? 'bg-muted' : ''}`}>
                                <Avatar>
                                    <AvatarImage src={conv.avatar} />
                                    <AvatarFallback>{conv.recruiterName.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 overflow-hidden">
                                    <div className="flex justify-between items-center">
                                        <p className="font-semibold truncate">{conv.recruiterName}</p>
                                        <span className="text-xs text-muted-foreground">{conv.time}</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground truncate">{conv.lastMessage}</p>
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
                                <AvatarFallback>{selectedConversation.recruiterName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold">{selectedConversation.recruiterName}</p>
                                <p className="text-sm text-muted-foreground">{selectedConversation.companyName}</p>
                            </div>
                        </div>
                        <CardContent className="flex-grow p-4 space-y-4 overflow-y-auto">
                           {/* Placeholder for messages */}
                           <div className="flex justify-end">
                                <div className="bg-primary text-primary-foreground p-3 rounded-lg max-w-xs">
                                    <p>I'm very interested in the Frontend Developer role!</p>
                                </div>
                           </div>
                           <div className="flex justify-start">
                                <div className="bg-muted p-3 rounded-lg max-w-xs">
                                     <p>{selectedConversation.lastMessage}</p>
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
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <MessageSquare className="h-16 w-16 text-muted-foreground" />
                        <h2 className="mt-4 text-xl font-semibold">No Conversation Selected</h2>
                        <p className="text-muted-foreground mt-1">Conversations with recruiters will appear here.</p>
                    </div>
                )}
            </Card>
        </div>
    </div>
  );
}
