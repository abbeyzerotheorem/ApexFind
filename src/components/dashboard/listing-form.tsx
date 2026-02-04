
'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import type { Property } from '@/types';
import { useState } from 'react';
import { useFirestore, useUser } from '@/firebase';
import { addListing, updateListing, uploadPropertyImage } from '@/lib/listings';
import { Progress } from '../ui/progress';
import Image from 'next/image';
import { X, Loader2, Save, AlertCircle } from 'lucide-react';
import allNigerianStates from '@/jsons/nigeria-states.json';
import { useToast } from '@/hooks/use-toast';

const propertySchema = z.object({
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  price: z.coerce.number().positive('Price must be positive'),
  beds: z.coerce.number().min(0, 'Cannot be negative'),
  baths: z.coerce.number().min(0, 'Cannot be negative'),
  sqft: z.coerce.number().positive('Sqft must be positive'),
  parking_spaces: z.coerce.number().min(0, 'Cannot be negative'),
  yearBuilt: z.preprocess((a) => (a === '' || a === null || a === undefined ? undefined : Number(a)), z.number().min(1800, 'Invalid year').max(new Date().getFullYear(), 'Invalid year').optional()),
  listing_type: z.enum(['sale', 'rent']),
  home_type: z.string().min(1, 'Home type is required'),
  status: z.string().optional(),
  imageUrls: z.array(z.string().url()).min(1, 'At least one image is required.').max(10, 'You can upload a maximum of 10 images.'),
  description: z.string().optional(),
  is_furnished: z.boolean().default(false),
  has_pool: z.boolean().default(false),
  power_supply: z.string().optional(),
  water_supply: z.string().optional(),
});


type PropertyFormValues = z.infer<typeof propertySchema>;

interface ListingFormProps {
  property?: Property;
}

