
export interface PaginationParams {
    page?: number;
    limit?: number;
}

export type PrivacyLevel = 'public' | 'followers' | 'private' | 'group' | 'restricted';
export type FollowStatus = 'none' | 'follow' | 'accepted' | 'pending' | 'declined';
export type ReactionType = 'like';
export type MediaType = 'image/png' | 'image/jpeg' | 'image/gif';

export interface Session {
    sessionId: number;
    sessionToken?: string;
    ipAddress: string;
    device: string;
    createdAt: string;
    expiresAt: string;
    current?: boolean;
}

export interface AuthResponse {
    userId: number;
    email: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    nickname: string | null;
    aboutMe: string | null;
    avatarId: number | null;
}

export interface UserProfile {
    userId: number;
    email?: string;
    firstName: string;
    lastName: string;
    nickname: string | null;
    aboutMe: string | null;
    avatarId: number | null;
    dateOfBirth?: string;
    joinedAt?: string;
    status?: FollowStatus;
    privacy?: 'public' | 'private';
    chatId?: number | null;
    stats?: {
        postsCount: number;
        followersCount: number;
        followingCount: number;
    };
}

export interface UserStats {
    userId: number;
    postsCount: number;
    followersCount: number;
    followingCount: number;
    likesReceived: number;
    commentsReceived: number;
}

export interface Follower {
    userId: number;
    nickname: string | null;
    firstName: string;
    lastName: string;
    avatarId: number | null;
    followedAt?: string;
    status: FollowStatus;
    privacy: 'public' | 'private';
    chatId: number | null;
    stats: {
        postsCount: number;
        followersCount: number;
        followingCount: number;
    };
}

export interface PostStats {
    reactionCount: number;
    commentCount: number;
}

export interface Post {
    postId: number;
    authorId: number;
    authorNickname: string | null;
    authorLastName: string;
    authorFirstName: string;
    content: string;
    mediaIds?: number[] | null;
    privacy: PrivacyLevel;
    isLikedByUser: boolean;
    stats: PostStats;
    groupId: number | null;
    allowedList?: number[] | null;
    createdAt: string;
    updatedAt: string;
}



export interface Comment {
    commentId: number;
    postId?: number;
    authorId: number;
    authorNickname: string;
    authorLastName: string;
    authorFirstName: string;
    content: string;
    mediaIds: number[] | null;
    createdAt: string;
    updatedAt: string;
}
export interface MediaItem {
    mediaId: number;
    mediaPath?: string;
    fileName?: string;
    fileType?: string;
    uploadedAt?: string;
}

export interface MediaUploadRequest {
    fileName: string;
    fileType: string;
    fileData: string;
    Purpose: 'avatar' | 'post' | 'message' | 'comment';
}

export interface MediaUploadResponse {
    message: string;
    mediaId: number;
    mediaPath: string;
    fileType: string;
    uploadedAt: string;
}

export interface Group {
    groupId: number;
    creatorId: number;
    title: string;
    description: string;
    memberCount?: number;
    avatarId: number | null;

    status: FollowStatus;
    chatId: number | null;

    createdAt: string;
    updatedAt?: string;
}

export interface GroupMember {
    userId: number;
    nickname: string | null;
    firstName: string;
    lastName: string;
    role: 'member' | 'admin' | 'moderator' | 'owner';
    joinedAt?: string;
}

export interface GroupEvent {
    eventId: number;
    groupId: number;
    title: string;
    description: string;
    startAt: string;
    endAt: string;
    location: string;
    createdBy: number;
    createdAt: string;
}

export interface ChatMessage {
    messageId: number;
    senderId: number;
    text: string;
    createdAt: string;
}

export interface ChatPreview {
    chatId: number;
    groupId: number | null;
    name: string;
    lastMessage: {
        id: number;
        text: string;
        createdAt: string;
    } | null;
    unreadCount: number;
    updatedAt: string;
}

export interface ChatParticipant {
    userId: number;
    username: string;
    role: 'owner' | 'member' | 'admin';
    lastSeenMessageId: number;
    unreadCount: number;
}

export type NotificationType = 'follow_request' | 'post_liked' | 'comment' | 'group_invite';

export interface Notification {
    notificationId: number;
    type: NotificationType;
    referenceId: number;
    content: string;
    read: 'read' | 'unread';
    createdAt: string;
}

export type SearchResultItem = Post | Group | Follower;

export type MediaResponse = { mediaEncoded?: string }
export interface UserId {
    Id: number;
}

/////////////////////////////////////////////////

export type ProfileAPIResponse = {
  userId: number
  status: 'pending' | 'accepted' | 'declined' | 'follow' | null
  nickname: string | null
  firstName: string | null
  lastName: string | null
  avatarId: number | null
  aboutMe: string | null
  dateOfBirth: string | null
  privacy: 'public' | 'private' | string
  stats: {
    postsCount: number
    followersCount: number
    followingCount: number
  }
  joinedAt: string | null
  chatId?: number | null
}