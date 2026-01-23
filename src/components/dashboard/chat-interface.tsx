'use client';
import { useState, useMemo, useEffect, useRef } from 'react';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { collection, query, where, orderBy, doc, getDoc, onSnapshot } from 'firebase/firestore';
import type { Conversation, Message, User } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardFooter, CardTitle } from '@/components/ui/card';
import { getOrCreateConversation, sendMessage } from '@/lib/chat';
import { Loader2, Send, ArrowLeft } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ScrollArea } from '../ui/scroll-area';
import { cn } from '@/lib/utils';

// Main component
export default function ChatInterface() {
    const { user, loading: userLoading } = useUser();
    const firestore = useFirestore();
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
    const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');

    // Get all conversations for the current user
    const conversationsQuery = useMemo(() => {
        if (!user || !firestore) return null;
        // The orderBy was removed to prevent a missing-index error. Sorting is now done on the client.
        return query(
            collection(firestore, 'conversations'),
            where('participants', 'array-contains', user.uid)
        );
    }, [user, firestore]);

    const { data: rawConversations, loading: conversationsLoading } = useCollection<Conversation>(conversationsQuery);
    
    const conversations = useMemo(() => {
        if (!rawConversations) return undefined;
        // Sort conversations by lastMessageAt descending
        return [...rawConversations].sort((a, b) => {
            const timeA = a.lastMessageAt?.toDate()?.getTime() || 0;
            const timeB = b.lastMessageAt?.toDate()?.getTime() || 0;
            return timeB - timeA;
        });
    }, [rawConversations]);

    useEffect(() => {
        if (!activeConversationId && conversations && conversations.length > 0) {
            setActiveConversationId(conversations[0].id);
        }
    }, [conversations, activeConversationId]);
    
    if (userLoading || (conversationsLoading && !conversations)) {
        return <div className="flex items-center justify-center p-8 mt-8"><Loader2 className="animate-spin h-8 w-8" /></div>;
    }

    if (!user) return null;

    const getOtherParticipant = (convo: Conversation) => {
        return convo.participantDetails.find(p => p.uid !== user.uid);
    };

    return (
        <div className="mt-8 md:grid md:grid-cols-3 lg:grid-cols-4 md:gap-8 h-[calc(100vh-280px)]">
            <Card className={cn(
                'md:col-span-1 lg:col-span-1 flex-col h-full',
                mobileView === 'list' ? 'flex' : 'hidden md:flex'
            )}>
                <CardHeader>
                    <CardTitle>Conversations</CardTitle>
                </CardHeader>
                <CardContent className="p-0 flex-grow">
                    <ScrollArea className="h-full">
                        {conversations && conversations.length > 0 ? conversations.map(convo => {
                            const otherUser = getOtherParticipant(convo);
                            return (
                                <div key={convo.id} onClick={() => { setActiveConversationId(convo.id); setMobileView('chat'); }} className={`p-4 border-b cursor-pointer hover:bg-secondary ${activeConversationId === convo.id ? 'bg-secondary' : ''}`}>
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage src={otherUser?.photoURL ?? undefined} />
                                            <AvatarFallback>{otherUser?.displayName?.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                                        </Avatar>
                                        <div className='w-full overflow-hidden'>
                                            <p className="font-semibold">{otherUser?.displayName}</p>
                                            <p className="text-sm text-muted-foreground truncate">{convo.lastMessageText || 'No messages yet'}</p>
                                        </div>
                                    </div>
                                    {convo.lastMessageAt && <p className="text-xs text-muted-foreground mt-1 text-right">{formatDistanceToNow(convo.lastMessageAt.toDate(), { addSuffix: true })}</p>}
                                </div>
                            )
                        }) : (
                            <div className="p-4 text-center text-muted-foreground h-full flex items-center justify-center">
                                No conversations yet.
                            </div>
                        )}
                    </ScrollArea>
                </CardContent>
            </Card>
            <div className={cn(
                "md:col-span-2 lg:col-span-3 h-full",
                mobileView === 'chat' ? 'block' : 'hidden md:block'
            )}>
                {activeConversationId && user ? (
                    <MessageWindow key={activeConversationId} conversationId={activeConversationId} currentUser={user} onBack={() => setMobileView('list')} />
                ) : (
                     <div className="h-full items-center justify-center bg-secondary rounded-lg hidden md:flex">
                        <div className="text-center">
                            <h3 className="text-xl font-semibold">Select a conversation</h3>
                            <p className="text-muted-foreground">Or start a new one by contacting an agent.</p>
                        </div>
                     </div>
                )}
            </div>
        </div>
    );
}


// Message window component
function MessageWindow({ conversationId, currentUser, onBack }: { conversationId: string, currentUser: User, onBack: () => void }) {
    const firestore = useFirestore();
    const [newMessage, setNewMessage] = useState('');
    const [conversation, setConversation] = useState<Conversation | null>(null);
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    const messagesQuery = useMemo(() => {
        if (!firestore) return null;
        return query(
            collection(firestore, 'conversations', conversationId, 'messages'),
            orderBy('createdAt', 'asc')
        );
    }, [firestore, conversationId]);

    const { data: messages, loading: messagesLoading } = useCollection<Message>(messagesQuery);
    
    useEffect(() => {
        const fetchConvo = async () => {
            if (firestore) {
                const convoRef = doc(firestore, 'conversations', conversationId);
                const unsub = onSnapshot(convoRef, (doc) => {
                     if (doc.exists()) {
                        setConversation({ id: doc.id, ...doc.data() } as Conversation);
                    }
                });
                return () => unsub();
            }
        }
        fetchConvo();
    }, [firestore, conversationId]);

    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!firestore || !newMessage.trim()) return;
        await sendMessage(firestore, conversationId, currentUser.uid, newMessage);
        setNewMessage('');
    };

    const otherUser = conversation?.participantDetails.find(p => p.uid !== currentUser.uid);

    return (
        <Card className="flex flex-col h-full">
            <CardHeader className="border-b">
                 <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" className="md:hidden" onClick={onBack}>
                        <ArrowLeft className="h-4 w-4" />
                        <span className="sr-only">Back to conversations</span>
                    </Button>
                    <Avatar className="h-10 w-10">
                            <AvatarImage src={otherUser?.photoURL ?? undefined} />
                            <AvatarFallback>{otherUser?.displayName?.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                    </Avatar>
                    <div>
                        <CardTitle>{otherUser?.displayName || 'Loading...'}</CardTitle>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 min-h-0">
                 <ScrollArea className="h-full p-6" viewportRef={scrollAreaRef}>
                     <div className="space-y-4">
                        {messagesLoading && <div className="flex justify-center"><Loader2 className="animate-spin" /></div>}
                        {messages?.map(msg => (
                            <div key={msg.id} className={`flex items-end gap-2 ${msg.senderId === currentUser.uid ? 'justify-end' : 'justify-start'}`}>
                                <div className={`p-3 rounded-lg max-w-md ${msg.senderId === currentUser.uid ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                    <p className="whitespace-pre-wrap">{msg.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </CardContent>
            <CardFooter className="border-t p-4">
                 <form onSubmit={handleSendMessage} className="flex w-full items-center gap-2">
                    <Textarea 
                        placeholder="Type your message..." 
                        className="flex-1 resize-none" 
                        rows={1} 
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                         onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage(e);
                            }
                        }}
                    />
                    <Button size="icon" type="submit" disabled={!newMessage.trim()}>
                        <Send />
                        <span className="sr-only">Send</span>
                    </Button>
                </form>
            </CardFooter>
        </Card>
    );
}