export default function ListingForm({ property }: ListingFormProps) {
  const router = useRouter();
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  
  const { register, handleSubmit, control, formState: { errors }, setValue, watch } = useForm<PropertyFormValues>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      address: property?.address || '',
      city: property?.city || '',
      state: property?.state || '',
      price: property?.price,
      beds: property?.beds,
      baths: property?.baths,
      sqft: property?.sqft,
      parking_spaces: property?.parking_spaces || 0,
      yearBuilt: property?.yearBuilt,
      listing_type: property?.listing_type || 'sale',
      home_type: property?.home_type || '',
      status: property?.status || 'New',
      imageUrls: property?.imageUrls || [],
      is_furnished: property?.is_furnished || false,
      has_pool: property?.has_pool || false,
      power_supply: property?.power_supply || '',
      water_supply: property?.water_supply || '',
      description: property?.description || '',
    },
  });

  const imageUrls = watch('imageUrls');

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !user) return;
    
    const currentImageCount = imageUrls?.length || 0;
    const filesToUploadCount = Math.min(files.length, 10 - currentImageCount);

    if (filesToUploadCount <= 0) {
        toast({
            variant: 'destructive',
            title: 'Upload Limit Reached',
            description: 'You can only upload up to 10 images per listing.',
        });
        return;
    }

    setUploadProgress(0);
    setIsSubmitting(true);

    try {
        const filesToUpload = Array.from(files).slice(0, filesToUploadCount);

        const uploadPromises = filesToUpload.map((file, index) => 
            uploadPropertyImage(file, user.uid, (progress) => {
                if (progress !== null) {
                    const totalProgress = (index * 100 + progress) / filesToUpload.length;
                    setUploadProgress(totalProgress);
                }
            })
        );
        
        const uploadedUrls = await Promise.all(uploadPromises);
        setValue('imageUrls', [...(imageUrls || []), ...uploadedUrls], { shouldValidate: true });

        setUploadProgress(100);
        setTimeout(() => setUploadProgress(null), 2000);
    } catch (error) {
        console.error("Image upload failed", error);
        toast({
            variant: 'destructive',
            title: 'Upload Failed',
            description: 'One or more images could not be uploaded. Please try again.',
        });
    } finally {
        setIsSubmitting(false);
        event.target.value = '';
    }
  };

  const removeImage = (index: number) => {
    const currentImages = watch('imageUrls');
    if (currentImages) {
        const newImages = [...currentImages];
        newImages.splice(index, 1);
        setValue('imageUrls', newImages, { shouldValidate: true });
    }
  };

  const onSubmit = async (data: PropertyFormValues) => {
    if (!user || !firestore) {
        console.error("User or firestore not available");
        return;
    }
    setIsSubmitting(true);

    try {
        if (property?.id) {
            await updateListing(firestore, property.id, data);
            toast({
                title: 'Listing Updated',
                description: 'Your changes have been saved successfully.',
            });
        } else {
            await addListing(firestore, user.uid, data);
            toast({
                title: 'Listing Created',
                description: 'Your new property has been listed on ApexFind.',
            });
        }
        router.push('/dashboard/listings');
        router.refresh(); 
    } catch (error: any) {
        console.error("Failed to save listing:", error);
        toast({
            variant: 'destructive',
            title: 'Save Failed',
            description: error.message || 'An unexpected error occurred while saving your listing.',
        });
    } finally {
        setIsSubmitting(false);
    }
  };
  
  const homeTypeOptions = ["House", "Apartment (Flat)", "Duplex", "Terrace", "Bungalow", "Commercial", "Land"];
  const statusOptions = ["New", "Active", "Pending", "Sold", "Rented", "Draft", "Archived"];

  return (
    <Card className="shadow-lg border-2">
      <CardHeader className="bg-muted/10 border-b">
        <CardTitle className="text-2xl font-black">{property ? 'Update Listing Details' : 'List a New Property'}</CardTitle>
        <CardDescription className="font-medium">Maintain high-quality information to attract more potential clients.</CardDescription>
      </CardHeader>
      <CardContent className="pt-8">
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-8">
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="address" className="font-bold">Street Address</Label>
              <Input id="address" {...register('address')} placeholder="e.g. 15 Admiralty Way" className="h-11" />
              {errors.address && <p className="text-xs font-bold text-destructive mt-1">{errors.address.message}</p>}
            </div>
             <div className="space-y-2">
              <Label htmlFor="listing_type" className="font-bold">Transaction Type</Label>
                <Controller
                    name="listing_type"
                    control={control}
                    render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger id="listing_type" className="h-11">
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="sale">For Sale</SelectItem>
                                <SelectItem value="rent">For Rent</SelectItem>
                            </SelectContent>
                        </Select>
                    )}
                />
            </div>
          </div>
          
           <div className="grid sm:grid-cols-2 gap-6">
             <div className="space-y-2">
              <Label htmlFor="city" className="font-bold">City / Neighborhood</Label>
              <Input id="city" {...register('city')} placeholder="e.g. Lekki Phase 1" className="h-11" />
              {errors.city && <p className="text-xs font-bold text-destructive mt-1">{errors.city.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="state" className="font-bold">State</Label>
              <Controller
                    name="state"
                    control={control}
                    render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger id="state" className="h-11">
                                <SelectValue placeholder="Select state" />
                            </SelectTrigger>
                            <SelectContent>
                                {allNigerianStates.map(state => (
                                    <SelectItem key={state.code} value={state.name}>{state.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                />
              {errors.state && <p className="text-xs font-bold text-destructive mt-1">{errors.state.message}</p>}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="price" className="font-bold">Asking Price (₦)</Label>
              <Input id="price" type="number" {...register('price')} placeholder="e.g. 50000000" className="h-11 font-mono" />
              {errors.price && <p className="text-xs font-bold text-destructive mt-1">{errors.price.message}</p>}
            </div>
             <div className="space-y-2">
              <Label htmlFor="home_type" className="font-bold">Property Architecture</Label>
               <Controller
                    name="home_type"
                    control={control}
                    render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger id="home_type" className="h-11">
                                <SelectValue placeholder="Select home type" />
                            </SelectTrigger>
                            <SelectContent>
                                {homeTypeOptions.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    )}
                />
                 {errors.home_type && <p className="text-xs font-bold text-destructive mt-1">{errors.home_type.message}</p>}
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
            <div className="space-y-2">
                <Label htmlFor="beds" className="font-bold">Bedrooms</Label>
                <Input id="beds" type="number" {...register('beds')} className="h-11" />
                {errors.beds && <p className="text-xs font-bold text-destructive mt-1">{errors.beds.message}</p>}
            </div>
            <div className="space-y-2">
                <Label htmlFor="baths" className="font-bold">Bathrooms</Label>
                <Input id="baths" type="number" {...register('baths')} className="h-11" />
                {errors.baths && <p className="text-xs font-bold text-destructive mt-1">{errors.baths.message}</p>}
            </div>
            <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label htmlFor="sqft" className="font-bold">Square Feet</Label>
                <Input id="sqft" type="number" {...register('sqft')} className="h-11" />
                {errors.sqft && <p className="text-xs font-bold text-destructive mt-1">{errors.sqft.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
            <div className="space-y-2">
                <Label htmlFor="parking_spaces" className="font-bold">Parking Slots</Label>
                <Input id="parking_spaces" type="number" {...register('parking_spaces')} className="h-11" />
                {errors.parking_spaces && <p className="text-xs font-bold text-destructive mt-1">{errors.parking_spaces.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="yearBuilt" className="font-bold">Completion Year</Label>
              <Input id="yearBuilt" type="number" {...register('yearBuilt')} placeholder="e.g. 2022" className="h-11" />
              {errors.yearBuilt && <p className="text-xs font-bold text-destructive mt-1">{errors.yearBuilt.message}</p>}
            </div>
             <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label htmlFor="status" className="font-bold">Listing Status</Label>
               <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger id="status" className="h-11">
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                {statusOptions.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    )}
                />
            </div>
          </div>

            <div className="space-y-4 border-t pt-8">
              <div className="flex items-center justify-between">
                <Label htmlFor="image-upload" className="font-bold text-lg">Visual Assets (up to 10 photos)</Label>
                <Badge variant="outline" className="font-bold">{imageUrls?.length || 0} / 10</Badge>
              </div>
              <div className={cn(
                  "relative border-2 border-dashed rounded-2xl p-8 text-center transition-all",
                  (imageUrls && imageUrls.length >= 10) ? "opacity-50 cursor-not-allowed bg-muted" : "hover:bg-primary/5 hover:border-primary/50"
              )}>
                <Input 
                    id="image-upload" 
                    type="file" 
                    multiple
                    onChange={handleImageUpload} 
                    accept="image/*" 
                    disabled={uploadProgress !== null || (imageUrls && imageUrls.length >= 10)} 
                    className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
                />
                <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-2">
                        <Save className="h-6 w-6" />
                    </div>
                    <p className="font-bold">Click to upload or drag and drop</p>
                    <p className="text-xs text-muted-foreground">High-resolution wide-angle photos perform best. JPG or PNG only.</p>
                </div>
              </div>

              {uploadProgress !== null && (
                <div className="space-y-2 mt-4">
                  <div className="flex justify-between text-xs font-bold text-primary uppercase">
                    <span>Uploading Assets...</span>
                    <span>{Math.round(uploadProgress)}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2 rounded-full" />
                </div>
              )}

               {imageUrls && imageUrls.length > 0 && (
                <div className="mt-6 grid grid-cols-2 sm:grid-cols-5 gap-4">
                    {imageUrls.map((url, index) => (
                        <div key={index} className="relative aspect-video rounded-xl overflow-hidden border-2 group shadow-sm">
                            <Image src={url} alt={`Preview ${index + 1}`} fill className="object-cover transition-transform group-hover:scale-110" />
                            <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute top-1.5 right-1.5 h-7 w-7 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-lg"
                                onClick={() => removeImage(index)}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                            {index === 0 && <Badge className="absolute bottom-1.5 left-1.5 bg-primary text-primary-foreground text-[10px] font-black uppercase">Cover</Badge>}
                        </div>
                    ))}
                </div>
              )}
              {errors.imageUrls && <p className="text-xs font-bold text-destructive flex items-center gap-1 mt-2"><AlertCircle size={14} /> {errors.imageUrls.message}</p>}
            </div>


            <div className="space-y-2 border-t pt-8">
              <Label htmlFor="description" className="font-bold">Detailed Description</Label>
              <Textarea id="description" placeholder="Provide a compelling narrative about the property, its location, and unique selling points..." {...register('description')} rows={6} className="resize-none text-base leading-relaxed" />
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <Label htmlFor="power_supply" className="font-bold">Electricity / Power Supply</Label>
                    <Input id="power_supply" placeholder="e.g. 24/7 Grid + Solar Backup" {...register('power_supply')} className="h-11" />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="water_supply" className="font-bold">Water Source</Label>
                    <Input id="water_supply" placeholder="e.g. Industrial Borehole" {...register('water_supply')} className="h-11" />
                </div>
            </div>

            <div className="flex flex-wrap gap-8 py-4 px-6 bg-muted/20 rounded-2xl border">
                <div className="flex items-center space-x-3">
                    <Controller
                        name="is_furnished"
                        control={control}
                        render={({ field }) => (
                            <Checkbox id="is_furnished" checked={field.value} onCheckedChange={field.onChange} className="h-5 w-5 border-2" />
                        )}
                    />
                    <Label htmlFor="is_furnished" className="font-bold cursor-pointer">Fully Furnished</Label>
                </div>

                <div className="flex items-center space-x-3">
                    <Controller
                        name="has_pool"
                        control={control}
                        render={({ field }) => (
                            <Checkbox id="has_pool" checked={field.value} onCheckedChange={field.onChange} className="h-5 w-5 border-2" />
                        )}
                    />
                    <Label htmlFor="has_pool" className="font-bold cursor-pointer">Swimming Pool Available</Label>
                </div>
            </div>

          <div className="flex flex-col sm:flex-row justify-end gap-4 pt-8 border-t">
            <Button type="button" variant="ghost" onClick={() => router.back()} className="h-12 px-8 font-bold">Cancel Changes</Button>
            <Button type="submit" disabled={isSubmitting} size="lg" className="h-12 px-12 font-black text-lg shadow-xl">
                {isSubmitting ? (
                    <span className="flex items-center gap-2"><Loader2 className="h-5 w-5 animate-spin" /> {uploadProgress !== null ? 'Uploading Assets...' : 'Saving Changes...'}</span>
                ) : (
                    <span className="flex items-center gap-2">{property ? <Save size={20} /> : null} {property ? 'Save All Changes' : 'Publish Listing'}</span>
                )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
