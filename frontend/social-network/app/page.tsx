'use client';

import { JSX, useEffect, useState } from "react";
import { NavbarClient } from "../features/navbar";
import { NewPost } from '../features/newPost/newPost.client';
import { PostsClient } from "../features/posts";
import { Post } from "../features/posts/types";


export default function HomePage(): JSX.Element {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [newPost, setNewPost] = useState<Post | null>(null);

  useEffect(() => {
    let mounted = true;

  const handlePostCreated = (post: Post) => {
    setNewPost(post);
  };

  const handleNewPostDisplayed = () => {
    setNewPost(null);
  };

  if (!isAuthenticated) {
    return <AuthForm onAuthSuccess={handleAuthSuccess} />;
  }

  // not authenticated / no session
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

  // authenticated — safe to access session fields
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
