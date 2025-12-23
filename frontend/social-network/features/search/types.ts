// 1. Common Types (enums for fixed string values)
type PrivacyLevel = 'public' | 'followers' | 'private';
type MembershipStatus = 'pending' | 'accepted' | 'declined' | null;

// 2. User Definition
export interface User {
  userId: number;
  nickname: string | null;
  firstName: string;
  lastName: string;
  avatarId: number | null;
  privacy: PrivacyLevel;
}

// 3. Post Definition
interface PostStats {
  reactionCount: number;
  commentCount: number;
}

export interface Post {
  postId: number;
  authorId: number;
  authorNickname: string | null; // Nullable
  authorFirstName: string;
  authorLastName: string;
  content: string;
  mediaIds: number[] | null; // Array of numbers or null
  privacy: PrivacyLevel;
  isLikedByUser: boolean;
  stats: PostStats;
  createdAt: string; // ISO 8601 Date String
  updatedAt: string;
  groupId: number | null; // Nullable
}

// 4. Group Definition
export interface Group {
  groupId: number;
  title: string;
  description: string | null;
  avatarId?: number | null; // Optional field (might be undefined)
  creatorId: number;
  memberCount: number;
  status: 'accepted' | 'pending' | 'declined' | null;
  chatId?: number;
  createdAt?: string;
  upcomingEvent?: {
    title: string;
    date: string;
  };
}