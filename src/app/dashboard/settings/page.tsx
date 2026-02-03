
'use client';

import { useState, useMemo } from "react";
import { useUser, useFirestore, useDoc } from "@/firebase";
import { Loader2, AlertTriangle, Bell, Shield, LogOut, Trash2, Mail, MessageSquare, Newspaper } from "lucide-react";
import { doc } from "firebase/firestore";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { signOut } from "@/lib/auth";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { deleteUserAccount } from "@/lib/user";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function SettingsPage() {
    const { user, loading: userLoading } = useUser();
    const firestore = useFirestore();

    const [isDeleting, setIsDeleting] = useState(false);
    
    const userDocRef = useMemo(() => {
        if (!user || !firestore) return null;
        return doc(firestore, 'users', user.uid);
    }, [user, firestore]);
    
    const { data: userProfile, loading: profileLoading } = useDoc<{
        role?: 'customer' | 'agent', 
    }>(userDocRef);
    
    const handleDeleteAccount = async () => {
        if (!user || !firestore) return;
        setIsDeleting(true);
        try {
            await deleteUserAccount(firestore, user.uid, userProfile?.role);
            await signOut();
            window.location.href = '/';
        } catch (error: any)
        {
            console.error("Failed to delete account:", error);
            if (error.code === 'auth/requires-recent-login') {
                alert("For your security, please sign out and sign back in immediately before deleting your account. This is a standard security procedure.");
            } else {
                alert(`An unexpected error occurred: ${error.message}`);
            }
            setIsDeleting(false);
        }
    };

    if (userLoading || profileLoading) {
        return (
            <div className="flex flex-col flex-grow items-center justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="mt-4 text-muted-foreground font-medium">Loading settings...</p>
            </div>
        );
    }
    
    if (!user) return null;

    return (
        <div className="flex flex-col flex-grow bg-background py-8 sm:py-12">
            <div className="mx-auto w-full max-w-4xl flex flex-col flex-grow px-4 sm:px-6 lg:px-8">
                 <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                    Account Settings
                </h1>
                <p className="mt-1 text-muted-foreground">Manage your notifications, security, and privacy preferences.</p>

                <Tabs defaultValue="notifications" className="mt-10">
                    <TabsList className="grid w-full grid-cols-2 max-w-md bg-muted/50 p-1">
                        <TabsTrigger value="notifications" className="gap-2 data-[state=active]:shadow-sm">
                            <Bell className="h-4 w-4" /> Notifications
                        </TabsTrigger>
                        <TabsTrigger value="account" className="gap-2 data-[state=active]:shadow-sm">
                            <Shield className="h-4 w-4" /> Account & Data
                        </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="notifications" className="mt-6 space-y-6">
                        <Card className="shadow-sm">
                            <CardHeader className="border-b bg-muted/5">
                                <CardTitle className="text-lg">Communication Preferences</CardTitle>
                                <CardDescription>
                                    Control how and when ApexFind contacts you.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-6">
                                <div className="flex items-center justify-between rounded-xl border p-5 group hover:bg-muted/5 transition-colors">
                                    <div className="flex gap-4">
                                        <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                                            <Mail className="h-5 w-5 text-primary" />
                                        </div>
                                        <div className="space-y-0.5">
                                            <Label htmlFor="new-listing-alerts" className="text-base font-bold">Listing Alerts</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Receive real-time emails when new properties match your saved searches.
                                            </p>
                                        </div>
                                    </div>
                                    <Switch id="new-listing-alerts" defaultChecked />
                                </div>
                                
                                <div className="flex items-center justify-between rounded-xl border p-5 group hover:bg-muted/5 transition-colors">
                                    <div className="flex gap-4">
                                        <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                                            <MessageSquare className="h-5 w-5 text-primary" />
                                        </div>
                                        <div className="space-y-0.5">
                                            <Label htmlFor="chat-notifications" className="text-base font-bold">Direct Messages</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Get notified on your device when you receive a new message from an agent or client.
                                            </p>
                                        </div>
                                    </div>
                                    <Switch id="chat-notifications" defaultChecked />
                                </div>
                                
                                <div className="flex items-center justify-between rounded-xl border p-5 group hover:bg-muted/5 transition-colors">
                                    <div className="flex gap-4">
                                        <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                                            <Newspaper className="h-5 w-5 text-primary" />
                                        </div>
                                        <div className="space-y-0.5">
                                            <Label htmlFor="newsletter-emails" className="text-base font-bold">Market News & Insights</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Stay updated with Nigerian real estate trends and platform tips.
                                            </p>
                                        </div>
                                    </div>
                                    <Switch id="newsletter-emails" />
                                </div>
                            </CardContent>
                            <CardFooter className="bg-muted/5 border-t py-4 text-xs text-muted-foreground">
                                You can unsubscribe from any marketing emails using the link at the bottom of the message.
                            </CardFooter>
                        </Card>
                    </TabsContent>

                    <TabsContent value="account" className="mt-6 space-y-8">
                         <Card className="shadow-sm">
                            <CardHeader className="border-b bg-muted/5">
                                <CardTitle className="text-lg">Security & Authentication</CardTitle>
                                <CardDescription>
                                    Manage your session and login security.
                                </CardDescription>
                            </CardHeader>
                             <CardContent className="pt-6">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div>
                                        <p className="font-bold">Active Session</p>
                                        <p className="text-sm text-muted-foreground">Currently signed in as {user.email}</p>
                                    </div>
                                    <Button variant="outline" onClick={() => signOut().then(() => window.location.href = '/')} className="gap-2 font-bold">
                                        <LogOut className="h-4 w-4" /> Sign Out from All Devices
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-destructive/20 shadow-sm overflow-hidden">
                            <CardHeader className="bg-destructive/5 border-b border-destructive/10">
                                <CardTitle className="text-destructive flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5" /> Danger Zone
                                </CardTitle>
                                <CardDescription className="text-destructive/80 font-medium">
                                    Permanently delete your account and all associated data.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6">
                                {userProfile?.role === 'agent' && (
                                    <Alert variant="destructive" className="mb-6 bg-destructive/10 border-destructive/20">
                                        <AlertTriangle className="h-4 w-4" />
                                        <AlertTitle className="font-bold">Critical Warning for Agents</AlertTitle>
                                        <AlertDescription className="text-sm font-medium">
                                            Account deletion is final. This will **permanently delete all your property listings**, client lead records, and professional verification status from ApexFind.
                                        </AlertDescription>
                                    </Alert>
                                )}
                                <p className="text-sm text-muted-foreground mb-6">
                                    This action will remove your profile, saved homes, and messages. There is no way to recover your data once it has been deleted.
                                </p>
                                
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive" className="w-full sm:w-auto font-bold gap-2">
                                            <Trash2 className="h-4 w-4" /> Delete My Account & Data
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="max-w-md">
                                        <AlertDialogHeader>
                                            <AlertDialogTitle className="text-2xl">Are you absolutely sure?</AlertDialogTitle>
                                            <AlertDialogDescription className="text-base pt-2">
                                                This action is **irreversible**. You will lose access to your profile and all your saved data. 
                                                {userProfile?.role === 'agent' ? " Your professional listings will be instantly removed from our search engine." : ""}
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter className="mt-6">
                                            <AlertDialogCancel className="h-12 font-bold">Cancel, Keep My Account</AlertDialogCancel>
                                            <AlertDialogAction 
                                                onClick={handleDeleteAccount} 
                                                disabled={isDeleting} 
                                                className="bg-destructive text-white hover:bg-destructive/90 h-12 font-bold"
                                            >
                                                {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                                Yes, Delete Everything
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
