export interface User {
  userId: number;
  firstName: string;
  lastName: string;
  nickname?: string;
  avatarId?: number;
}

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