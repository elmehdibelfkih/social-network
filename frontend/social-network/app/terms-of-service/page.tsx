import Link from 'next/link';

const TermsOfServicePage = () => {
  return (
    <div style={{ padding: '2rem', color: '#333' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '2rem', color: '#4a90e2' }}>Terms of Service</h1>
      <div style={{ maxWidth: '800px', margin: '0 auto', lineHeight: '1.6' }}>
        <p>
          Welcome to our Social Network. These Terms of Service ("Terms") govern your access to and use of our services, including our websites, APIs, email notifications, applications, buttons, and widgets, (the "Services"), and any information, text, links, graphics, photos, audio, videos, or other materials or arrangements of materials uploaded, downloaded or appearing on the Services (collectively referred to as "Content"). By using the Services you agree to be bound by these Terms.
        </p>

        <h2 style={{ marginTop: '2rem', color: '#4a90e2' }}>1. Who May Use the Services</h2>
        <p>
          You may use the Services only if you agree to form a binding contract with us and are not a person barred from receiving services under the laws of the applicable jurisdiction. In any case, you must be at least 13 years old to use the Services. If you are accepting these Terms and using the Services on behalf of a company, organization, government, or other legal entity, you represent and warrant that you are authorized to do so.
        </p>

        <h2 style={{ marginTop: '2rem', color: '#4a90e2' }}>2. Content on the Services</h2>
        <p>
          You are responsible for your use of the Services and for any Content you provide, including compliance with applicable laws, rules, and regulations. You should only provide Content that you are comfortable sharing with others.
        </p>
        <p>
          Any use or reliance on any Content or materials posted via the Services or obtained by you through the Services is at your own risk. We do not endorse, support, represent or guarantee the completeness, truthfulness, accuracy, or reliability of any Content or communications posted via the Services or endorse any opinions expressed via the Services.
        </p>

        <h2 style={{ marginTop: '2rem', color: '#4a90e2' }}>3. Your Rights and Grant of Rights in the Content</h2>
        <p>
          You retain your rights to any Content you submit, post or display on or through the Services. What's yours is yours — you own your Content (and your incorporated audio, photos and videos are considered part of the Content).
        </p>
        <p>
          By submitting, posting or displaying Content on or through the Services, you grant us a worldwide, non-exclusive, royalty-free license (with the right to sublicense) to use, copy, reproduce, process, adapt, modify, publish, transmit, display and distribute such Content in any and all media or distribution methods now known or later developed (for clarity, these rights include, for example, curating, transforming, and translating).
        </p>

        <h2 style={{ marginTop: '2rem', color: '#4a90e2' }}>4. Ending These Terms</h2>
        <p>
          You may end your legal agreement with us at any time by deactivating your accounts and discontinuing your use of the Services.
        </p>

        <p style={{ marginTop: '2rem' }}>
          We may revise these Terms from time to time. The changes will not be retroactive, and the most current version of the Terms, which will always be at this page, will govern our relationship with you. We will try to notify you of material revisions, for example via a service notification or an email to the email associated with your account. By continuing to access or use the Services after those revisions become effective, you agree to be bound by the revised Terms.
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

export default TermsOfServicePage;
