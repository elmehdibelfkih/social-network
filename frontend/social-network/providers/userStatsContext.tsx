'use client';

import React, { createContext, useReducer, useContext, ReactNode } from 'react';
import { UserStatsState } from "@/libs/globalTypes";

type Action =
  | { type: 'INCREMENT_FOLLOWERS' }
  | { type: 'DECREMENT_FOLLOWERS' }
  | { type: 'INCREMENT_FOLLOWING' }
  | { type: 'DECREMENT_FOLLOWING' }
  | { type: 'INCREMENT_POSTS' }
  | { type: 'DECREMENT_POSTS' }
  | { type: 'INCREMENT_LIKES_RECEIVED' }
  | { type: 'DECREMENT_LIKES_RECEIVED' }
  | { type: 'INCREMENT_COMMENTS_RECEIVED' }
  | { type: 'DECREMENT_COMMENTS_RECEIVED' }
  | { type: 'NEW_NOTIFICATION' }
  | { type: 'READ_ALL_NOTIFICATIONS' }
  | { type: 'SET_STATS'; payload: Partial<UserStatsState> }
  | { type: 'SET_PRIVACY'; payload: 'public' | 'private' | string }
  | { type: 'SET_NICKNAME'; payload: string | null }
  | { type: 'SET_FIRST_NAME'; payload: string | null }
  | { type: 'SET_LAST_NAME'; payload: string | null }
  | { type: 'SET_AVATAR_ID'; payload: number | null }
  | { type: 'SET_ABOUT_ME'; payload: string | null }
  | { type: 'SET_DATE_OF_BIRTH'; payload: string | null };

const userStatsReducer = (state: UserStatsState, action: Action): UserStatsState => {
  switch (action.type) {
    case 'INCREMENT_FOLLOWERS':
      return { ...state, followersCount: state.followersCount + 1 };
    case 'DECREMENT_FOLLOWERS':
      return { ...state, followersCount: Math.max(0, state.followersCount - 1) };
    case 'INCREMENT_FOLLOWING':
      return { ...state, followingCount: state.followingCount + 1 };
    case 'DECREMENT_FOLLOWING':
      return { ...state, followingCount: Math.max(0, state.followingCount - 1) };
    case 'INCREMENT_POSTS':
      return { ...state, postsCount: state.postsCount + 1 };
    case 'DECREMENT_POSTS':
      return { ...state, postsCount: Math.max(0, state.postsCount - 1) };
    case 'INCREMENT_LIKES_RECEIVED':
      return { ...state, likesReceived: state.likesReceived + 1 };
    case 'DECREMENT_LIKES_RECEIVED':
      return { ...state, likesReceived: Math.max(0, state.likesReceived - 1) };
    case 'INCREMENT_COMMENTS_RECEIVED':
        return { ...state, commentsReceived: state.commentsReceived + 1 };
    case 'DECREMENT_COMMENTS_RECEIVED':
        return { ...state, commentsReceived: Math.max(0, state.commentsReceived - 1) };
    case 'NEW_NOTIFICATION':
      return { ...state, unreadNotifications: state.unreadNotifications + 1 };
    case 'READ_ALL_NOTIFICATIONS':
      return { ...state, unreadNotifications: 0 };
    case 'SET_STATS':
      return { ...state, ...action.payload };
    case 'SET_PRIVACY':
      return { ...state, privacy: action.payload };
    case 'SET_NICKNAME':
      return { ...state, nickname: action.payload };
    case 'SET_FIRST_NAME':
      return { ...state, firstName: action.payload };
    case 'SET_LAST_NAME':
      return { ...state, lastName: action.payload };
    case 'SET_AVATAR_ID':
      return { ...state, avatarId: action.payload };
    case 'SET_ABOUT_ME':
      return { ...state, aboutMe: action.payload };
    case 'SET_DATE_OF_BIRTH':
      return { ...state, dateOfBirth: action.payload };
    default:
      return state;
  }
};

const UserStatsContext = createContext<{
  state: UserStatsState;
  dispatch: React.Dispatch<Action>;
} | undefined>(undefined);

type UserStatsProviderProps = {
  children: ReactNode;
  initialState?: Partial<UserStatsState>; 
};

export const UserStatsProvider = ({ children, initialState }: UserStatsProviderProps) => {
  const defaultState: UserStatsState = {
    userId: null,
    postsCount: 0,
    followersCount: 0,
    followingCount: 0,
    likesReceived: 0,
    commentsReceived: 0,
    unreadNotifications: 0,
    privacy: 'public',
    nickname: null,
    firstName: "",
    lastName: "",
    avatarId:  null,
    aboutMe:  null,
    dateOfBirth: null,
    joinedAt: null,
  };

  const [state, dispatch] = useReducer(userStatsReducer, {
    ...defaultState,
    ...initialState,
  });

  return (
    <UserStatsContext.Provider value={{ state, dispatch }}>
      {children}
    </UserStatsContext.Provider>
  );
};

export const useUserStats = () => {
  const context = useContext(UserStatsContext);
  if (context === undefined) {
    throw new Error('useUserStats must be used within a UserStatsProvider');
  }
  return context;
};