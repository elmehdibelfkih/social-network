import { revalidatePath } from 'next/cache';
import { http } from '@/libs/apiFetch';
import { NewPost as NewPostClient } from './newPost.client';
import type { PrivacyLevel } from './types';

export async function createPostAction(formData: FormData) {
  'use server';

  const content = String(formData.get('content') || '').trim();
  const privacyRaw = String(formData.get('privacy') || 'public');

  if (!content) {
    return null;
  }

  // Validate and normalize privacy
  const privacy: PrivacyLevel = 
    privacyRaw === 'public' || 
    privacyRaw === 'private' || 
    privacyRaw === 'followers'
      ? privacyRaw
      : 'public';

  console.log('🔐 Server Action - Privacy value:', privacy);

  const files = formData.getAll('media') as File[];
  const mediaIds: number[] = [];

  // Upload media files
  for (const file of files) {
    if (!file || !(file instanceof File)) continue;
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');

      const payload = {
        fileName: file.name,
        fileType: file.type || 'application/octet-stream',
        fileData: base64,
        purpose: 'post'
      };

      const res: any = await http.post('/api/v1/media/upload', payload);
      if (res?.mediaId) {
        mediaIds.push(res.mediaId);
      }
    } catch (err) {
      console.error('Media upload failed:', err);
    }
  }

  try {
    // Parse allowedList if provided (client appends JSON string)
    let allowedList: number[] | undefined = undefined;
    const allowedRaw = formData.get('allowedList');
    if (allowedRaw) {
      try {
        const parsed = JSON.parse(String(allowedRaw));
        if (Array.isArray(parsed)) {
          allowedList = parsed.map((v: any) => Number(v)).filter((n) => !Number.isNaN(n));
        }
      } catch (e) {
        // ignore parse errors
      }
    }

    const postPayload: any = {
      content,
      privacy, // CRITICAL: This must be exactly 'public' | 'private' | 'followers'
      ...(mediaIds.length > 0 && { mediaIds })
    };

    if (allowedList && allowedList.length > 0) postPayload.allowedList = allowedList;

    console.log('📤 Server Action - Creating post with payload:', postPayload);

    const created = await http.post('/api/v1/posts', postPayload);

    // Revalidate the home page
    try {
      revalidatePath('/');
    } catch (e) {
      // Ignore revalidation errors
    }

    return created;
  } catch (err) {
    console.error('❌ Create post failed:', err);
    return null;
  }
}

type Props = {
  avatarId?: number | null;
};

export default function NewPostServer(props: Props) {
  return <NewPostClient {...props} serverAction={createPostAction} />;
}