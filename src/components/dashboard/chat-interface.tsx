'use client';
import { useState, useMemo, useEffect, useRef } from 'react';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { collection, query, where, orderBy, doc, onSnapshot } from 'firebase/firestore';
import type { Conversation, Message, User } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardFooter, CardTitle } from '@/components/ui/card';
import { sendMessage, markConversationAsRead } from '@/lib/chat';
import { Loader2, Send, ArrowLeft, MessageSquareText, MessagesSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ScrollArea } from '../ui/scroll-area';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';

// Main component
export default function ChatInterface({ initialConversationId }: { initialConversationId?: string | null }) {
    const { user, loading: userLoading } = useUser();
    const firestore = useFirestore();
    const [activeConversationId, setActiveConversationId] = useState<string | null>(initialConversationId || null);
    const [mobileView, setMobileView] = useState<'list' | 'chat'>(initialConversationId ? 'chat' : 'list');
    
    const conversationsQuery = useMemo(() => {
        if (!user || !firestore) return null;
        return query(
            collection(firestore, 'conversations'),
            where('participants', 'array-contains', user.uid)
        );
    }, [user, firestore]);

    const { data: rawConversations, loading: conversationsLoading } = useCollection<Conversation>(conversationsQuery);

    const conversations = useMemo(() => {
        if (!rawConversations) return [];
        return [...rawConversations].sort((a, b) => {
            const timeA = a.lastMessageAt?.toDate?.().getTime() || 0;
            const timeB = b.lastMessageAt?.toDate?.().getTime() || 0;
            return timeB - timeA;
        });
    }, [rawConversations]);

    useEffect(() => {
        // Only set active conversation if one isn't already set (e.g. from URL)
        if (!activeConversationId && conversations && conversations.length > 0) {
            setActiveConversationId(conversations[0].id);
        }
    }, [conversations, activeConversationId]);

    useEffect(() => {
        if (initialConversationId) {
            setActiveConversationId(initialConversationId);
            setMobileView('chat');
        }
    }, [initialConversationId]);
    
    const getOtherParticipant = (convo: Conversation) => {
        if (!convo.participantDetails) return undefined;
        return convo.participantDetails.find(p => p.uid !== user?.uid);
    };

    const activeConversation = useMemo(() => {
        if (!activeConversationId || !conversations) return null;
        return conversations.find(c => c.id === activeConversationId) || null;
    }, [activeConversationId, conversations]);

    if (userLoading || conversationsLoading) {
        return (
            <div className="md:grid md:grid-cols-3 lg:grid-cols-4 md:gap-8 h-full">
                <Card className={cn("md:col-span-1 lg:col-span-1 flex-col h-full", mobileView === 'list' ? 'flex' : 'hidden md:flex')}>
                    <CardHeader>
                        <CardTitle>Conversations</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 flex-grow">
                        <div className="space-y-4 p-4">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <Skeleton className="h-12 w-12 rounded-full" />
                                    <div className="space-y-2 flex-1">
                                        <Skeleton className="h-4 w-3/4" />
                                        <Skeleton className="h-4 w-1/2" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
                <div className={cn("md:col-span-2 lg:col-span-3 h-full", mobileView === 'chat' ? 'flex' : 'hidden md:flex', 'items-center justify-center bg-secondary rounded-lg')}>
                     <Loader2 className="animate-spin h-8 w-8 text-muted-foreground" />
                </div>
            </div>
        )
    }

    if (!user) return null;

    return (
        <div className="md:grid md:grid-cols-3 lg:grid-cols-4 md:gap-8 h-full">
            <Card className={cn(
                'md:col-span-1 lg:col-span-1 flex-col h-full',
                mobileView === 'list' ? 'flex' : 'hidden md:flex'
            )}>
                <CardHeader>
                    <CardTitle>Conversations</CardTitle>
                </CardHeader>
                <CardContent className="p-0 flex-grow">
                    <ScrollArea className="h-full">
                        {conversations.length > 0 ? conversations.map(convo => {
                            const otherUser = getOtherParticipant(convo);
                            const unreadCount = convo.unreadCounts?.[user.uid] || 0;
                            return (
                                <div key={convo.id} onClick={() => { setActiveConversationId(convo.id); setMobileView('chat'); }} className={`p-4 border-b cursor-pointer hover:bg-secondary ${activeConversationId === convo.id ? 'bg-secondary' : ''}`}>
                                    <div className="flex items-center gap-4">
                                        <Avatar className="h-12 w-12">
                                            <AvatarImage src={otherUser?.photoURL ?? undefined} alt={otherUser?.displayName ?? 'User'}/>
                                            <AvatarFallback>{otherUser?.displayName?.split(" ").map(n => n[0]).join("") || 'U'}</AvatarFallback>
                                        </Avatar>
                                        <div className='w-full overflow-hidden'>
                                            <div className="flex justify-between items-start">
                                                <p className="font-semibold truncate">{otherUser?.displayName || 'Unknown User'}</p>
                                                {convo.lastMessageAt && <p className="text-xs text-muted-foreground flex-shrink-0 ml-2">{formatDistanceToNow(convo.lastMessageAt.toDate(), { addSuffix: true })}</p>}
                                            </div>
                                            <div className="flex justify-between items-center mt-1">
                                                <p className="text-sm text-muted-foreground truncate">{convo.lastMessageText || 'No messages yet'}</p>
                                                {unreadCount > 0 && (
                                                    <Badge className="h-5 w-5 p-0 flex items-center justify-center text-xs">{unreadCount}</Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        }) : (
                            <div className="p-4 text-center text-muted-foreground h-full flex flex-col items-center justify-center">
                                <MessagesSquare className="h-12 w-12 text-muted-foreground/50 mb-4" />
                                <h3 className="font-semibold text-lg">No conversations yet.</h3>
                                <p className="text-sm">Start a chat by contacting an agent.</p>
                            </div>
                        )}
                    </ScrollArea>
                </CardContent>
            </Card>
            <div className={cn(
                "md:col-span-2 lg:col-span-3 h-full",
                mobileView === 'chat' ? 'block' : 'hidden md:block'
            )}>
                {activeConversation && user ? (
                    <MessageWindow key={activeConversation.id} conversation={activeConversation} currentUser={user} onBack={() => setMobileView('list')} />
                ) : (
                     <div className="h-full items-center justify-center bg-secondary rounded-lg hidden md:flex flex-col">
                        <MessagesSquare className="h-16 w-16 text-muted-foreground/50 mb-4" />
                        <h3 className="text-xl font-semibold">Select a conversation</h3>
                        <p className="text-muted-foreground">Or start a new one by contacting an agent.</p>
                     </div>
                )}
            </div>
        </div>
    );
}


// Message window component
function MessageWindow({ conversation, currentUser, onBack }: { conversation: Conversation, currentUser: User, onBack: () => void }) {
    const firestore = useFirestore();
    const [newMessage, setNewMessage] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [messagesLoading, setMessagesLoading] = useState(true);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const conversationId = conversation.id;

    // Get messages in real-time
    useEffect(() => {
        if (!firestore) return;
        setMessagesLoading(true);
        const messagesQuery = query(
            collection(firestore, 'conversations', conversationId, 'messages'),
            orderBy('createdAt', 'asc')
        );
        const unsubscribe = onSnapshot(messagesQuery, (querySnapshot) => {
            const newMessages: Message[] = [];
            querySnapshot.forEach((doc) => {
                newMessages.push({ id: doc.id, ...doc.data() } as Message);
            });
            setMessages(newMessages);
            setMessagesLoading(false);
        }, (error) => {
            console.error("Error fetching messages:", error);
            setMessagesLoading(false);
        });
        return () => unsubscribe();
    }, [firestore, conversationId]);
    
    // Mark as read
    useEffect(() => {
        if (firestore && conversationId && currentUser.uid) {
            markConversationAsRead(firestore, conversationId, currentUser.uid);
        }
    }, [firestore, conversationId, currentUser.uid, messages]);

    // Scroll to bottom
    useEffect(() => {
        if (scrollAreaRef.current) {
            setTimeout(() => {
                if (scrollAreaRef.current) {
                     scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
                }
            }, 100);
        }
    }, [messages, messagesLoading]);

    // Auto-resize textarea
    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            const scrollHeight = textarea.scrollHeight;
            textarea.style.height = `${scrollHeight}px`;
        }
    }, [newMessage]);
    
    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!firestore || !newMessage.trim()) return;
        const messageToSend = newMessage;
        setNewMessage('');
        try {
            await sendMessage(firestore, conversationId, currentUser.uid, messageToSend);
        } catch (error) {
            console.error("Failed to send message:", error);
            setNewMessage(messageToSend);
        }
    };

    const otherUser = conversation?.participantDetails?.find(p => p.uid !== currentUser.uid);

    return (
        <Card className="flex flex-col h-full">
            <CardHeader className="border-b">
                 <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" className="md:hidden" onClick={onBack}>
                        <ArrowLeft className="h-4 w-4" />
                        <span className="sr-only">Back to conversations</span>
                    </Button>
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={otherUser?.photoURL ?? undefined} alt={otherUser?.displayName ?? 'User'} />
                        <AvatarFallback>{otherUser?.displayName?.split(" ").map(n => n[0]).join("") || 'U'}</AvatarFallback>
                    </Avatar>
                    <div>
                        <CardTitle>{otherUser?.displayName || 'Loading...'}</CardTitle>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 min-h-0">
                 <ScrollArea className="h-full" viewportRef={scrollAreaRef}>
                     <div className="p-4 md:p-6">
                        {messagesLoading ? (
                            <div className="space-y-4">
                                <div className="flex items-end gap-2 justify-start"><Skeleton className="h-10 w-10 rounded-full" /><Skeleton className="h-10 w-48 rounded-xl" /></div>
                                <div className="flex items-end gap-2 justify-end"><Skeleton className="h-10 w-32 rounded-xl" /></div>
                                <div className="flex items-end gap-2 justify-end"><Skeleton className="h-16 w-64 rounded-xl" /></div>
                                <div className="flex items-end gap-2 justify-start"><Skeleton className="h-10 w-10 rounded-full" /><Skeleton className="h-10 w-24 rounded-xl" /></div>
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="flex h-full flex-col items-center justify-center text-center p-4 min-h-[300px]">
                                <MessageSquareText size={48} className="text-muted-foreground/50" />
                                <h3 className="mt-4 text-lg font-semibold">No messages yet</h3>
                                <p className="text-muted-foreground mt-1">Send the first message to start the conversation.</p>
                            </div>
                        ) : messages.map((msg, index) => {
                            const isSender = msg.senderId === currentUser.uid;
                            const prevMsg = messages[index - 1];
                            const nextMsg = messages[index + 1];

                            const isFirstInGroup = !prevMsg || prevMsg.senderId !== msg.senderId;
                            const isLastInGroup = !nextMsg || nextMsg.senderId !== msg.senderId;
                        
                            return (
                                <div key={msg.id} className={cn(
                                    "flex items-end gap-2",
                                    isSender ? "justify-end" : "justify-start",
                                    isFirstInGroup ? "mt-4" : "mt-1",
                                )}>
                                    {!isSender && (
                                        <Avatar className={cn("h-8 w-8", !isLastInGroup && "invisible")}>
                                            <AvatarImage src={otherUser?.photoURL ?? undefined} alt={otherUser?.displayName ?? 'U'} />
                                            <AvatarFallback>{otherUser?.displayName?.split(" ").map(n => n[0]).join("") || 'U'}</AvatarFallback>
                                        </Avatar>
                                    )}
                                    <div className={cn(
                                        "px-4 py-2 rounded-xl max-w-sm md:max-w-md",
                                        isSender ? "bg-primary text-primary-foreground" : "bg-muted",
                                        isSender && isLastInGroup && "rounded-br-sm",
                                        !isSender && isLastInGroup && "rounded-bl-sm",
                                    )}>
                                        <p className="whitespace-pre-wrap">{msg.text}</p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </ScrollArea>
            </CardContent>
            <CardFooter className="border-t p-4 bg-background">
                 <form onSubmit={handleSendMessage} className="flex w-full items-center gap-2">
                    <Textarea 
                        ref={textareaRef}
                        placeholder="Type your message..." 
                        className="flex-1 resize-none max-h-32 bg-card" 
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
