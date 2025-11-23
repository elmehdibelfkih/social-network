'use client';

import { LikeButton } from './like-button';

export function TestLike() {
  return (
    <div style={{ padding: '20px', background: '#f5f5f5', borderRadius: '8px', margin: '20px' }}>
      <h3>Like Button Test</h3>
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        <LikeButton
          postId={123}
          isLiked={false}
          likeCount={5}
          onLikeChange={(isLiked, newCount) => {
            console.log('Like changed:', { isLiked, newCount });
          }}
        />
        <LikeButton
          postId={456}
          isLiked={true}
          likeCount={12}
          onLikeChange={(isLiked, newCount) => {
            console.log('Like changed:', { isLiked, newCount });
          }}
        />
      </div>
    </div>
  );
}