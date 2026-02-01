
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { useUser, useFirestore } from '@/firebase';
import type { Property } from '@/types';
import { getOrCreateConversation } from '@/lib/chat';
import { Loader2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type Agent = {
    id: string;
    displayName?: string;
    photoURL?: string;
}

export default function AgentCard({ agent, property }: { agent: Agent | null, property: Property }) {
    const { user } = useUser();
    const firestore = useFirestore();
    const router = useRouter();
    const [isContacting, setIsContacting] = useState(false);
    const [showAuthDialog, setShowAuthDialog] = useState(false);

    const handleContactAgent = async (e: React.MouseEvent | React.FormEvent) => {
        e.preventDefault();
        const form = e.currentTarget as HTMLFormElement;
        const message = (form.elements.namedItem('message') as HTMLTextAreaElement).value;

        if (!user || !firestore) {
            setShowAuthDialog(true);
            return;
        }
        if (!agent) {
          console.error("Agent data not loaded yet.");
          return;
        }

        setIsContacting(true);
        try {
            const conversationId = await getOrCreateConversation(
                firestore,
                { uid: user.uid, displayName: user.displayName, photoURL: user.photoURL },
                { uid: agent.id, displayName: agent.displayName || null, photoURL: agent.photoURL || null }
            );
            router.push(`/messages?convoId=${conversationId}&msg=${encodeURIComponent(message)}`);
        } catch (error) {
            console.error("Failed to create conversation", error);
        } finally {
            setIsContacting(false);
        }
    };
    
    if (!agent) {
        return <Skeleton className="h-96 w-full" />
    }
    
    return (
        <>
            <div className="lg:sticky top-24">
                <Card>
                    <CardHeader className="flex flex-row items-center gap-4 p-4">
                        <Avatar className="h-16 w-16">
                            <AvatarImage src={agent.photoURL || `https://api.dicebear.com/8.x/initials/svg?seed=${agent.displayName || 'A'}`} alt={agent.displayName || 'Agent'} />
                            <AvatarFallback>{agent.displayName?.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
                        </Avatar>
                        <div>
                            <CardTitle>{agent.displayName}</CardTitle>
                            <CardDescription>Listing Agent</CardDescription>
                            <Button asChild variant="link" className="p-0 h-auto">
                                <Link href={`/agents/${agent.id}`}>View Profile</Link>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <form className="space-y-4" onSubmit={handleContactAgent}>
                          <div>
                            <Label htmlFor="message" className="sr-only">Message</Label>
                            <Textarea id="message" name="message" rows={4} defaultValue={`I am interested in ${property.address}.`} />
                          </div>
                          <Button type="submit" className="w-full" disabled={isContacting}>
                            {isContacting ? <Loader2 className="animate-spin" /> : 'Contact Agent'}
                          </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
             <AlertDialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Create an Account to Continue</AlertDialogTitle>
                  <AlertDialogDescription>
                    To save properties, schedule tours, and contact agents, you need to have an account. It's free and only takes a minute!
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => router.push('/auth')}>Sign Up / Sign In</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
