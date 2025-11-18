
interface Post {
  id: number;
  title: string;
  content: string;
}

export default async function HomePage() {
  const apiUrl ='http://localhost:3000/api/v1'+'/auth/login'
  console.log("======>", apiUrl);
  

  let posts: Post[] = [];
  let error: string | null = null;

  // try {

  //   const response = await fetch(apiUrl, {
  //     // Optional: Add a cache configuration (default is 'force-cache')
  //     // cache: 'no-store', // To fetch data on every request (dynamic rendering)
  //   });

    
    
  //   if (!response.ok) {
  //     throw new Error(`Failed to fetch posts: ${response.status} ${response.statusText}`);
  //   }
    
  //   // 2. Parse the JSON response
  //   posts = await response.json();
  //   console.log(posts);
    
  // } catch (err) {
  //   // 3. Handle errors
  //   console.error("Data fetching error:", err);
  //   error = err instanceof Error ? err.message : 'An unknown error occurred.';
  // }

  // 4. Display the data (or error message)
  return (
    <main style={{ padding: '20px' }}>
      <h1>Latest Posts from Go API</h1>
      
      {error && (
        <div style={{ color: 'red', border: '1px solid red', padding: '10px' }}>
          Error loading data: {error}
        </div>
      )}

      {!error && posts.length > 0 ? (
        <ul>
          {posts.map((post) => (
            <li key={post.id} style={{ marginBottom: '15px', border: '1px solid #ccc', padding: '10px' }}>
              <h2>{post.title}</h2>
              <p>{post.content}</p>
            </li>
          ))}
        </ul>
      ) : (
        !error && <p>No posts found.</p>
      )}
    </main>
  );
}