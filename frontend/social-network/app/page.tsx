'use client';
import { JSX, useState } from "react";
import AuthForm from "../features/auth/auth.client";
import { NavbarClient } from "../features/navbar";
import { NewPost } from '../features/newPost/newPost.client';
import { PostsClient } from "../features/posts";

export default function HomePage(): JSX.Element {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
  };

  if (!isAuthenticated) {
    return <AuthForm onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <main>
      <NavbarClient />
      <NewPost userAvatar="/pic.png" />
      <PostsClient />
    </main>
  );
}
