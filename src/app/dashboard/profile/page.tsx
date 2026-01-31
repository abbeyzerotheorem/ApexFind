
'use client';

import { useEffect, useState, useMemo } from "react";
import { useUser, useFirestore, useDoc } from "@/firebase";
import { Loader2 } from "lucide-react";
import { doc } from "firebase/firestore";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { updateUserProfile, uploadProfilePicture } from "@/lib/user";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";


export default function ProfilePage() {
    const { user, loading: userLoading } = useUser();
    const firestore = useFirestore();

    const [displayName, setDisplayName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [photoURL, setPhotoURL] = useState('');
    const [about, setAbout] = useState('');
    const [specialties, setSpecialties] = useState('');
    const [languages, setLanguages] = useState('');
    const [title, setTitle] = useState('');
    const [company, setCompany] = useState('');
    const [experience, setExperience] = useState('');
    const [sales, setSales] = useState('');

    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');
    const [uploadProgress, setUploadProgress] = useState<number | null>(null);
    
    const userDocRef = useMemo(() => {
        if (!user || !firestore) return null;
        return doc(firestore, 'users', user.uid);
    }, [user, firestore]);
    
    const { data: userProfile, loading: profileLoading } = useDoc<{
        phoneNumber?: string, 
        role?: 'customer' | 'agent', 
        displayName?: string, 
        photoURL?: string,
        about?: string,
        specialties?: string[],
        languages?: string[],
        title?: string;
        company?: string;
        experience?: number;
        sales?: number;
    }>(userDocRef);

    useEffect(() => {
        if (user) {
          setDisplayName(user.displayName || '');
          setPhotoURL(user.photoURL || '');
        }
        if (userProfile) {
          setDisplayName(userProfile.displayName || user?.displayName || '');
          setPhoneNumber(userProfile.phoneNumber || '');
          setPhotoURL(userProfile.photoURL || user?.photoURL || '');
          if (userProfile.role === 'agent') {
            setAbout(userProfile.about || '');
            setSpecialties(userProfile.specialties?.join(', ') || '');
            setLanguages(userProfile.languages?.join(', ') || '');
            setTitle(userProfile.title || '');
            setCompany(userProfile.company || '');
            setExperience(String(userProfile.experience || ''));
            setSales(String(userProfile.sales || ''));
          }
        }
      }, [user, userProfile]);

    const handleProfileImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !user) return;

        setUploadProgress(0);
        setIsSaving(true);
        setSaveMessage('Uploading...');
        try {
        const downloadURL = await uploadProfilePicture(file, user.uid, (progress) => {
            setUploadProgress(progress);
        });
        setPhotoURL(downloadURL);
        setUploadProgress(100);
        setSaveMessage('Upload complete! Save profile to apply changes.');
        setTimeout(() => {
            setUploadProgress(null);
        }, 5000);
        } catch (error: any) {
            setSaveMessage(`Upload failed: ${error.message}`);
            setUploadProgress(null);
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleProfileSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !firestore) return;

        setIsSaving(true);
        setSaveMessage('');
        try {
            const profileData: any = {
                displayName,
                phoneNumber,
                photoURL
            };
            if (userProfile?.role === 'agent') {
                profileData.about = about;
                profileData.specialties = specialties.split(',').map(s => s.trim()).filter(Boolean);
                profileData.languages = languages.split(',').map(s => s.trim()).filter(Boolean);
                profileData.title = title;
                profileData.company = company;
                profileData.experience = Number(experience) || 0;
                profileData.sales = Number(sales) || 0;
            }
            await updateUserProfile(firestore, user.uid, profileData);
            setSaveMessage('Profile updated successfully!');
            setTimeout(() => setSaveMessage(''), 3000);
        } catch (error: any) {
            setSaveMessage(`Error: ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    if (userLoading || profileLoading) {
        return (
            <div className="flex flex-col flex-grow items-center justify-center space-y-4 bg-background">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <h1 className="text-xl text-muted-foreground">Loading Profile...</h1>
            </div>
        );
    }
    
    if (!user) return null;

    return (
        <div className="flex flex-col flex-grow bg-background py-8 sm:py-12">
            <div className="mx-auto w-full max-w-4xl flex flex-col flex-grow px-4 sm:px-6 lg:px-8">
                 <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                    Profile
                </h1>
                <p className="mt-1 text-muted-foreground">Manage your public profile information.</p>

                <Card className="mt-8">
                    <form onSubmit={handleProfileSave}>
                        <CardHeader>
                            <CardTitle>{userProfile?.role === 'agent' ? 'Agent Profile' : 'Personal Information'}</CardTitle>
                            <CardDescription>
                                {userProfile?.role === 'agent' 
                                ? 'This information will be displayed on your public agent page.'
                                : 'Update your name and contact details.'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-6">
                            {profileLoading ? (
                                <Skeleton className="h-64 w-full" />
                            ) : (
                                <>
                                    <div className="space-y-2">
                                        <Label>Profile Picture</Label>
                                        <div className="flex items-center gap-4">
                                            <Avatar className="h-20 w-20">
                                                <AvatarImage src={photoURL} alt={displayName} />
                                                <AvatarFallback>{displayName?.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-grow">
                                                <Input 
                                                    id="photo-upload" 
                                                    type="file" 
                                                    onChange={handleProfileImageUpload} 
                                                    accept="image/*" 
                                                    disabled={uploadProgress !== null}
                                                />
                                                {uploadProgress !== null && (
                                                <div className="flex items-center gap-2 mt-2">
                                                    <Progress value={uploadProgress} className="w-full" />
                                                    <span className="text-sm text-muted-foreground">{Math.round(uploadProgress)}%</span>
                                                </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Full Name</Label>
                                            <Input id="name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email</Label>
                                            <Input id="email" type="email" value={user.email || ''} readOnly disabled />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone Number</Label>
                                        <Input id="phone" type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="e.g. +234 801 234 5678"/>
                                    </div>

                                    {userProfile?.role === 'agent' && (
                                        <>
                                            <div className="grid sm:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="title">Professional Title</Label>
                                                    <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Principal Agent" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="company">Company</Label>
                                                    <Input id="company" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="e.g. ApexFind Realty" />
                                                </div>
                                            </div>
                                            <div className="grid sm:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="experience">Years of Experience</Label>
                                                    <Input id="experience" type="number" value={experience} onChange={(e) => setExperience(e.target.value)} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="sales">Sales (24 mo)</Label>
                                                    <Input id="sales" type="number" value={sales} onChange={(e) => setSales(e.target.value)} />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="about">About Me</Label>
                                                <Textarea id="about" value={about} onChange={(e) => setAbout(e.target.value)} placeholder="Tell clients a little about yourself..." />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="specialties">Specialties</Label>
                                                <Input id="specialties" value={specialties} onChange={(e) => setSpecialties(e.target.value)} placeholder="Luxury Homes, Commercial (comma-separated)" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="languages">Languages</Label>
                                                <Input id="languages" value={languages} onChange={(e) => setLanguages(e.target.value)} placeholder="English, Yoruba (comma-separated)" />
                                            </div>
                                        </>
                                    )}
                                </>
                            )}
                        </CardContent>
                        <CardFooter className="flex-col items-start gap-2">
                            <Button type="submit" disabled={isSaving}>
                                {isSaving ? (uploadProgress !== null ? "Uploading..." : "Saving...") : "Save Changes"}
                            </Button>
                            {saveMessage && <p className="text-sm text-muted-foreground">{saveMessage}</p>}
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </div>
    )
}

    