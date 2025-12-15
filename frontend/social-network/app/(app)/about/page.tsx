import React from 'react';

const AboutPage = () => {
  return (
    <div style={{ padding: '2rem', color: '#333' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '2rem', color: '#4a90e2' }}>About Us</h1>
      <div style={{ maxWidth: '800px', margin: '0 auto', lineHeight: '1.6' }}>
        <p>
          Welcome to Social Network, a modern social media platform for communication and sharing content. 
          Our mission is to connect people and provide a space where they can share their thoughts, ideas, and creativity.
        </p>
        <p>
          This project is built with the latest technologies, including Next.js for the frontend and Go for the backend. 
          It is designed to be a scalable and performant social media application.
        </p>
        <p>
          We believe in the power of community and open source. This project is open source and you can find the code on{' '}
          <a 
            href="https://github.com/elmehdibelfkih/social-network" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ color: '#4a90e2', textDecoration: 'none' }}
          >
            GitHub
          </a>. 
          We encourage you to contribute to the project and help us make it better.
        </p>
      </div>
    </div>
  );
};

export default AboutPage;
