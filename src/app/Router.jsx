/* ============================================
   FALLEN HAIR — Router Component
   Lightweight, robust client-side routing.
   ============================================ */

import { useEffect, useState } from 'react';
import { Home } from '@/pages/Home/Home';
import { Work } from '@/pages/Work/Work';
import { Workspace } from '@/pages/Workspace/Workspace';
import { Photography } from '@/pages/Photography/Photography';
import { About } from '@/pages/About/About';
import { Contact } from '@/pages/Contact/Contact';
import { JigsAdmin } from '@/pages/JigsAdmin/JigsAdmin';
import { ScrollTrigger } from '@/lib/gsapConfig';
import { normalizeRoute, navigate } from '@/lib/navigation';

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
}
