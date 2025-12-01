import { http } from '@/libs/apiFetch';
import type { CreatePostInput, MediaUploadResponse, Post } from '../types';
import { PrivacyLevel } from '@/libs/globalTypes';

export const postsService = {
  async createPost(input: CreatePostInput): Promise<Post> {
    // Validate and normalize privacy value
    const validPrivacy: PrivacyLevel = 
      input.privacy === 'public' || 
      input.privacy === 'private' || 
      input.privacy === 'followers'
        ? input.privacy
        : 'public'; // fallback to public if invalid

    const payload: any = {
      content: input.content.trim(),
      privacy: validPrivacy,
    };
    if (input.mediaIds && input.mediaIds.length > 0) payload.mediaIds = input.mediaIds;
    if (input.allowedList && input.allowedList.length > 0) payload.allowedList = input.allowedList;

    console.log('📤 Creating post with payload:', payload);

    const response = await http.post<Post>('/api/v1/posts', payload);
    
    if (!response) {
      throw new Error('Failed to create post');
    }

    return response;
  },

  async uploadMedia(file: File): Promise<MediaUploadResponse> {
    const arrayBuffer = await file.arrayBuffer();
    const base64 = btoa(
      new Uint8Array(arrayBuffer).reduce(
        (data, byte) => data + String.fromCharCode(byte),
        ''
      )
    );

    const payload = {
      fileName: file.name,
      fileType: file.type || 'application/octet-stream',
      fileData: base64,
      purpose: 'post'
    };

    const response = await http.post<MediaUploadResponse>(
      '/api/v1/media/upload',
      payload
    );

    if (!response) {
      throw new Error('Failed to upload media');
    }

    return response;
  }
};
