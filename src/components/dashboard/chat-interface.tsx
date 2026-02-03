'use client';
import { useState, useMemo, useEffect, useRef } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { collection, query, where, orderBy, doc, onSnapshot, type Timestamp } from 'firebase/firestore';
import type { Conversation, Message, User } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { sendMessage, markConversationAsRead } from '@/lib/chat';
import { Loader2, Send, ArrowLeft, MessagesSquare, CheckCheck, Search } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { ScrollArea } from '../ui/scroll-area';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';
import { useSearchParams } from 'next/navigation';
import { Input } from '../ui/input';

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
    const [searchQuery, setSearchQuery] = useState('');

    // Set initial active conversation
    useEffect(() => {
      if (initialConversationId) {
        setActiveConversationId(initialConversationId);
        setMobileView('chat');
      }
    }, [initialConversationId]);

    // REAL-TIME listener for conversations list
    useEffect(() => {
        if (!user || !firestore) return;

        const convosQuery = query(
            collection(firestore, 'conversations'),
            where('participants', 'array-contains', user.uid)
        );

        const unsubscribe = onSnapshot(convosQuery, (snapshot) => {
            const sortedConvos = snapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() } as Conversation))
                .sort((a, b) => {
                    const timeA = a.lastMessageAt?.toMillis?.() ?? 0;
                    const timeB = b.lastMessageAt?.toMillis?.() ?? 0;
                    return timeB - timeA;
                });
            
            setConversations(sortedConvos);
            
            // Default to first conversation on desktop if none selected
            if (!activeConversationId && !initialConversationId && sortedConvos.length > 0 && window.innerWidth >= 768) {
                setActiveConversationId(sortedConvos[0].id);
            }
            setLoadingConversations(false);
        }, (err) => {
            console.error("Error fetching conversations:", err);
            setError("Could not load your conversations. Please check your connection.");
            setLoadingConversations(false);
        });

        return () => unsubscribe();
    }, [user, firestore, activeConversationId, initialConversationId]);


    // REAL-TIME listener for messages in active conversation
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
            setLoadingMessages(false);
        });

        return () => unsubscribe();
    }, [firestore, activeConversationId]);
    
    // Mark as read when active
    useEffect(() => {
        if (user?.uid && firestore && activeConversationId) {
            const activeConvo = conversations.find(c => c.id === activeConversationId);
            const unreadCount = activeConvo?.unreadCounts?.[user.uid] || 0;
            if (unreadCount > 0) {
                markConversationAsRead(firestore, activeConversationId, user.uid);
            }
        }
    }, [user?.uid, firestore, activeConversationId, conversations, messages.length]);


    // Auto-scroll logic
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }

    useEffect(() => {
        if (messages.length > 0) {
            // Short delay to ensure DOM is ready
            const timer = setTimeout(scrollToBottom, 100);
            return () => clearTimeout(timer);
        }
    }, [messages, activeConversationId]);

    const filteredConversations = useMemo(() => {
        if (!searchQuery.trim()) return conversations;
        const q = searchQuery.toLowerCase();
        return conversations.filter(c => 
            c.participantDetails.some(p => 
                p.uid !== user?.uid && (p.displayName?.toLowerCase().includes(q))
            )
        );
    }, [conversations, searchQuery, user?.uid]);

    const activeConversation = useMemo(() => {
        return conversations.find(c => c.id === activeConversationId);
    }, [conversations, activeConversationId]);
    
    const otherParticipant = useMemo(() => {
        if (!activeConversation || !user) return null;
        return activeConversation.participantDetails.find(p => p.uid !== user.uid);
    }, [activeConversation, user]);

    if (userLoading) {
        return <div className="flex h-[calc(100dvh-64px)] items-center justify-center bg-background"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;
    }
    
    if (error && !loadingConversations) {
        return <div className="flex h-[calc(100dvh-64px)] items-center justify-center text-destructive p-4 text-center bg-background">{error}</div>
    }

    return (
        <div className="flex h-[calc(100dvh-64px)] bg-background overflow-hidden relative">
            {/* Conversation List */}
            <div className={cn(
                'border-r flex flex-col h-full bg-white transition-all duration-300',
                mobileView === 'list' ? 'w-full md:w-[300px] lg:w-[380px]' : 'hidden md:flex md:w-[300px] lg:w-[380px]'
            )}>
                <div className="p-6 border-b space-y-4 shrink-0">
                    <h2 className="text-2xl font-bold tracking-tight">Messages</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Search people..." 
                            className="pl-9 bg-muted/50 border-none h-10 focus-visible:ring-1"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
                <ScrollArea className="flex-1 overflow-y-auto">
                    {loadingConversations ? (
                        <div className="p-4 space-y-4">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="flex gap-3 items-center p-2">
                                    <Skeleton className="h-12 w-12 rounded-full" />
                                    <div className="flex-1 space-y-2">
                                        <Skeleton className="h-4 w-24" />
                                        <Skeleton className="h-3 w-full" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : filteredConversations.length > 0 ? (
                        <div className="divide-y divide-muted/10">
                            {filteredConversations.map(convo => {
                                const otherUser = convo.participantDetails.find(p => p.uid !== user?.uid);
                                const unreadCount = convo.unreadCounts?.[user?.uid ?? ''] || 0;
                                const isActive = activeConversationId === convo.id;
                                return (
                                    <button
                                        key={convo.id}
                                        onClick={() => { setActiveConversationId(convo.id); setMobileView('chat'); }}
                                        className={cn(
                                            "w-full text-left p-4 flex gap-4 items-center transition-all hover:bg-primary/5",
                                            isActive ? 'bg-primary/5 border-l-4 border-primary' : 'border-l-4 border-transparent'
                                        )}
                                    >
                                        <div className="relative shrink-0">
                                            <Avatar className="h-12 w-12 shadow-sm border border-muted">
                                                <AvatarImage src={otherUser?.photoURL ?? undefined} alt={otherUser?.displayName ?? 'User'} className="object-cover" />
                                                <AvatarFallback className="bg-primary/10 text-primary font-bold">{otherUser?.displayName?.charAt(0) ?? 'U'}</AvatarFallback>
                                            </Avatar>
                                            {unreadCount > 0 && !isActive && (
                                                <span className="absolute -top-1 -right-1 block h-3 w-3 rounded-full bg-primary border-2 border-white animate-pulse" />
                                            )}
                                        </div>
                                        <div className="flex-1 overflow-hidden">
                                            <div className="flex justify-between items-center mb-1">
                                                <p className={cn("font-bold truncate", unreadCount > 0 && !isActive ? "text-foreground" : "text-muted-foreground")}>
                                                    {otherUser?.displayName || 'Unnamed User'}
                                                </p>
                                                {convo.lastMessageAt && (
                                                    <p className="text-[10px] uppercase font-bold text-muted-foreground flex-shrink-0 ml-2">
                                                        {formatDistanceToNow((convo.lastMessageAt as Timestamp).toDate(), { addSuffix: false })}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <p className={cn("text-sm truncate", unreadCount > 0 && !isActive ? "text-foreground font-bold" : "text-muted-foreground")}>
                                                    {convo.lastMessageText || 'Start a new conversation'}
                                                </p>
                                                {unreadCount > 0 && !isActive && (
                                                    <Badge className="h-5 min-w-[20px] px-1 rounded-full text-[10px] font-black">{unreadCount}</Badge>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="p-12 text-center h-full flex flex-col items-center justify-center">
                            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                                <MessagesSquare className="h-8 w-8 text-muted-foreground/50" />
                            </div>
                            <h3 className="font-bold text-lg">No chats found</h3>
                            <p className="text-sm text-muted-foreground mt-1">Connect with an agent to get started.</p>
                        </div>
                    )}
                </ScrollArea>
            </div>

            {/* Message Window */}
            <div className={cn(
                'flex-1 flex flex-col h-full bg-muted/10 transition-all duration-300',
                mobileView === 'chat' ? 'flex' : 'hidden md:flex'
            )}>
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
                         <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-white/50">
                            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                                <MessagesSquare className="h-12 w-12 text-primary opacity-40" />
                            </div>
                            <h3 className="text-2xl font-bold">Your Inbox</h3>
                            <p className="text-muted-foreground max-w-xs mt-2">Select a conversation from the left to start messaging real estate professionals.</p>
                        </div>
                    )
                )}
            </div>
        </div>
    );
}

function MessageWindowContent({ conversation, otherParticipant, currentUser, messages, loadingMessages, onBack, messagesEndRef }: { conversation: Conversation; otherParticipant: any; currentUser: User; messages: Message[]; loadingMessages: boolean; onBack: () => void; messagesEndRef: React.RefObject<HTMLDivElement>; }) {
    const searchParams = useSearchParams();
    const initialMessage = searchParams.get('msg');
    const [newMessage, setNewMessage] = useState('');
    const firestore = useFirestore();

    useEffect(() => {
        if (initialMessage && messages.length === 0) {
            setNewMessage(decodeURIComponent(initialMessage));
        }
    }, [initialMessage, messages.length]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!firestore || !newMessage.trim()) return;
        const text = newMessage;
        setNewMessage('');
        await sendMessage(firestore, conversation.id, currentUser.uid, text);
    };

    const isLastMessageRead = useMemo(() => {
        if (currentUser.uid !== conversation.lastMessageSenderId) return false;
        const otherUser = conversation.participantDetails.find(p => p.uid !== currentUser.uid);
        if (!otherUser) return false;
        const lastReadTimestamp = conversation.readStatus?.[otherUser.uid]?.lastReadAt;
        const lastMessageTimestamp = conversation.lastMessageAt;
        if (!lastReadTimestamp || !lastMessageTimestamp) return false;
        return lastReadTimestamp.toMillis() >= lastMessageTimestamp.toMillis();
    }, [conversation, currentUser.uid]);

    return (
        <div className="flex flex-col h-full relative overflow-hidden">
            {/* Window Header */}
            <div className="p-4 md:p-6 border-b bg-white flex items-center gap-4 shadow-sm z-10 shrink-0">
                <Button variant="ghost" size="icon" className="md:hidden -ml-2 rounded-full" onClick={onBack}>
                    <ArrowLeft className="h-6 w-6" />
                </Button>
                <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border shadow-sm">
                        <AvatarImage src={otherParticipant.photoURL ?? undefined} className="object-cover" />
                        <AvatarFallback className="bg-primary/10 text-primary font-bold">{otherParticipant.displayName?.charAt(0) ?? 'U'}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h3 className="text-lg font-bold leading-none">{otherParticipant.displayName || 'Unnamed User'}</h3>
                        <p className="text-[10px] uppercase font-black text-primary mt-1 flex items-center gap-1">
                            <span className="block h-1.5 w-1.5 rounded-full bg-green-500" /> Active Now
                        </p>
                    </div>
                </div>
            </div>
            
            {/* Messages Area */}
            <ScrollArea className="flex-1 bg-muted/5 relative">
                <div className="p-4 md:p-6 space-y-4">
                    {loadingMessages && messages.length === 0 ? (
                        <div className="flex h-full items-center justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                    ) : (
                        <>
                            {messages.map((msg: Message, index: number) => {
                                const isSender = msg.senderId === currentUser.uid;
                                const isLastMessage = index === messages.length - 1;
                                const msgDate = msg.createdAt ? (msg.createdAt as Timestamp).toDate() : new Date();
                                
                                return (
                                    <div key={msg.id} className={cn("flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-300", isSender ? "items-end" : "items-start")}>
                                        <div className={cn(
                                            "p-3 md:p-4 rounded-2xl max-w-[90%] md:max-w-[75%] lg:max-w-[65%] shadow-sm text-sm md:text-base leading-relaxed",
                                            isSender 
                                                ? "bg-primary text-primary-foreground rounded-tr-none" 
                                                : "bg-white text-foreground border rounded-tl-none"
                                        )}>
                                            <p className="whitespace-pre-wrap">{msg.text}</p>
                                            <div className={cn(
                                                "text-[10px] mt-1.5 opacity-70 font-medium",
                                                isSender ? "text-right" : "text-left"
                                            )}>
                                                {format(msgDate, "h:mm a")}
                                            </div>
                                        </div>
                                        {isSender && isLastMessage && isLastMessageRead && (
                                            <div className="flex items-center mt-1 pr-1 text-[10px] font-bold text-primary uppercase tracking-widest">
                                                <CheckCheck className="h-3 w-3 mr-1" />
                                                <span>Read</span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} className="h-4" />
                        </>
                    )}
                </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 md:p-6 border-t bg-white shrink-0">
                <form onSubmit={handleSendMessage} className="flex items-end gap-3 max-w-5xl mx-auto">
                    <div className="flex-1 bg-muted/30 rounded-2xl p-1 px-2 border border-muted focus-within:ring-1 focus-within:ring-primary transition-all">
                        <Textarea
                            placeholder="Type a message..."
                            value={newMessage}
                            onChange={e => setNewMessage(e.target.value)}
                            onKeyDown={e => {
                                if (e.key === 'Enter' && !e.shiftKey && !(/Android|iPhone|iPad/i.test(navigator.userAgent))) {
                                    e.preventDefault();
                                    handleSendMessage(e);
                                }
                            }}
                            rows={1}
                            className="resize-none border-none bg-transparent focus-visible:ring-0 text-sm md:text-base min-h-[44px] max-h-32 py-3"
                        />
                    </div>
                    <Button 
                        type="submit" 
                        size="icon" 
                        disabled={!newMessage.trim()} 
                        className="h-[44px] w-[44px] rounded-2xl shrink-0 shadow-lg"
                    >
                        <Send className="h-5 w-5" />
                    </Button>
                </form>
                <p className="text-[10px] text-center text-muted-foreground mt-3 uppercase tracking-widest font-black opacity-50">
                    ApexFind Secure Messaging
                </p>
            </div>
        </div>
    );
}