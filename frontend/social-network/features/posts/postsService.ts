import { Post } from '@/features/posts/types';
import { http } from '@/libs/apiFetch';

export const postsService = {
  async getFeed(page = 1, limit = 20): Promise<Post[]> {
    try {
      const response = await http.get<Post>(`/api/v1/feed?page=${page}&limit=${limit}`);
      if (!response) {
        return [];
      }
      return Array.isArray(response) ? response : (Array.isArray(response.payload) ? response.payload : []);
    } catch (error) {
      return [];
    }
  },

  async createPost(data: { content: string; privacy: 'public' | 'private' | 'followers'; mediaIds?: number[] }): Promise<any> {
    const response = await http.post('/api/v1/posts', data);
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