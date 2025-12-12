'use client';

import React, { createContext, useReducer, useContext, ReactNode } from 'react';

// --- 1. The State Shape ---
// Updated to match the backend's UserStatsResponseJson and include userId
export type UserStatsState = {
  userId: number | null;
  postsCount: number;
  followersCount: number;
  followingCount: number;
  likesReceived: number;
  commentsReceived: number;
  unreadNotifications: number; // Note: This must be fetched and updated separately
};

// --- 2. The Actions ---
// Defines the "signals" (actions) the system can respond to
type Action =
  | { type: 'INCREMENT_FOLLOWERS' }
  | { type: 'DECREMENT_FOLLOWERS' }
  | { type: 'INCREMENT_POSTS' }
  | { type: 'DECREMENT_POSTS' }
  | { type: 'NEW_NOTIFICATION' }
  | { type: 'READ_ALL_NOTIFICATIONS' }
  | { type: 'SET_STATS'; payload: Partial<UserStatsState> }; // Use Partial for flexibility

// --- 3. The Reducer (The Logic Engine) ---
// This pure function calculates the next state based on the action
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

// --- 4. The Context (The Pipeline) ---
const UserStatsContext = createContext<{
  state: UserStatsState;
  dispatch: React.Dispatch<Action>;
} | undefined>(undefined);

// --- 5. The Provider (The Power Source) ---
type UserStatsProviderProps = {
  children: ReactNode;
  initialState?: Partial<UserStatsState>; // Make initial state an optional prop
};

export const UserStatsProvider = ({ children, initialState }: UserStatsProviderProps) => {
  // Define a default state to merge with the initial state from props
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

// --- 6. Custom Hook (The Access Point) ---
// This hook provides a safe way to access the context's value
export const useUserStats = () => {
  const context = useContext(UserStatsContext);
  if (context === undefined) {
    throw new Error('useUserStats must be used within a UserStatsProvider');
  }
  return context;
};