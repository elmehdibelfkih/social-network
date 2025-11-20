export interface Post {
  postId: number;
  authorId: number;
  authorNickname?: string;
  authorFirstName: string;
  authorLastName: string;
  content: string;
  mediaIds?: number[];
  privacy: string;
  isLikedByUser: boolean;
  stats: {
    reactionCount: number;
    commentCount: number;
  };
  createdAt: string;
  updatedAt: string;
  groupId?: number;
}