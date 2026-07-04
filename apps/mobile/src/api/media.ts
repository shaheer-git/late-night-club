import { Platform } from 'react-native';
import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from '../constants/config';

export const mediaApi = {
  upload: async (imageUri: string) => {
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
      throw new Error('Cloudinary configuration is missing. Please check your .env file.');
    }

    const form = new FormData();
    const cleanUri = Platform.OS === 'ios' ? imageUri.replace('file://', '') : imageUri;
    form.append('file', { uri: cleanUri, name: 'photo.jpg', type: 'image/jpeg' } as any);
    form.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: form,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (!response.ok) {
      let msg = response.statusText;
      try {
        const errData = await response.json();
        msg = errData.error?.message || msg;
      } catch (e) {}
      throw new Error(`Upload failed: ${msg}`);
    }

    const data = await response.json();
    return { data: { url: data.secure_url } };
  },
};
