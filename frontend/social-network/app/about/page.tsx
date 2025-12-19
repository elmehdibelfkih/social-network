import Link from 'next/link';

const AboutPage = () => {
  return (
    <div style={{ padding: '2rem', color: '#333' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '2rem', color: '#4a90e2' }}>About Us</h1>
      <div style={{ maxWidth: '800px', margin: '0 auto', lineHeight: '1.6' }}>
        <p>
          Welcome to Social Network, a modern social media platform for communication and sharing content. 
          Our mission is to connect people and provide a space where they can share their thoughts, ideas, and creativity. We aim to build a positive and supportive community where everyone feels welcome.
        </p>
        <p>
          This project is built with the latest technologies to ensure a seamless user experience. The frontend is powered by Next.js, and the backend is a robust Go application. This combination allows for a scalable, performant, and reliable social media platform.
        </p>
        <p>
          We believe in the power of community and the open-source movement. This project is open source, and you can find the entire codebase on{' '}
          <a 
            href="https://github.com/elmehdibelfkih/social-network" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ color: '#4a90e2', textDecoration: 'none' }}
          >
            GitHub
          </a>. 
          We encourage you to explore the code, contribute to the project, and help us make it even better. Whether you're a developer, a designer, or just an enthusiastic user, your feedback and contributions are highly valued.
        </p>
        
        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
          <Link href="/" style={{ color: '#4a90e2', textDecoration: 'none', fontWeight: 'bold' }}>
            Go to Home Page
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
