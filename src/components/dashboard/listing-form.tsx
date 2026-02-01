
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
import { X } from 'lucide-react';
import allNigerianStates from '@/jsons/nigeria-states.json';

const propertySchema = z.object({
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  price: z.preprocess((a) => parseInt(z.string().parse(a || '0'), 10), z.number().positive('Price must be positive')),
  beds: z.preprocess((a) => parseInt(z.string().parse(a || '0'), 10), z.number().min(0, 'Cannot be negative')),
  baths: z.preprocess((a) => parseInt(z.string().parse(a || '0'), 10), z.number().min(0, 'Cannot be negative')),
  sqft: z.preprocess((a) => parseInt(z.string().parse(a || '0'), 10), z.number().positive('Sqft must be positive')),
  parking_spaces: z.preprocess((a) => parseInt(z.string().parse(a || '0'), 10), z.number().min(0, 'Cannot be negative')),
  yearBuilt: z.preprocess((a) => (a ? parseInt(z.string().parse(a), 10) : undefined), z.number().min(1800, 'Invalid year').max(new Date().getFullYear(), 'Invalid year').optional()),
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  
  const { register, handleSubmit, control, formState: { errors }, setValue, watch } = useForm<PropertyFormValues>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      address: property?.address || '',
      city: property?.city || '',
      state: property?.state || '',
      price: property?.price || undefined,
      beds: property?.beds || undefined,
      baths: property?.baths || undefined,
      sqft: property?.sqft || undefined,
      parking_spaces: property?.parking_spaces || 0,
      yearBuilt: property?.yearBuilt || undefined,
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
        alert("You have reached the maximum of 10 images.");
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
        } else {
            await addListing(firestore, user.uid, data);
        }
        router.push('/dashboard/listings');
        router.refresh(); 
    } catch (error) {
        console.error("Failed to save listing:", error);
    } finally {
        setIsSubmitting(false);
    }
  };
  
  const homeTypeOptions = ["House", "Apartment (Flat)", "Duplex", "Terrace", "Bungalow", "Commercial", "Land"];
  const statusOptions = ["New", "Active", "Pending", "Sold", "Rented", "Draft", "Archived"];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{property ? 'Edit Property Listing' : 'Create a New Property Listing'}</CardTitle>
        <CardDescription>Fill out the details below to list a property on ApexFind.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6">
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" {...register('address')} />
              {errors.address && <p className="text-sm text-destructive">{errors.address.message}</p>}
            </div>
             <div className="space-y-2">
              <Label htmlFor="listing_type">Listing Type</Label>
                <Controller
                    name="listing_type"
                    control={control}
                    render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger id="listing_type">
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
          
           <div className="grid sm:grid-cols-2 gap-4">
             <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" {...register('city')} />
              {errors.city && <p className="text-sm text-destructive">{errors.city.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Controller
                    name="state"
                    control={control}
                    render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger id="state">
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
              {errors.state && <p className="text-sm text-destructive">{errors.state.message}</p>}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price (₦)</Label>
              <Input id="price" type="number" {...register('price')} />
              {errors.price && <p className="text-sm text-destructive">{errors.price.message}</p>}
            </div>
             <div className="space-y-2">
              <Label htmlFor="home_type">Home Type</Label>
               <Controller
                    name="home_type"
                    control={control}
                    render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger id="home_type">
                                <SelectValue placeholder="Select home type" />
                            </SelectTrigger>
                            <SelectContent>
                                {homeTypeOptions.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    )}
                />
                 {errors.home_type && <p className="text-sm text-destructive">{errors.home_type.message}</p>}
            </div>
          </div>
          
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="space-y-2">
                <Label htmlFor="beds">Bedrooms</Label>
                <Input id="beds" type="number" {...register('beds')} />
                {errors.beds && <p className="text-sm text-destructive">{errors.beds.message}</p>}
            </div>
            <div className="space-y-2">
                <Label htmlFor="baths">Bathrooms</Label>
                <Input id="baths" type="number" {...register('baths')} />
                {errors.baths && <p className="text-sm text-destructive">{errors.baths.message}</p>}
            </div>
            <div className="space-y-2">
                <Label htmlFor="sqft">Square Feet</Label>
                <Input id="sqft" type="number" {...register('sqft')} />
                {errors.sqft && <p className="text-sm text-destructive">{errors.sqft.message}</p>}
            </div>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="space-y-2">
                <Label htmlFor="parking_spaces">Parking Spaces</Label>
                <Input id="parking_spaces" type="number" {...register('parking_spaces')} />
                {errors.parking_spaces && <p className="text-sm text-destructive">{errors.parking_spaces.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="yearBuilt">Year Built</Label>
              <Input id="yearBuilt" type="number" {...register('yearBuilt')} placeholder="e.g. 2010" />
              {errors.yearBuilt && <p className="text-sm text-destructive">{errors.yearBuilt.message}</p>}
            </div>
             <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
               <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger id="status">
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

            <div className="space-y-2">
              <Label htmlFor="image-upload">Property Images (up to 10)</Label>
              <Input 
                id="image-upload" 
                type="file" 
                multiple
                onChange={handleImageUpload} 
                accept="image/*" 
                disabled={uploadProgress !== null || (imageUrls && imageUrls.length >= 10)} />
              {uploadProgress !== null && (
                <div className="flex items-center gap-2 mt-2">
                  <Progress value={uploadProgress} className="w-full" />
                  <span className="text-sm text-muted-foreground">{Math.round(uploadProgress)}%</span>
                </div>
              )}
               {imageUrls && imageUrls.length > 0 && (
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {imageUrls.map((url, index) => (
                        <div key={index} className="relative aspect-video rounded-md overflow-hidden border group">
                            <Image src={url} alt={`Property preview ${index + 1}`} fill className="object-cover" />
                            <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                onClick={() => removeImage(index)}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>
              )}
              {errors.imageUrls && <p className="text-sm text-destructive">{errors.imageUrls.message}</p>}
            </div>


            <div className="space-y-2">
              <Label htmlFor="description">Property Description</Label>
              <Textarea id="description" placeholder="Describe the property..." {...register('description')} />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label htmlFor="power_supply">Power Supply</Label>
                    <Input id="power_supply" placeholder="e.g. 24/7 Generator" {...register('power_supply')} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="water_supply">Water Supply</Label>
                    <Input id="water_supply" placeholder="e.g. Borehole" {...register('water_supply')} />
                </div>
            </div>

            <div className="flex items-center space-x-2">
                <Controller
                    name="is_furnished"
                    control={control}
                    render={({ field }) => (
                         <Checkbox id="is_furnished" checked={field.value} onCheckedChange={field.onChange} />
                    )}
                />
                <Label htmlFor="is_furnished">This property is furnished</Label>
            </div>

            <div className="flex items-center space-x-2">
                <Controller
                    name="has_pool"
                    control={control}
                    render={({ field }) => (
                        <Checkbox id="has_pool" checked={field.value} onCheckedChange={field.onChange} />
                    )}
                />
                <Label htmlFor="has_pool">This property has a swimming pool</Label>
            </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (uploadProgress !== null ? 'Uploading...' : 'Saving...') : (property ? 'Save Changes' : 'Add Listing')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
