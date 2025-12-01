import { Post } from './types';
import { http } from '@/libs/apiFetch';

interface GetPostsParams {
  userId?: number;
  groupId?: number;
  following?: boolean;
  page?: number;
  limit?: number;
}

export const postsService = {
  async getPosts(params?: GetPostsParams): Promise<Post[]> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.userId) queryParams.set('userId', params.userId.toString());
      if (params?.groupId) queryParams.set('groupId', params.groupId.toString());
      if (params?.following) queryParams.set('following', 'true');
      if (params?.page) queryParams.set('page', params.page.toString());
      if (params?.limit) queryParams.set('limit', params.limit.toString());
      
      const query = queryParams.toString();
      const endpoint = query ? `/api/v1/posts?${query}` : '/api/v1/posts';
      
      const response = await http.get(endpoint) as any;
      return response || [];
    } catch (error) {
      console.error('Error fetching posts:', error);
      return [];
    }
  },

  async getPost(postId: number): Promise<Post | null> {
    try {
      const response = await http.get(`/api/v1/posts/${postId}`) as any;
      return response || null;
    } catch (error) {
      return null;
    }
  },

  async createPost(data: { 
    content: string; 
    privacy: 'public' | 'private' | 'followers'; 
    mediaIds?: number[];
    groupId?: number;
    allowedList?: number[];
  }): Promise<any> {
    const payload: any = { content: data.content, privacy: data.privacy };
    if (data.mediaIds && data.mediaIds.length > 0) payload.mediaIds = data.mediaIds;
    if (data.groupId) payload.groupId = data.groupId;
    if (data.allowedList && data.allowedList.length > 0) payload.allowedList = data.allowedList;

    const response = await http.post('/api/v1/posts', payload) as any;
    return response;
  },
  async uploadMedia(file: File): Promise<{ mediaId: number }> {
    const reader = new FileReader();
    const toBase64 = () => new Promise<string>((resolve, reject) => {
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    try {
      const dataUrl = await toBase64();
      const base64Data = dataUrl.split(',')[1];
      const payload = {
        fileName: file.name,
        fileType: file.type,
        fileData: base64Data,
        purpose: 'post'
      };
      const res = await http.post('/api/v1/media/upload', payload) as any;
      if (!res || !res.mediaId) throw new Error('Invalid upload response');
      return { mediaId: res.mediaId };
    } catch (err) {
      console.error('uploadMedia error', err);
      throw err;
    }
  },

  async toggleLike(postId: number, isLiked: boolean): Promise<boolean> {
    try {
      if (isLiked) {
        const res = await http.delete(`/api/v1/posts/${postId}/like`);
        return !!res;
      } else {
        const res = await http.post(`/api/v1/posts/${postId}/like`);
        return !!res;
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      return false;
    }
  },

  async deletePost(postId: number): Promise<boolean> {
    try {
      const response = await http.delete(`/api/v1/posts/${postId}`);
      return !!response;
    } catch (error) {
      console.error('Error deleting post:', error);
      return false;
    }
  }
};

export const createPost = postsService.createPost;