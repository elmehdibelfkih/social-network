import { postsService } from './postsService';
import { Post as PostType } from './types';
import styles from './styles.module.css';

export default async function PostsServer() {
  try {
    const posts: PostType[] = await postsService.getPosts();
    return (
      <div className={styles.postsContainer}>
        {posts.map(p => (
          <div key={p.postId} className={styles.postCard}>
            <div>
              <strong>{p.authorFirstName} {p.authorLastName}</strong>
              <div>{new Date(p.createdAt).toLocaleString()}</div>
              <p>{p.content}</p>
            </div>
          </div>
        ))}
      </div>
    );
  } catch (error) {
    console.error('Error fetching posts on server:', error);
    return <div>Error fetching posts</div>;
  }
}
