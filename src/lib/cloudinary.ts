// IMPORTANT: You must set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME in your environment variables.
// You will also need to create an "unsigned" upload preset in your Cloudinary account and name it 'realestate_ng'.

export function uploadToCloudinary(
  file: File,
  onProgress: (progress: number) => void,
  folder: string = 'nigeria-properties'
): Promise<{ url: string; publicId: string; optimizedUrl: string; thumbnailUrl: string }> {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'realestate_ng'); // Create this in Cloudinary
    formData.append('folder', folder);

    const xhr = new XMLHttpRequest();
    xhr.open(
      'POST',
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`
    );

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const progress = Math.round((event.loaded * 100) / event.total);
        onProgress(progress);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const data = JSON.parse(xhr.responseText);
        resolve({
          url: data.secure_url,
          publicId: data.public_id,
          optimizedUrl: data.secure_url.replace('/upload/', '/upload/w_800,q_auto,f_auto/'),
          thumbnailUrl: data.secure_url.replace('/upload/', '/upload/w_400,h_300,c_fill,q_auto,f_auto/')
        });
      } else {
        try {
            const data = JSON.parse(xhr.responseText);
            reject(new Error(data.error?.message || 'Upload failed'));
        } catch (e) {
            reject(new Error('Upload failed and could not parse error response.'));
        }
      }
    };

    xhr.onerror = () => {
      reject(new Error('Upload failed due to a network error.'));
    };

    xhr.send(formData);
  });
}
