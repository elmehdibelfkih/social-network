'use client';

import React from 'react';
import { NewPost } from './newPost.client';
import type { Post } from './types';

type Props = {
  avatarId?: number | null;
  onPostCreated?: (post: Post) => void;
};

export default function NewPostWrapper({ avatarId = null, onPostCreated }: Props) {
  return <NewPost avatarId={avatarId} onPostCreated={onPostCreated} />;
}
