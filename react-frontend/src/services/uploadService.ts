import { API_BASE_URL } from '../constants';

export const uploadService = {
  /**
   * Upload an image file from local machine.
   * Returns the hosted URL of the image.
   */
  uploadImage: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('auth_token');
    const res = await fetch(`${API_BASE_URL}/upload/image`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message ?? 'Upload ảnh thất bại');
    }
    return json.url as string;
  },
};
