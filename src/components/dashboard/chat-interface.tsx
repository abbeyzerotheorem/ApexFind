'use client';
import { useState, useMemo, useEffect, useRef } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { collection, query, where, orderBy, doc, onSnapshot, type Timestamp } from 'firebase/firestore';
import type { Conversation, Message, User } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { sendMessage, markConversationAsRead } from '@/lib/chat';
import { Loader2, Send, ArrowLeft, MessagesSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ScrollArea } from '../ui/scroll-area';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';

export default function ChatInterface({ initialConversationId }: { initialConversationId?: string | null }) {
    const { user, loading: userLoading } = useUser();
    const firestore = useFirestore();
    
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loadingConversations, setLoadingConversations] = useState(true);
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
    
    const [messages, setMessages] = useState<Message[]>([]);
    const [loadingMessages, setLoadingMessages] = useState(false);
    
    const [mobileView, setMobileView] = useState<'list' | 'chat'>(initialConversationId ? 'chat' : 'list');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [error, setError] = useState<string | null>(null);

    // Effect to set the initial active conversation ID
    useEffect(() => {
      if (initialConversationId) {
        setActiveConversationId(initialConversationId);
        setMobileView('chat');
      }
    }, [initialConversationId]);

    // 1. Fetch conversations list with a real-time listener
    useEffect(() => {
        if (!user || !firestore) {
            setLoadingConversations(!userLoading);
            return;
        }

        setLoadingConversations(true);
        setError(null);
        const conversationsQuery = query(
            collection(firestore, 'conversations'),
            where('participants', 'array-contains', user.uid)
        );

        const unsubscribe = onSnapshot(conversationsQuery, (querySnapshot) => {
            const convos = querySnapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() } as Conversation))
                .sort((a, b) => (b.lastMessageAt?.toMillis?.() ?? 0) - (a.lastMessageAt?.toMillis?.() ?? 0));
            
            setConversations(convos);
            
            // If there's no active conversation and no initial one, default to the first one
            if (!activeConversationId && !initialConversationId && convos.length > 0) {
                setActiveConversationId(convos[0].id);
            }
            setLoadingConversations(false);
        }, (err) => {
            console.error("Error fetching conversations:", err);
            setError("Could not load your conversations. Please check your connection or try again later.");
            setLoadingConversations(false);
        });

        return () => unsubscribe();
    }, [user, firestore, initialConversationId]);

    // 2. Set up a real-time listener for messages of the active conversation
    useEffect(() => {
        if (!firestore || !activeConversationId) {
            setMessages([]);
            return;
        };

        setLoadingMessages(true);
        const messagesQuery = query(
            collection(firestore, 'conversations', activeConversationId, 'messages'),
            orderBy('createdAt', 'asc')
        );

        const unsubscribe = onSnapshot(messagesQuery, (querySnapshot) => {
            const newMessages = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
            setMessages(newMessages);
            setLoadingMessages(false);
        }, (err) => {
            console.error("Error fetching messages:", err);
            setError("Could not load messages for this conversation.");
            setLoadingMessages(false);
        });

        return () => unsubscribe();
    }, [firestore, activeConversationId]);
    
    // 3. Mark conversation as read when it becomes active
    useEffect(() => {
        if (user?.uid && firestore && activeConversationId) {
            markConversationAsRead(firestore, activeConversationId, user.uid);
        }
    }, [user?.uid, firestore, activeConversationId]);


    // Scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const activeConversation = useMemo(() => {
        return conversations.find(c => c.id === activeConversationId);
    }, [conversations, activeConversationId]);
    
    const otherParticipant = useMemo(() => {
        if (!activeConversation || !user) return null;
        return activeConversation.participantDetails.find(p => p.uid !== user.uid);
    }, [activeConversation, user]);

    if (userLoading) {
        return <div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }
    
    if (error && !loadingConversations) {
        return <div className="flex h-full items-center justify-center text-destructive p-4 text-center">{error}</div>
    }

    return (
        <div className="md:grid md:grid-cols-[300px_1fr] lg:grid-cols-[350px_1fr] h-full">
            {/* Conversation List */}
            <div className={cn('border-r bg-muted/20 flex flex-col h-full', mobileView === 'list' ? 'flex' : 'hidden md:flex')}>
                <div className="p-4 border-b">
                    <h2 className="text-xl font-bold">Messages</h2>
                </div>
                <ScrollArea className="flex-1">
                    {loadingConversations ? (
                        <div className="p-4 space-y-4">
                            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
                        </div>
                    ) : conversations.length > 0 ? (
                        conversations.map(convo => {
                            const otherUser = convo.participantDetails.find(p => p.uid !== user?.uid);
                            const unreadCount = convo.unreadCounts?.[user?.uid ?? ''] || 0;
                            return (
                                <button
                                    key={convo.id}
                                    onClick={() => { setActiveConversationId(convo.id); setMobileView('chat'); }}
                                    className={cn(
                                        "w-full text-left p-4 border-b flex gap-3 items-center hover:bg-muted/50 transition-colors",
                                        activeConversationId === convo.id && 'bg-muted'
                                    )}
                                >
                                    <Avatar>
                                        <AvatarImage src={otherUser?.photoURL ?? undefined} alt={otherUser?.displayName ?? 'User'} />
                                        <AvatarFallback>{otherUser?.displayName?.charAt(0) ?? 'U'}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 overflow-hidden">
                                        <div className="flex justify-between items-start">
                                            <p className="font-semibold truncate">{otherUser?.displayName || 'Unknown User'}</p>
                                            {convo.lastMessageAt && (
                                                <p className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                                                    {formatDistanceToNow((convo.lastMessageAt as Timestamp).toDate(), { addSuffix: true })}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex justify-between items-center mt-1">
                                            <p className="text-sm text-muted-foreground truncate">{convo.lastMessageText || '...'}</p>
                                            {unreadCount > 0 && (
                                                <Badge className="h-5 w-5 p-0 flex items-center justify-center text-xs">{unreadCount}</Badge>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            );
                        })
                    ) : (
                        <div className="p-4 text-center text-muted-foreground h-full flex flex-col items-center justify-center">
                            <MessagesSquare className="h-12 w-12 text-muted-foreground/50 mb-4" />
                            <h3 className="font-semibold text-lg">No conversations yet</h3>
                            <p className="text-sm">Contact an agent to start a chat.</p>
                        </div>
                    )}
                </ScrollArea>
            </div>

            {/* Message Window */}
            <div className={cn('flex flex-col h-full', mobileView === 'chat' ? 'flex' : 'hidden md:flex')}>
                {activeConversation && otherParticipant ? (
                    <MessageWindowContent
                        key={activeConversation.id}
                        conversation={activeConversation}
                        otherParticipant={otherParticipant}
                        currentUser={user!}
                        messages={messages}
                        loadingMessages={loadingMessages}
                        onBack={() => setMobileView('list')}
                        messagesEndRef={messagesEndRef}
                    />
                ) : (
                    !loadingConversations && (
                         <div className="h-full flex-col items-center justify-center bg-muted/50 hidden md:flex">
                            <MessagesSquare className="h-16 w-16 text-muted-foreground/30 mb-4" />
                            <h3 className="text-xl font-semibold">Select a conversation</h3>
                            <p className="text-muted-foreground">Or start a new one by contacting an agent.</p>
                        </div>
                    )
                )}
            </div>
        </div>
    );
}

function MessageWindowContent({ conversation, otherParticipant, currentUser, messages, loadingMessages, onBack, messagesEndRef }: { conversation: Conversation; otherParticipant: any; currentUser: User; messages: Message[]; loadingMessages: boolean; onBack: () => void; messagesEndRef: React.RefObject<HTMLDivElement>; }) {
    const [newMessage, setNewMessage] = useState('');
    const firestore = useFirestore();

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!firestore || !newMessage.trim()) return;
        const text = newMessage;
        setNewMessage('');
        await sendMessage(firestore, conversation.id, currentUser.uid, text);
    };

    return (
        <>
            <div className="p-4 border-b flex items-center gap-4">
                <Button variant="ghost" size="icon" className="md:hidden" onClick={onBack}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <Avatar>
                    <AvatarImage src={otherParticipant.photoURL ?? undefined} />
                    <AvatarFallback>{otherParticipant.displayName?.charAt(0) ?? 'U'}</AvatarFallback>
                </Avatar>
                <h3 className="text-lg font-semibold">{otherParticipant.displayName}</h3>
            </div>
            <ScrollArea className="flex-1 p-4 bg-background">
                {loadingMessages ? (
                    <div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
                ) : (
                    messages.map((msg: Message) => {
                        const isSender = msg.senderId === currentUser.uid;
                        return (
                            <div key={msg.id} className={cn("flex my-2", isSender ? "justify-end" : "justify-start")}>
                                <div className={cn(
                                    "p-3 rounded-lg max-w-sm md:max-w-md",
                                    isSender ? "bg-primary text-primary-foreground" : "bg-muted"
                                )}>
                                    <p className="whitespace-pre-wrap">{msg.text}</p>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </ScrollArea>
            <div className="p-4 border-t bg-muted/20">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                    <Textarea
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                        onKeyDown={e => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage(e);
                            }
                        }}
                        rows={1}
                        className="resize-none"
                    />
                    <Button type="submit" size="icon" disabled={!newMessage.trim()}>
                        <Send className="h-5 w-5" />
                    </Button>
                </form>
            </div>
        </>
    );
}
