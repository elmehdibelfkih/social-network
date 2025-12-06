import { http } from '@/libs/apiFetch';

export type CreatePostInput = {
  content: string;
  privacy: "public" | "private" | "followers" | "restricted";
  mediaIds?: string[];
};

export async function createPost(input: CreatePostInput) {
  return await http.post("/api/v1/posts", {
    content: input.content,
    privacy: input.privacy,
    media_ids: input.mediaIds ?? [],
  });
}
