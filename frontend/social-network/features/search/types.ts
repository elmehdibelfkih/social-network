// 1. Common Types (enums for fixed string values)
type PrivacyLevel = 'public' | 'followers' | 'private';
type MembershipStatus = 'pending' | 'accepted' | 'declined' | null;

// 2. User Definition
interface UserStats {
  postsCount: number;
  followersCount: number;
  followingCount: number;
}

export interface User {
  userId: number;
  status: string; // e.g., "accepted"
  nickname: string;
  firstName: string;
  lastName: string;
  avatarId: number;
  privacy: PrivacyLevel;
  chatId: number | null; // Nullable
  stats: UserStats;
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
  description: string;
  avatarId?: number; // Optional field (might be undefined)
  creatorId: number;
  memberCount: number;
  status: MembershipStatus;
  chatId?: number; // Optional (if user is not a member)
  createdAt: string;
}