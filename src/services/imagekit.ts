/**
 * ImageKit upload service for AK STAR MOD payment screenshots & media assets
 */

export interface ImageKitUploadResult {
  url: string;
  fileId: string;
  name: string;
  thumbnailUrl?: string;
}

export async function uploadScreenshotToImageKit(
  file: File, 
  onProgress?: (percent: number) => void
): Promise<string> {
  const publicKey = import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY || '';
  const urlEndpoint = import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT || '';

  // If ImageKit credentials are configured, perform real upload
  if (publicKey && urlEndpoint) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileName', `payment_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`);
      formData.append('publicKey', publicKey);
      formData.append('folder', '/ak_star_payments');

      const response = await fetch(`${urlEndpoint.replace(/\/$/, '')}/api/v1/files/upload`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        return data.url;
      }
    } catch (err) {
      console.warn('ImageKit network upload failed, converting to local data URI:', err);
    }
  }

  // Resilient browser-side DataURL conversion for instant responsive previews
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.onerror = () => reject(new Error('Failed to read payment screenshot file'));
    reader.readAsDataURL(file);
  });
}
