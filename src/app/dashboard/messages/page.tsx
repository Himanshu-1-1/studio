'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Send, MessageSquare, Briefcase } from "lucide-react";
import { useAuth, useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, where, orderBy, addDoc, serverTimestamp } from "firebase/firestore";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Conversation, Message, RecruiterProfile, Job } from "@/lib/types";

// A helper to get the other participant's info
const useOtherParticipant = (participants: string[], selfId: string) => {
    const [profile, setProfile] = useState<any>(null);
    const firestore = useFirestore();
    const otherId = participants.find(p => p !== selfId);

    useMemoFirebase(async () => {
        if (!otherId) return;

        // This is a simplified fetch. In a real app, you might want a more robust user fetching hook.
        const q = query(collection(firestore, 'recruiterProfiles'), where('userId', '==', otherId));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
            setProfile({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() });
        }
    }, [firestore, otherId]);
    
    return profile;
}

const ConversationListItem = ({ conv, selfId, isSelected, onSelect }: { conv: Conversation, selfId: string, isSelected: boolean, onSelect: () => void }) => {
    const firestore = useFirestore();
    const otherParticipantId = conv.participants.find(p => p !== selfId);
    
    const recruiterProfileRef = useMemoFirebase(() => {
        if (!otherParticipantId) return null;
        return doc(firestore, 'recruiterProfiles', otherParticipantId);
    }, [firestore, otherParticipantId]);

    const {data: recruiterProfile} = useDoc<RecruiterProfile>(recruiterProfileRef);

    const jobRef = useMemoFirebase(() => {
        if(!conv.jobId) return null;
        return doc(firestore, 'jobs', conv.jobId);
    }, [firestore, conv.jobId]);

    const {data: job} = useDoc<Job>(jobRef);


    if (!recruiterProfile || !job) {
        return (
            <div className="flex items-start gap-4 p-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                </div>
            </div>
        )
    }

    return (
        <div onClick={onSelect} className={`flex items-start gap-4 p-4 cursor-pointer hover:bg-muted/50 ${isSelected ? 'bg-muted' : ''}`}>
            <Avatar>
                <AvatarImage src={"https://i.pravatar.cc/150?u="+recruiterProfile.userId} />
                <AvatarFallback>{recruiterProfile.fullName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden">
                <div className="flex justify-between items-center">
                    <p className="font-semibold truncate">{recruiterProfile.fullName}</p>
                    {conv.lastMessageAt && <span className="text-xs text-muted-foreground">{new Date(conv.lastMessageAt.toDate()).toLocaleTimeString()}</span>}
                </div>
                <p className="text-sm font-medium text-primary truncate">{job.title}</p>
                <p className="text-sm text-muted-foreground truncate mt-1">{conv.lastMessageText || 'No messages yet'}</p>
            </div>
        </div>
    )
}

const ChatArea = ({ conversation }: { conversation: Conversation | null }) => {
    const { user } = useAuth();
    const firestore = useFirestore();
    const [newMessage, setNewMessage] = useState("");

    const messagesQuery = useMemoFirebase(() => {
        if (!conversation) return null;
        return query(collection(firestore, 'conversations', conversation.id, 'messages'), orderBy('createdAt', 'asc'));
    }, [firestore, conversation]);

    const { data: messages, isLoading } = useCollection<Message>(messagesQuery);
    
    const recruiterProfileRef = useMemoFirebase(() => {
        if (!conversation) return null;
        const otherId = conversation.participants.find(p => p !== user?.uid);
        if(!otherId) return null;
        return doc(firestore, 'recruiterProfiles', otherId);
    }, [firestore, conversation, user]);

    const { data: recruiterProfile } = useDoc<RecruiterProfile>(recruiterProfileRef);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !conversation || !user) return;
        
        const messagesCol = collection(firestore, 'conversations', conversation.id, 'messages');
        const conversationRef = doc(firestore, 'conversations', conversation.id);
        
        await addDoc(messagesCol, {
            senderId: user.uid,
            text: newMessage,
            createdAt: serverTimestamp(),
            readBy: [user.uid]
        });

        await updateDoc(conversationRef, {
            lastMessageText: newMessage,
            lastMessageAt: serverTimestamp()
        });

        setNewMessage("");
    }
    
    if (!conversation) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <MessageSquare className="h-16 w-16 text-muted-foreground" />
                <h2 className="mt-4 text-xl font-semibold">No Conversation Selected</h2>
                <p className="text-muted-foreground mt-1">Select a conversation from the left to start chatting.</p>
            </div>
        )
    }

    if(!recruiterProfile) return <div className="flex h-full items-center justify-center"><p>Loading...</p></div>

    return (
        <>
            <div className="p-4 border-b flex items-center gap-4">
                <Avatar>
                    <AvatarImage src={"https://i.pravatar.cc/150?u="+recruiterProfile.userId} />
                    <AvatarFallback>{recruiterProfile.fullName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                    <p className="font-semibold">{recruiterProfile.fullName}</p>
                    <p className="text-sm text-muted-foreground">Innovate Inc.</p>
                </div>
            </div>
            <CardContent className="flex-grow p-4 space-y-4 overflow-y-auto">
               {isLoading && <p>Loading messages...</p>}
               {messages?.map(msg => (
                   <div key={msg.id} className={`flex ${msg.senderId === user?.uid ? 'justify-end' : 'justify-start'}`}>
                       <div className={`${msg.senderId === user?.uid ? 'bg-primary text-primary-foreground' : 'bg-muted'} p-3 rounded-lg max-w-md`}>
                           <p>{msg.text}</p>
                       </div>
                   </div>
               ))}
            </CardContent>
            <div className="p-4 border-t bg-background">
                <form onSubmit={handleSendMessage} className="relative">
                    <Input 
                        placeholder="Type a message..." 
                        className="pr-12"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                    />
                    <Button type="submit" size="icon" variant="ghost" className="absolute top-1/2 right-1 -translate-y-1/2">
                        <Send className="h-5 w-5 text-muted-foreground" />
                    </Button>
                </form>
            </div>
        </>
    )
}

