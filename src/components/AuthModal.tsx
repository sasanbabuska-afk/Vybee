import React from 'react';
import { CinematicAuthExperience } from './auth/CinematicAuthExperience';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialMode?: 'signin' | 'signup';
  actionPrompt?: string;
  forceIntro?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialMode = 'signin',
  forceIntro = false
}) => {
  if (!isOpen) return null;

  return (
    <CinematicAuthExperience
      initialMode={initialMode}
      onSuccess={() => {
        onSuccess();
        onClose();
      }}
      onClose={onClose}
      forceIntro={forceIntro}
    />
  );
};
