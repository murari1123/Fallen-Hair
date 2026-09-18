/* ============================================
   FALLEN HAIR — JIGS Modal Context
   Global context for opening/closing the singleton
   JIGS assistant modal across all pages and triggers.
   Preserves session state and handles focus return.
   ============================================ */

import { createContext, useContext, useState, useRef, useCallback } from 'react';

const JigsModalContext = createContext({
  isOpen: false,
  openJigs: () => {},
  closeJigs: () => {},
  toggleJigs: () => {},
});

export function JigsModalProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const lastTriggerRef = useRef(null);

  const openJigs = useCallback((triggerElement = null) => {
    if (triggerElement && typeof triggerElement.focus === 'function') {
      lastTriggerRef.current = triggerElement;
    } else if (typeof document !== 'undefined' && document.activeElement) {
      lastTriggerRef.current = document.activeElement;
    }
    setIsOpen(true);
  }, []);

  const closeJigs = useCallback(() => {
    setIsOpen(false);
    if (lastTriggerRef.current && typeof lastTriggerRef.current.focus === 'function') {
      setTimeout(() => {
        try {
          lastTriggerRef.current?.focus();
        } catch {
          // Element may have unmounted
        }
      }, 50);
    }
  }, []);

  const toggleJigs = useCallback((triggerElement = null) => {
    if (isOpen) {
      closeJigs();
    } else {
      openJigs(triggerElement);
    }
  }, [isOpen, openJigs, closeJigs]);

  return (
    <JigsModalContext.Provider value={{ isOpen, openJigs, closeJigs, toggleJigs }}>
      {children}
    </JigsModalContext.Provider>
  );
}

export function useJigsModal() {
  return useContext(JigsModalContext);
}