export default function MessagesPage() {
  const { user } = useAuth();
  const firestore = useFirestore();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);

  const conversationsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
        collection(firestore, 'conversations'), 
        where('participants', 'array-contains', user.uid),
        orderBy('lastMessageAt', 'desc')
    );
  }, [user, firestore]);
  
  const { data: conversations, isLoading } = useCollection<Conversation>(conversationsQuery);

  return (
    <div className="h-full">
        <div className="grid grid-cols-1 md:grid-cols-[350px_1fr] h-[calc(100vh-5rem-48px)] gap-6">
            <Card className="flex flex-col">
                <div className="p-4 border-b">
                    <h1 className="text-2xl font-bold font-headline">Messages</h1>
                    <div className="relative mt-4">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search conversations..." className="pl-8" />
                    </div>
                </div>
                <CardContent className="p-0 flex-grow overflow-y-auto">
                    {isLoading && <div className="p-4">Loading conversations...</div>}
                    {conversations && conversations.length > 0 ? (
                         <div className="space-y-1">
                             {conversations.map((conv) => (
                                 <ConversationListItem 
                                     key={conv.id}
                                     conv={conv}
                                     selfId={user!.uid}
                                     isSelected={selectedConversation?.id === conv.id}
                                     onSelect={() => setSelectedConversation(conv)}
                                 />
                             ))}
                         </div>
                    ) : (
                        !isLoading && (
                            <div className="text-center p-8">
                                <Briefcase className="h-12 w-12 mx-auto text-muted-foreground" />
                                <h3 className="mt-4 text-lg font-semibold">No messages yet.</h3>
                                <p className="mt-1 text-sm text-muted-foreground">When you match with a recruiter, your conversations will appear here.</p>
                            </div>
                        )
                    )}
                </CardContent>
            </Card>

            <Card className="flex flex-col">
                <ChatArea conversation={selectedConversation} />
            </Card>
        </div>
    </div>
  );
}
