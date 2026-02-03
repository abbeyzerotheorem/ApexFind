
'use client';

import { useEffect, useState, useMemo } from "react";
import { useUser, useFirestore, useDoc } from "@/firebase";
import { Loader2, User, Building2, Award, Globe, Phone, FileCheck, Save } from "lucide-react";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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
    const [licenseNumber, setLicenseNumber] = useState('');
    const [verificationBadges, setVerificationBadges] = useState('');

    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');
    const [isError, setIsError] = useState(false);
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
        licenseNumber?: string;
        verificationBadges?: string[];
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
            setLicenseNumber(userProfile.licenseNumber || '');
            setVerificationBadges(userProfile.verificationBadges?.join(', ') || '');
          }
        }
      }, [user, userProfile]);

    const handleProfileImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !user) return;

        setUploadProgress(0);
        setIsSaving(true);
        setSaveMessage('Uploading photo...');
        setIsError(false);
        try {
            const downloadURL = await uploadProfilePicture(file, user.uid, (progress) => {
                setUploadProgress(progress);
            });
            setPhotoURL(downloadURL);
            setUploadProgress(100);
            setSaveMessage('Photo uploaded! Click "Save Changes" to apply.');
            setTimeout(() => setUploadProgress(null), 3000);
        } catch (error: any) {
            setIsError(true);
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
        setIsError(false);
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
                profileData.licenseNumber = licenseNumber;
                profileData.verificationBadges = verificationBadges.split(',').map(s => s.trim()).filter(Boolean);
            }
            await updateUserProfile(firestore, user.uid, profileData);
            setSaveMessage('Profile updated successfully!');
            setTimeout(() => setSaveMessage(''), 5000);
        } catch (error: any) {
            setIsError(true);
            setSaveMessage(`Error: ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    if (userLoading) {
        return (
            <div className="flex flex-col flex-grow items-center justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="mt-4 text-muted-foreground font-medium">Loading your profile...</p>
            </div>
        );
    }
    
    if (!user) return null;

    return (
        <div className="flex flex-col flex-grow bg-background py-8 sm:py-12">
            <div className="mx-auto w-full max-w-4xl flex flex-col flex-grow px-4 sm:px-6 lg:px-8">
                 <div className="flex items-center gap-3 mb-2">
                    <User className="h-8 w-8 text-primary" />
                    <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                        Profile Settings
                    </h1>
                </div>
                <p className="text-muted-foreground mb-8">Manage how you appear to clients and partners on ApexFind.</p>

                {saveMessage && (
                    <Alert variant={isError ? "destructive" : "default"} className={isError ? "" : "bg-green-50 border-green-200 text-green-800 mb-6"}>
                        <div className="flex items-center gap-3">
                            {!isError && <FileCheck className="h-4 w-4" />}
                            <AlertTitle>{isError ? "Error" : "Success"}</AlertTitle>
                        </div>
                        <AlertDescription>{saveMessage}</AlertDescription>
                    </Alert>
                )}

                <Card className="shadow-md">
                    <form onSubmit={handleProfileSave}>
                        <CardHeader className="border-b bg-muted/5">
                            <CardTitle className="flex items-center gap-2">
                                {userProfile?.role === 'agent' ? <Award className="h-5 w-5 text-primary" /> : <User className="h-5 w-5 text-primary" />}
                                {userProfile?.role === 'agent' ? 'Professional Agent Identity' : 'Personal Information'}
                            </CardTitle>
                            <CardDescription>
                                {userProfile?.role === 'agent' 
                                ? 'This information is visible on your public agent profile and property listings.'
                                : 'Update your personal details and how we should contact you.'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-8 py-8">
                            {profileLoading ? (
                                <div className="space-y-6">
                                    <Skeleton className="h-24 w-24 rounded-full mx-auto" />
                                    <Skeleton className="h-12 w-full" />
                                    <Skeleton className="h-12 w-full" />
                                </div>
                            ) : (
                                <>
                                    <div className="flex flex-col items-center sm:flex-row gap-6">
                                        <div className="relative">
                                            <Avatar className="h-28 w-24 sm:h-32 sm:w-32 rounded-xl border-4 border-background shadow-lg">
                                                <AvatarImage src={photoURL} alt={displayName} className="object-cover" />
                                                <AvatarFallback className="text-2xl font-bold">{displayName?.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                                            </Avatar>
                                            {uploadProgress !== null && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-xl">
                                                    <Loader2 className="h-8 w-8 animate-spin text-white" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 space-y-2 w-full">
                                            <Label htmlFor="photo-upload" className="text-base">Profile Photo</Label>
                                            <Input 
                                                id="photo-upload" 
                                                type="file" 
                                                onChange={handleProfileImageUpload} 
                                                accept="image/*" 
                                                disabled={uploadProgress !== null || isSaving}
                                                className="cursor-pointer"
                                            />
                                            <p className="text-xs text-muted-foreground">Recommended: Square image, max 2MB. JPG or PNG.</p>
                                            {uploadProgress !== null && <Progress value={uploadProgress} className="h-1 mt-2" />}
                                        </div>
                                    </div>

                                    <div className="grid sm:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Display Name</Label>
                                            <Input id="name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="e.g. John Doe" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email Address (Locked)</Label>
                                            <Input id="email" type="email" value={user.email || ''} readOnly disabled className="bg-muted/50" />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="phone" className="flex items-center gap-2"><Phone className="h-4 w-4" /> Phone Number</Label>
                                        <Input id="phone" type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="e.g. +234 801 234 5678"/>
                                    </div>

                                    {userProfile?.role === 'agent' && (
                                        <div className="space-y-8 pt-4 border-t">
                                            <div className="grid sm:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <Label htmlFor="title" className="flex items-center gap-2"><Building2 className="h-4 w-4" /> Professional Title</Label>
                                                    <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Principal Consultant" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="company">Agency / Company Name</Label>
                                                    <Input id="company" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="e.g. ApexFind Properties" />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <Label htmlFor="experience">Years of Experience</Label>
                                                    <Input id="experience" type="number" value={experience} onChange={(e) => setExperience(e.target.value)} min="0" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="sales">Properties Sold (Lifetime)</Label>
                                                    <Input id="sales" type="number" value={sales} onChange={(e) => setSales(e.target.value)} min="0" />
                                                </div>
                                            </div>

                                            <div className="grid sm:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <Label htmlFor="license" className="flex items-center gap-2"><FileCheck className="h-4 w-4" /> LASRERA / ESVARBON License</Label>
                                                    <Input id="license" value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} placeholder="e.g. LASRERA/12345" className="font-mono" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="badges">Association Memberships</Label>
                                                    <Input id="badges" value={verificationBadges} onChange={(e) => setVerificationBadges(e.target.value)} placeholder="e.g. NIESV, REAN (comma-separated)" />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="about">Professional Biography</Label>
                                                <Textarea id="about" value={about} onChange={(e) => setAbout(e.target.value)} placeholder="Write a short bio to build trust with potential clients..." rows={5} className="resize-none" />
                                            </div>

                                            <div className="grid sm:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <Label htmlFor="specialties" className="flex items-center gap-2"><Award className="h-4 w-4" /> Specialties</Label>
                                                    <Input id="specialties" value={specialties} onChange={(e) => setSpecialties(e.target.value)} placeholder="Luxury, Commercial, Land (comma-separated)" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="languages" className="flex items-center gap-2"><Globe className="h-4 w-4" /> Spoken Languages</Label>
                                                    <Input id="languages" value={languages} onChange={(e) => setLanguages(e.target.value)} placeholder="English, Yoruba, Igbo (comma-separated)" />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </CardContent>
                        <CardFooter className="flex flex-col sm:flex-row items-center justify-between border-t bg-muted/5 gap-4 py-6">
                            <p className="text-sm text-muted-foreground italic">Last updated: {userProfile?.role === 'agent' ? 'Publicly visible' : 'Private to you'}</p>
                            <Button type="submit" disabled={isSaving || profileLoading} size="lg" className="w-full sm:w-auto font-bold gap-2">
                                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                {isSaving ? "Saving..." : "Save Profile Changes"}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </div>
    )
}
