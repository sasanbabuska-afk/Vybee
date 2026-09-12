import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';

interface AuthCardProps {
  children: React.ReactNode;
  reducedMotion?: boolean;
}

export const AuthCard: React.FC<AuthCardProps> = ({ children, reducedMotion = false }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reducedMotion || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Normalize coordinates (-1 to 1)
    const normalizedX = (x / rect.width - 0.5) * 2;
    const normalizedY = (y / rect.height - 0.5) * 2;

    // Subtle tilt angle: max 3.5 deg
    setTilt({
      x: -normalizedY * 3.5,
      y: normalizedX * 3.5
    });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
        rotateX: tilt.x,
        rotateY: tilt.y
      }}
      transition={{
        duration: 0.7,
        ease: [0.16, 1, 0.3, 1]
      }}
      style={{
        transformStyle: 'preserve-3d',
        perspective: 1000
      }}
      className="relative w-full max-w-[440px] sm:max-w-[460px] mx-auto z-20"
    >
      {/* Ambient background aura behind glass card */}
      <div 
        className="absolute -inset-1 rounded-[32px] bg-gradient-to-b from-[#FF5C00]/25 via-transparent to-[#FF5C00]/10 blur-xl opacity-70 pointer-events-none transition-opacity duration-500"
        style={{
          opacity: isHovered ? 0.9 : 0.6
        }}
      />

      {/* Main Floating Glass Container */}
      <div className="relative rounded-3xl bg-[#0D0E16]/85 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.85)] backdrop-blur-2xl overflow-hidden p-6 sm:p-8 transition-colors duration-300">
        {/* Subtle orange accent top bar */}
        <div className="absolute top-0 inset-x-8 h-[2px] bg-gradient-to-r from-transparent via-[#FF5C00] to-transparent opacity-80" />
        
        {/* Subtle glass reflection highlight */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />

        {/* Card Content Slot */}
        <div className="relative z-10">
          {children}
        </div>
      </div>
    </motion.div>
  );
};
