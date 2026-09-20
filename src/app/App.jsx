/* ============================================
   FALLEN HAIR — App Shell
   Root layout with Lenis smooth scrolling and Router.
   Includes global JIGS Studio Assistant launcher and modal.
   ============================================ */

import { Navbar } from '@/components/Navbar/Navbar';
import { Footer } from '@/components/Footer/Footer';
import { Router } from '@/app/Router';
import { JigsModalProvider, useJigsModal } from '@/components/Jigs/context/JigsModalContext';
import { JigsLauncher } from '@/components/Jigs/JigsLauncher';
import { Jigs } from '@/components/Jigs/Jigs';
import styles from './App.module.css';

function AppContent() {
  const { isOpen, closeJigs } = useJigsModal();

  return (
    <div className={styles.app}>
      <Navbar />
      <main className={styles.main}>
        <Router />
      </main>
      <Footer />
      <JigsLauncher />
      {isOpen && <Jigs onClose={closeJigs} />}
    </div>
  );
}

export function App() {
  return (
    <JigsModalProvider>
      <AppContent />
    </JigsModalProvider>
  );
}
