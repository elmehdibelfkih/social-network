'use client';

import { JSX, useEffect, useState } from "react";
import { NavbarClient } from "@/features/navbar";
import { NewPost } from '@/features/newPost/newPost.client';
import { PostsClient } from "@/features/posts";
import { http } from '@/libs/apiClient';
// import { AuthForm } from "@/features/auth";

type AuthResponse = {
  sessionId: number;
  sessionToken: string;
  ipAddress: string;
  device: string;
  createdAt: string;
  expiresAt: string;
};

type Post = {
  id: number;
  content: string;
  createdAt: string;
};

export default function HomePage(): JSX.Element {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [newPost, setNewPost] = useState<Post | null>(null);
  const [session, setSession] = useState<AuthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePostCreated = (post: Post) => {
    setNewPost(post);
  };

  const handleNewPostDisplayed = () => {
    setNewPost(null);
  };

  const handleAuthSuccess = (sessionData: AuthResponse) => {
    setSession(sessionData);
    setIsAuthenticated(true);
  };

  useEffect(() => {
    let mounted = true;
    return () => { mounted = false; };
  }, []);

  // if (!isAuthenticated) {
  //   return <AuthForm onAuthSuccess={handleAuthSuccess} />;
  // }

  // <AuthForm />

  if (session === null) {
    return (
      <main>
        <p>No session found.</p>
        {error && <p style={{ color: 'red' }}>Error: {error}</p>}
        <NavbarClient />
        <NewPost userAvatar="/pic.png" />
        <PostsClient />
      </main>
    );
  }

  return (
    <main>
      <h1>Session ID: {session.sessionId}</h1>
      <h2>Token: {session.sessionToken}</h2>
      <p>IP: {session.ipAddress}</p>
      <p>Device: {session.device}</p>
      <p>Created: {session.createdAt}</p>
      <p>Expires: {session.expiresAt}</p>

      <NavbarClient />
      <NewPost userAvatar="/pic.png" onPostCreated={handlePostCreated} />
      <PostsClient newPost={newPost} onNewPostDisplayed={handleNewPostDisplayed} />
    </main>
  );
}
