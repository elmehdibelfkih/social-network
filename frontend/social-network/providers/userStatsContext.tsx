'use client';

import React, { createContext, useReducer, useContext, ReactNode } from 'react';


export type UserStatsState = {
  userId: number | null;
  postsCount: number;
  followersCount: number;
  followingCount: number;
  likesReceived: number;
  commentsReceived: number;
  unreadNotifications: number; /
};


type Action =
  | { type: 'INCREMENT_FOLLOWERS' }
  | { type: 'DECREMENT_FOLLOWERS' }
  | { type: 'INCREMENT_POSTS' }
  | { type: 'DECREMENT_POSTS' }
  | { type: 'NEW_NOTIFICATION' }
  | { type: 'READ_ALL_NOTIFICATIONS' }
  | { type: 'SET_STATS'; payload: Partial<UserStatsState> }; // Use Partial for flexibility

const userStatsReducer = (state: UserStatsState, action: Action): UserStatsState => {
  switch (action.type) {
    case 'INCREMENT_FOLLOWERS':
      return { ...state, followersCount: state.followersCount + 1 };
    case 'DECREMENT_FOLLOWERS':
      return { ...state, followersCount: Math.max(0, state.followersCount - 1) };
    case 'INCREMENT_POSTS':
        return { ...state, postsCount: state.postsCount + 1 };
    case 'DECREMENT_POSTS':
        return { ...state, postsCount: Math.max(0, state.postsCount - 1) };
    case 'NEW_NOTIFICATION':
      return { ...state, unreadNotifications: state.unreadNotifications + 1 };
    case 'READ_ALL_NOTIFICATIONS':
      return { ...state, unreadNotifications: 0 };
    case 'SET_STATS':
      return { ...state, ...action.payload };
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
  initialState?: Partial<UserStatsState>; // Make initial state an optional prop
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