import axios from 'axios';

const API_URL = 'http://localhost:5000';

export const uploadToIPFS = async (file: File): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post(`${API_URL}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.data.success) {
      return response.data.url;
    } else {
      throw new Error('Upload failed');
    }
  } catch (error) {
    console.error('IPFS Upload Error:', error);
    throw error;
  }
};