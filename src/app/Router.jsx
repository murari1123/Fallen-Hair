/* ============================================
   FALLEN HAIR — Router Component
   Lightweight, robust client-side routing.
   ============================================ */

import { useEffect, useState, lazy, Suspense } from 'react';
import { Home } from '@/pages/Home/Home';
import { ScrollTrigger } from '@/lib/gsapConfig';
import { normalizeRoute, navigate } from '@/lib/navigation';
import styles from './Router.module.css';

// Lazy-loaded routes for performance code-splitting
const Work = lazy(() => import('@/pages/Work/Work').then(m => ({ default: m.Work })));
const Workspace = lazy(() => import('@/pages/Workspace/Workspace').then(m => ({ default: m.Workspace })));
const Photography = lazy(() => import('@/pages/Photography/Photography').then(m => ({ default: m.Photography })));
const About = lazy(() => import('@/pages/About/About').then(m => ({ default: m.About })));
const Contact = lazy(() => import('@/pages/Contact/Contact').then(m => ({ default: m.Contact })));
const JigsAdmin = lazy(() => import('@/pages/JigsAdmin/JigsAdmin').then(m => ({ default: m.JigsAdmin })));

function RouteFallback() {
  return <div className={styles.routeFallback} aria-hidden="true" />;
}

export function Router() {
  const [path, setPath] = useState(() => normalizeRoute(window.location.pathname));

  useEffect(() => {
    const onLocationChange = () => {
      setPath(normalizeRoute(window.location.pathname));
      window.scrollTo({ top: 0, behavior: 'instant' });
      requestAnimationFrame(() => {
        ScrollTrigger.refresh();
      });
    };

    window.addEventListener('popstate', onLocationChange);

    const onAnchorClick = (e) => {
      const target = e.target.closest('a');
      if (!target) return;

      const href = target.getAttribute('href');
      if (!href) return;

      if (href.startsWith('/') && !href.startsWith('//') && !href.startsWith('/#')) {
        e.preventDefault();
        navigate(href);
      }
    };

    document.addEventListener('click', onAnchorClick);

    return () => {
      window.removeEventListener('popstate', onLocationChange);
      document.removeEventListener('click', onAnchorClick);
    };
  }, []);

  const route = normalizeRoute(path);

  const renderRoute = () => {
    switch (route) {
      case '/jigs-admin':
        return <JigsAdmin />;
      case '/workspace':
        return <Workspace />;
      case '/work':
        return <Work />;
      case '/photography':
        return <Photography />;
      case '/about':
        return <About />;
      case '/contact':
        return <Contact />;
      case '/':
      default:
        return <Home />;
    }
  };

  return (
    <Suspense fallback={<RouteFallback />}>
      {renderRoute()}
    </Suspense>
  );
}
