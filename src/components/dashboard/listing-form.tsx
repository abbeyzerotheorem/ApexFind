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
import { useState, useEffect } from 'react';
import { useFirestore, useUser } from '@/firebase';
import { addListing, updateListing, uploadPropertyImage } from '@/lib/listings';
import Image from 'next/image';
import { Progress } from '../ui/progress';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

const propertySchema = z.object({
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  price: z.preprocess((a) => parseInt(z.string().parse(a || '0'), 10), z.number().positive('Price must be positive')),
  beds: z.preprocess((a) => parseInt(z.string().parse(a || '0'), 10), z.number().min(0, 'Cannot be negative')),
  baths: z.preprocess((a) => parseInt(z.string().parse(a || '0'), 10), z.number().min(0, 'Cannot be negative')),
  sqft: z.preprocess((a) => parseInt(z.string().parse(a || '0'), 10), z.number().positive('Sqft must be positive')),
  listing_type: z.enum(['sale', 'rent']),
  home_type: z.string().min(1, 'Home type is required'),
  imageUrl: z.string().optional(),
  imageFile: z
    .any()
    .optional()
    .refine(
        (files) => !files || files?.[0]?.size <= MAX_FILE_SIZE,
        `Max image size is 5MB.`
    )
    .refine(
        (files) => !files || ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
        'Only .jpg, .jpeg, .png and .webp formats are supported.'
    ),
  description: z.string().optional(),
  is_furnished: z.boolean().default(false),
  power_supply: z.string().optional(),
  water_supply: z.string().optional(),
}).refine(data => !!data.imageUrl || (data.imageFile && data.imageFile.length > 0), {
    message: "A property image is required.",
    path: ["imageFile"],
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
  const [imagePreview, setImagePreview] = useState<string | null>(property?.imageUrl || null);
  
  const { register, handleSubmit, control, formState: { errors }, watch } = useForm<PropertyFormValues>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      address: property?.address || '',
      city: property?.city || '',
      state: property?.state || '',
      price: property?.price || undefined,
      beds: property?.beds || undefined,
      baths: property?.baths || undefined,
      sqft: property?.sqft || undefined,
      listing_type: property?.listing_type || 'sale',
      home_type: property?.home_type || '',
      imageUrl: property?.imageUrl || '',
      is_furnished: property?.is_furnished || false,
      power_supply: property?.power_supply || '',
      water_supply: property?.water_supply || '',
      description: property?.description || '',
    },
  });

  const imageFile = watch("imageFile");

  useEffect(() => {
    if (imageFile && imageFile.length > 0) {
        const file = imageFile[0];
        const previewUrl = URL.createObjectURL(file);
        setImagePreview(previewUrl);

        return () => URL.revokeObjectURL(previewUrl);
    }
  }, [imageFile]);


  const onSubmit = async (data: PropertyFormValues) => {
    if (!user || !firestore) {
        console.error("User or firestore not available");
        return;
    }
    setIsSubmitting(true);
    setUploadProgress(null);

    let finalImageUrl = property?.imageUrl || '';

    try {
        if (data.imageFile && data.imageFile.length > 0) {
            const file = data.imageFile[0];
            finalImageUrl = await uploadPropertyImage(file, user.uid, setUploadProgress);
        }

        if (!finalImageUrl) {
            throw new Error("Image URL is missing and no new image was uploaded.");
        }

        const listingData = { ...data, imageUrl: finalImageUrl };
        // @ts-ignore
        delete listingData.imageFile;

        if (property?.id) {
            await updateListing(firestore, property.id, listingData);
        } else {
            await addListing(firestore, user.uid, listingData);
        }
        router.push('/dashboard');
        router.refresh(); 
    } catch (error) {
        console.error("Failed to save listing:", error);
    } finally {
        setIsSubmitting(false);
        setUploadProgress(null);
    }
  };
  
  const homeTypeOptions = ["House", "Apartment (Flat)", "Duplex", "Terrace", "Bungalow", "Commercial"];

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
              <Input id="state" {...register('state')} />
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

            <div className="space-y-2">
              <Label htmlFor="imageFile">Property Image</Label>
              {imagePreview && (
                <div className="mt-2 w-full max-w-sm relative aspect-video">
                    <Image src={imagePreview} alt="Image preview" fill className="rounded-md object-cover" />
                </div>
              )}
              <Input id="imageFile" type="file" accept="image/*" {...register('imageFile')} />
              {errors.imageFile && <p className="text-sm text-destructive">{String(errors.imageFile.message)}</p>}
              {uploadProgress !== null && <Progress value={uploadProgress} className="w-full mt-2" />}
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

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (uploadProgress !== null ? `Uploading: ${uploadProgress.toFixed(0)}%` : 'Saving...') : (property ? 'Save Changes' : 'Add Listing')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
