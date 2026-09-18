/* ============================================
   FALLEN HAIR — Entry Point
   Style imports in cascade order + app mount.
   ============================================ */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// Design system (order matters)
import '@/styles/reset.css';
import '@/styles/variables.css';
import '@/styles/typography.css';
import '@/styles/global.css';
import '@/styles/utilities.css';

// Trigger singleton GSAP registration
import '@/lib/gsapConfig';

import { App } from '@/app/App';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
