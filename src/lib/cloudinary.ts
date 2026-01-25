// IMPORTANT: You must set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME in your environment variables.
// You will also need to create an "unsigned" upload preset in your Cloudinary account and name it 'realestate_ng'.

export async function uploadToCloudinary(file: File, folder: string = 'nigeria-properties') {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', 'realestate_ng') // Create this in Cloudinary
  formData.append('folder', folder)
  
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: 'POST',
      body: formData
    }
  )
  
  const data = await response.json()
  
  if (!response.ok) {
    throw new Error(data.error?.message || 'Upload failed')
  }
  
  // Return optimized URL for Nigerian users
  return {
    url: data.secure_url,
    publicId: data.public_id,
    optimizedUrl: data.secure_url.replace('/upload/', '/upload/w_800,q_auto,f_auto/'),
    thumbnailUrl: data.secure_url.replace('/upload/', '/upload/w_400,h_300,c_fill,q_auto,f_auto/')
  }
}
