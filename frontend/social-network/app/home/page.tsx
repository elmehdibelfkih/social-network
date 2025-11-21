'use client';

import { useState } from 'react';
import { NewPost } from '../../features/newPost/newPost.client';
import { Feed } from '../../features/posts/feed.client';
import { Post } from '../../features/posts/types';

export default function HomePage() {
  const [newPost, setNewPost] = useState<Post | null>(null);

  const handlePostCreated = (post: Post) => {
    setNewPost(post);
  };

  const handleNewPostDisplayed = () => {
    setNewPost(null);
  };

  return (
    <div>
      <NewPost 
        userAvatar="https://placehold.co/140x140/8b4fc9/ffffff?text=USER" 
        onPostCreated={handlePostCreated}
      />
      <Feed 
        newPost={newPost} 
        onNewPostDisplayed={handleNewPostDisplayed}
      />
    </div>
  );
}