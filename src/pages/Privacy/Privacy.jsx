/* ============================================
   FALLEN HAIR — Privacy Policy Page
   ============================================ */

import { useGsap } from '@/hooks/useGsap';
import { gsap } from '@/lib/gsapConfig';
import styles from './Privacy.module.css';

export function Privacy() {
  const containerRef = useGsap((container) => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const eyebrow = container.querySelector(`.${styles.eyebrowRow}`);
    const heading = container.querySelector(`.${styles.heading}`);
    const contentBlocks = container.querySelectorAll(`.${styles.contentBlock}`);
    const metaBar = container.querySelector(`.${styles.metaBar}`);

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.fromTo(eyebrow, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.8 }, 0.05)
      .fromTo(heading, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.9 }, 0.15)
      .fromTo(contentBlocks, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.85, stagger: 0.1 }, 0.3)
      .fromTo(metaBar, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.8 }, 1.0);
  }, []);

  return (
    <div ref={containerRef} className={styles.privacyPage}>
      <div className={styles.container}>
        
        {/* Top Eyebrow */}
        <div className={styles.eyebrowRow}>
          <div className={styles.eyebrowLeft}>
            <span className={styles.plusMark}>+</span>
            <span className={styles.eyebrowText}>LEGAL / PRIVACY POLICY</span>
          </div>
          <div className={styles.eyebrowRight}>
            <span className={styles.archivalCode}>PRIVACY POLICY // 2026</span>
          </div>
        </div>

        {/* Main Content */}
        <div className={styles.contentLayout}>
          
          <h1 className={styles.heading}>
            PRIVACY POLICY<span className={styles.accentDot}>.</span>
          </h1>

          <div className={styles.contentBlock}>
            <h2 className={styles.subheading}>1. Introduction</h2>
            <p className={styles.bodyParagraph}>
              This Privacy Policy explains how Fallen Hair (an independent creative studio operated by Murari Damalapati) collects, uses, and protects your personal data when you use our website.
            </p>
          </div>

          <div className={styles.contentBlock}>
            <h2 className={styles.subheading}>2. Information We Collect</h2>
            <p className={styles.bodyParagraph}>
              We collect information you provide directly to us when making an enquiry or interacting with our AI assistant, JIGS. This includes:
            </p>
            <ul className={styles.list}>
              <li>Contact details (Email address, Phone number).</li>
              <li>Conversation logs and context from your interactions with JIGS.</li>
              <li>Technical data such as IP addresses (used temporarily for rate-limiting and security).</li>
            </ul>
            <p className={styles.bodyParagraph}>
              We do not use third-party tracking scripts, cookies, or analytics services that harvest your browsing behaviour.
            </p>
          </div>

          <div className={styles.contentBlock}>
            <h2 className={styles.subheading}>3. The JIGS AI Assistant</h2>
            <p className={styles.bodyParagraph}>
              Our website features JIGS, an AI assistant designed to help process your enquiries. When you converse with JIGS, your chat logs are processed by external AI providers. While we strip direct personal identifiers (such as your email and phone number) from the conversation context before sending it, this does not guarantee the messages are completely anonymous. Please do not submit highly sensitive or confidential information in the chat.
            </p>
          </div>

          <div className={styles.contentBlock}>
            <h2 className={styles.subheading}>4. Purpose of Data Processing</h2>
            <p className={styles.bodyParagraph}>
              Your data is processed strictly for the purpose of handling your project enquiries, facilitating communication, and ensuring the security of our services (such as preventing abuse through rate-limiting).
            </p>
          </div>

          <div className={styles.contentBlock}>
            <h2 className={styles.subheading}>5. Data Retention</h2>
            <p className={styles.bodyParagraph}>
              Enquiries and their associated messages may remain stored until they are manually deleted. Currently, there is no automated expiry mechanism for this data. You may submit a deletion request by email, though we cannot promise immediate deletion.
            </p>
          </div>

          <div className={styles.contentBlock}>
            <h2 className={styles.subheading}>6. Your Rights</h2>
            <p className={styles.bodyParagraph}>
              You have the right to access the personal data we hold about you, request corrections to inaccurate data, and request the erasure of your data. You may exercise these rights by contacting us directly.
            </p>
          </div>

          <div className={styles.contentBlock}>
            <h2 className={styles.subheading}>7. Operator Identity & Contact</h2>
            <p className={styles.bodyParagraph}>
              <strong>Website Operator & Grievance Officer:</strong> Murari Damalapati
              <br/>
              <strong>Contact Email:</strong> <a href="mailto:muraridamalapati@gmail.com" style={{ color: 'inherit', textDecoration: 'underline' }}>muraridamalapati@gmail.com</a>
            </p>
          </div>
          
        </div>

        {/* Bottom Metadata Bar */}
        <div className={styles.metaBar}>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>LAST UPDATED</span>
            <span className={styles.metaValue}>OCTOBER 10, 2026</span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>JURISDICTION</span>
            <span className={styles.metaValue}>INDIA</span>
          </div>
        </div>

      </div>
    </div>
  );
}
