import { FollowStatus } from "../../libs/globalTypes";

export type ProfileData = {
    sucess: boolean
    payload: {
        userId: number;
        status: FollowStatus;
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
    }
};

export type FollowResponse = {
    succes: boolean
    payload: {
        message: string
        status: string
        targetUserId: number
        followerId: number
        chatId: number | null
    }
}

export type PrivacyToggleResponse = {
    success: boolean;
    payload: {
        message: string
        privacy: string
    }
}