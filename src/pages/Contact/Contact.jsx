/* ============================================
   FALLEN HAIR — Contact Page
   Dedicated page for getting in touch, collaboration,
   and direct communication channels.
   ============================================ */

import { Contact as ContactSection } from '@/sections/Contact/Contact';
import styles from './Contact.module.css';

export function Contact() {
  return (
    <div className={styles.page}>
      <ContactSection />
    </div>
  );
}
