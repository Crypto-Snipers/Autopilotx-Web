import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface PortalProps {
  children: React.ReactNode;
  wrapperId?: string;
}

export const Portal: React.FC<PortalProps> = ({ children, wrapperId = 'portal-root' }) => {
  const [mounted, setMounted] = useState(false);
  let portalRoot: HTMLElement | null = null;

  useEffect(() => {
    setMounted(true);
    
    // Create the portal root element if it doesn't exist
    if (!document.getElementById(wrapperId)) {
      const div = document.createElement('div');
      div.setAttribute('id', wrapperId);
      div.style.position = 'fixed';
      div.style.top = '0';
      div.style.left = '0';
      div.style.width = '100%';
      div.style.zIndex = '9999';
      document.body.appendChild(div);
    }
    
    portalRoot = document.getElementById(wrapperId);
    
    return () => {
      if (portalRoot && portalRoot.parentNode === document.body) {
        document.body.removeChild(portalRoot);
      }
    };
  }, [wrapperId]);

  if (!mounted) return null;
  
  return createPortal(children, document.getElementById(wrapperId) as HTMLElement);
};
