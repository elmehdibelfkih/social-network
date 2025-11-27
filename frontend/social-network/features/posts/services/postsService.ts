import { Post } from '../types';
import { http } from '../../../libs/apiClient';

export const postsService = {
  async getPost(postId: number): Promise<Post | null> {
    try {
      const response = await http.get(`/api/v1/posts/${postId}`) as any;
      return response?.payload || null;
    } catch (error) {
      return null;
    }
  },

  async createPost(data: { content: string; privacy: 'public' | 'private' | 'followers'; mediaIds?: number[] }): Promise<any> {
    const response = await http.post('/api/v1/posts', data) as any;
    return response.payload;
  },

  async uploadMedia(file: File): Promise<{ mediaId: number }> {
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.onload = async () => {
        try {
          const base64Data = (reader.result as string).split(',')[1];
          // Direct fetch to avoid snackbar errors
          const response = await fetch(`${process.env.NEXT_PUBLIC_GO_API_URL}/api/v1/media/upload`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fileName: file.name,
              fileType: file.type,
              fileData: base64Data,
              Purpose: 'post'
            })
          });
          
          if (!response.ok) {
            throw new Error('Upload failed');
          }
          
          const data = await response.json();
          if (!data || !data.payload || !data.payload.mediaId) {
            throw new Error('Invalid upload response');
          }
          resolve({ mediaId: data.payload.mediaId });
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  async toggleLike(postId: number, isLiked: boolean): Promise<boolean> {
    try {
      const method = isLiked ? 'DELETE' : 'POST';
      const response = await fetch(`${process.env.NEXT_PUBLIC_GO_API_URL}/api/v1/posts/${postId}/like`, {
        method,
        credentials: 'include'
      });
      return response.ok;
    } catch (error) {
      console.error('Error toggling like:', error);
      return false;
    }
  }
};

export const createPost = postsService.createPost;