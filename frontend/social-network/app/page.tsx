import { JSX } from "react";
import Navbar from "../features/home/navbar.client";
import Posts from "../features/home/posts.client";
import { NewPost } from "../features/newPost/newPost.client";

export default async function HomePage(): Promise<JSX.Element> {
  return (
    <>
      <Navbar />
      <main style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
        <NewPost userAvatar="/users.svg" />
        <Posts />
      </main>
    </>
  );
}
