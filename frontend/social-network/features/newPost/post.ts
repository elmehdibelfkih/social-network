// /services/posts.ts

import { http } from '@/libs/apiFetch';

export type CreatePostInput = {
  content: string;
  privacy: "public" | "private" | "followers";
  mediaIds?: string[];
};

export async function createPost(input: CreatePostInput) {
  // FIX: normalize privacy to avoid sending wrong values like "privet"
  const normalizedPrivacy =
    input.privacy === "private" ||
    input.privacy === "public" ||
    input.privacy === "followers"
      ? input.privacy
      : "public";

  return await http.post("/api/v1/posts", {
    content: input.content,
    privacy: normalizedPrivacy,
    media_ids: input.mediaIds ?? [],
  });
}
