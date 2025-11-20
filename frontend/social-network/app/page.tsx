import { JSX } from "react";
import {NavbarClient} from "../features/navbar/navbar.client";
import {PostsClient} from "../features/posts/posts.client";
import { NewPost } from "../features/newPost/newPost.client";

export default async function HomePage(): Promise<JSX.Element> {
  return (
    <>
      <NavbarClient />
      <main style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
        <NewPost userAvatar="/users.svg" />
        <PostsClient
         />
      </main>
    </>
  );
}
