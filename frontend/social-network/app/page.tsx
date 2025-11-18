import Posts from "./home/client/Posts";
import Navbar from "./home/client/Navbar";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main style={{ padding: '20px' }}>
        <Posts />
      </main>
    </>
  );
}