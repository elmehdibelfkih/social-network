'use client';

import { JSX, useEffect, useState } from "react";
import { NavbarClient } from "../features/navbar";
import { NewPost } from '../features/newPost/newPost.client';
import { PostsClient } from "../features/posts";
import { http } from '../libs/apiClient';

type AuthResponse = {
  sessionId: number;
  sessionToken: string;
  ipAddress: string;
  device: string;
  createdAt: string;
  expiresAt: string;
};

export default function HomePage(): JSX.Element {
  const [session, setSession] = useState<AuthResponse | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const res = await http.get<AuthResponse>('/api/v1/auth/session');
        if (!mounted) return;
        // normalize undefined -> null so UI can distinguish "not fetched" from "no session"
        setSession(res ?? null);
      } catch (err: any) {
        if (!mounted) return;
        setSession(null);
        // capture a message for debugging / simple UI
        setError(err?.message ?? 'Failed to fetch session');
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // loading: fetch hasn't completed yet (session === undefined)
  if (session === undefined) {
    return <main>Loading session...</main>;
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
      <NewPost userAvatar="/pic.png" />
      <PostsClient />
    </main>
  );
}
