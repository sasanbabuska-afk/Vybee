import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface ModalPortalProps {
  children: React.ReactNode;
}

export const ModalPortal: React.FC<ModalPortalProps> = ({ children }) => {
  const [target, setTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const updateTarget = () => {
      const fsElement = document.fullscreenElement as HTMLElement | null;
      setTarget(fsElement || document.body);
    };

    updateTarget();
    document.addEventListener('fullscreenchange', updateTarget);
    return () => {
      document.removeEventListener('fullscreenchange', updateTarget);
    };
  }, []);

  if (!target) return null;
  return createPortal(children, target);
};
