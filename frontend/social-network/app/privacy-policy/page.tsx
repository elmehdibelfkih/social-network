import Link from 'next/link';

const PrivacyPolicyPage = () => {
  return (
    <div style={{ padding: '2rem', color: '#333' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '2rem', color: '#4a90e2' }}>Privacy Policy</h1>
      <div style={{ maxWidth: '800px', margin: '0 auto', lineHeight: '1.6' }}>
        <p>
          This Privacy Policy describes how we collect, use, and share your information when you use our Services. By using our Services, you agree to the collection, use, and sharing of your information as described in this Privacy Policy.
        </p>

        <h2 style={{ marginTop: '2rem', color: '#4a90e2' }}>1. Information We Collect</h2>
        <p>
          We collect information you provide directly to us, such as when you create or modify your account, request on-demand services, contact customer support, or otherwise communicate with us. This information may include: name, email, phone number, postal address, profile picture, payment method, and other information you choose to provide.
        </p>

        <h2 style={{ marginTop: '2rem', color: '#4a90e2' }}>2. How We Use Your Information</h2>
        <p>
          We use the information we collect to provide, maintain, and improve our services, including to:
        </p>
        <ul>
          <li>Facilitate payments, send receipts, and provide products and services you request.</li>
          <li>Send you technical notices, updates, security alerts, and support and administrative messages.</li>
          <li>Respond to your comments, questions, and requests, and provide customer service.</li>
          <li>Communicate with you about products, services, offers, promotions, rewards, and events offered by us and others, and provide news and information we think will be of interest to you.</li>
        </ul>

        <h2 style={{ marginTop: '2rem', color: '#4a90e2' }}>3. How We Share Your Information</h2>
        <p>
          We may share the information we collect about you as described in this Privacy Policy or as described at the time of collection or sharing, including as follows:
        </p>
        <ul>
          <li>With vendors, consultants, marketing partners, and other service providers who need access to such information to carry out work on our behalf.</li>
          <li>In response to a request for information if we believe disclosure is in accordance with, or required by, any applicable law, regulation, or legal process.</li>
          <li>If we believe your actions are inconsistent with our user agreements or policies, or to protect the rights, property, and safety of us or others.</li>
        </ul>

        <h2 style={{ marginTop: '2rem', color: '#4a90e2' }}>4. Your Choices</h2>
        <p>
          You may update, correct or delete information about you at any time by logging into your online account. If you wish to delete or deactivate your account, please email us, but note that we may retain certain information as required by law or for legitimate business purposes.
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

export default PrivacyPolicyPage;
