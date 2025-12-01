export type PrivacyLevel = 'public' | 'private' | 'followers';

export interface Post {
  postId: number;
  authorId: number;
  authorFirstName: string;
  authorLastName: string;
  authorNickname?: string | null;
  content: string;
  privacy: PrivacyLevel;
  mediaIds: number[] | null;
  isLikedByUser: boolean;
  stats: {
    reactionCount: number;
    commentCount: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreatePostInput {
  content: string;
  privacy: PrivacyLevel;
  mediaIds?: number[];
  allowedList?: number[];
}

export interface MediaUploadResponse {
  mediaId: number;
  mediaPath: string;
  fileType: string;
  uploadedAt: string;
}