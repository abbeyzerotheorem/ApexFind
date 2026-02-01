
'use client';

import { useState, useMemo } from "react";
import { useUser, useFirestore, useDoc } from "@/firebase";
import { Loader2 } from "lucide-react";
import { doc } from "firebase/firestore";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
                alert("For your security, please sign out and sign back in before deleting your account.");
            } else {
                alert(`An error occurred: ${error.message}`);
            }
            setIsDeleting(false);
        }
    };

    if (userLoading || profileLoading) {
        return (
            <div className="flex flex-col flex-grow items-center justify-center space-y-4 bg-background">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <h1 className="text-xl text-muted-foreground">Loading Settings...</h1>
            </div>
        );
    }
    
    if (!user) return null;

    return (
        <div className="flex flex-col flex-grow bg-background py-8 sm:py-12">
            <div className="mx-auto w-full max-w-4xl flex flex-col flex-grow px-4 sm:px-6 lg:px-8">
                 <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                    Settings
                </h1>
                <p className="mt-1 text-muted-foreground">Manage your notification and account settings.</p>

                <Tabs defaultValue="notifications" className="mt-8">
                    <TabsList className="grid w-full grid-cols-2 max-w-sm">
                        <TabsTrigger value="notifications">Notifications</TabsTrigger>
                        <TabsTrigger value="account">Account</TabsTrigger>
                    </TabsList>
                    <TabsContent value="notifications">
                        <Card className="mt-2">
                            <CardHeader>
                                <CardTitle>Notification Settings</CardTitle>
                                <CardDescription>
                                    Manage how you receive notifications from ApexFind.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="new-listing-alerts" className="font-medium">New Listing Alerts</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Receive emails about new properties that match your saved searches.
                                        </p>
                                    </div>
                                    <Switch id="new-listing-alerts" defaultChecked />
                                </div>
                                <div className="flex items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="chat-notifications" className="font-medium">Chat Notifications</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Get notified when you receive a new message from an agent or client.
                                        </p>
                                    </div>
                                    <Switch id="chat-notifications" defaultChecked />
                                </div>
                                <div className="flex items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="newsletter-emails" className="font-medium">Newsletter Emails</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Receive occasional news, tips, and promotions from ApexFind.
                                        </p>
                                    </div>
                                    <Switch id="newsletter-emails" />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="account">
                         <Card className="mt-2">
                            <CardHeader>
                                <CardTitle>Account Management</CardTitle>
                                <CardDescription>
                                    Manage general account settings.
                                </CardDescription>
                            </CardHeader>
                             <CardContent>
                                <Button variant="outline" onClick={() => signOut().then(() => window.location.href = '/')}>Sign Out</Button>
                            </CardContent>
                        </Card>
                        <Card className="mt-8 bg-destructive/10 border-destructive/20">
                            <CardHeader>
                                <CardTitle className="text-destructive">Danger Zone</CardTitle>
                                <CardDescription className="text-destructive/80">
                                    Permanently delete your account and all associated data. This action cannot be undone.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive">Delete My Account</Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This will permanently delete your account and all associated data. This action cannot be undone.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={handleDeleteAccount} disabled={isDeleting}>
                                                {isDeleting ? 'Deleting...' : 'Yes, delete my account'}
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
