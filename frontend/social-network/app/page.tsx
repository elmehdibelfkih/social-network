'use client';
import { JSX, useState } from "react";
import AuthForm from "../features/auth/auth.client";
import { NavbarClient } from "../features/navbar";
import { NewPost } from '../features/newPost/newPost.client';
import { Feed } from "../features/posts";
import { Post } from "../features/posts/types";

export default function HomePage(): JSX.Element {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [newPost, setNewPost] = useState<Post | null>(null);

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
  };

  const handlePostCreated = (post: Post) => {
    setNewPost(post);
  };

  const handleNewPostDisplayed = () => {
    setNewPost(null);
  };

  if (!isAuthenticated) {
    return <AuthForm onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <main>
      <NavbarClient />
      <NewPost userAvatar="/pic.png" onPostCreated={handlePostCreated} />
      <Feed newPost={newPost} onNewPostDisplayed={handleNewPostDisplayed} />
    </main>
  );
}
