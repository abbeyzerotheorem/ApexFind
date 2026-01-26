'use client';

import ChatInterface from "@/components/dashboard/chat-interface";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

function MessagesPageContent() {
    const searchParams = useSearchParams();
    const initialConvoId = searchParams.get('convoId');

    return (
        <div className="flex-grow flex flex-col p-4 sm:p-6 lg:p-8">
            <ChatInterface initialConversationId={initialConvoId} />
        </div>
    );
}

export default function MessagesPage() {
    return (
        <Suspense fallback={
            <div className="flex flex-col flex-grow items-center justify-center space-y-4 bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <h1 className="text-xl text-muted-foreground">Loading Messages...</h1>
            </div>
        }>
            <MessagesPageContent />
        </Suspense>
    )
}
