type ProfileData = {
    userId: number;
    status: "pending" | "accepted" | "declined" | null;
    nickname: string | null;
    firstName: string;
    lastName: string;
    avatarId: number | null;
    aboutMe: string | null;
    dateOfBirth: string;
    privacy: "public" | "private";
    chatId: number | null;
    stats: {
        postsCount: number;
        followersCount: number;
        followingCount: number;
    };
    joinedAt: string;
};
