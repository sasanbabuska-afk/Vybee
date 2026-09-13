import React, { useState } from 'react';
import { motion, useAnimation } from 'motion/react';

interface AnimatedIconProps {
  className?: string;
  size?: number;
  color?: string;
  isHovered?: boolean;
}

// 1. Animated Compass (Needle spin on hover / pulse)
export const AnimatedCompass: React.FC<AnimatedIconProps> = ({
  className = '',
  size = 20,
  isHovered
}) => {
  const [internalHover, setInternalHover] = useState(false);
  const active = isHovered ?? internalHover;

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      onMouseEnter={() => setInternalHover(true)}
      onMouseLeave={() => setInternalHover(false)}
    >
      <circle cx="12" cy="12" r="10" />
      <motion.polygon
        points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"
        animate={{
          rotate: active ? [0, 45, -25, 360] : 0,
          scale: active ? [1, 1.15, 1] : 1
        }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
        style={{ transformOrigin: '12px 12px' }}
      />
    </motion.svg>
  );
};

// 2. Animated Bell (Ringing / swinging clapper)
export const AnimatedBell: React.FC<AnimatedIconProps> = ({
  className = '',
  size = 20,
  isHovered
}) => {
  const [internalHover, setInternalHover] = useState(false);
  const active = isHovered ?? internalHover;

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      onMouseEnter={() => setInternalHover(true)}
      onMouseLeave={() => setInternalHover(false)}
      animate={{
        rotate: active ? [0, -18, 18, -12, 12, -4, 4, 0] : 0
      }}
      transition={{ duration: 0.65, ease: 'easeInOut' }}
      style={{ transformOrigin: '12px 2px' }}
    >
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <motion.path
        d="M10.3 21a1.94 1.94 0 0 0 3.4 0"
        animate={{
          x: active ? [-1.5, 1.5, -1, 1, 0] : 0
        }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
      />
    </motion.svg>
  );
};

// 3. Animated Sparkles (Rotating & Pulsing stars)
export const AnimatedSparkles: React.FC<AnimatedIconProps> = ({
  className = '',
  size = 20,
  isHovered
}) => {
  const [internalHover, setInternalHover] = useState(false);
  const active = isHovered ?? internalHover;

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      onMouseEnter={() => setInternalHover(true)}
      onMouseLeave={() => setInternalHover(false)}
    >
      {/* Main big star */}
      <motion.path
        d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"
        animate={{
          scale: active ? [1, 1.25, 0.9, 1.1, 1] : 1,
          rotate: active ? [0, 90, 180] : 0
        }}
        transition={{ duration: 0.65, ease: 'easeOut' }}
        style={{ transformOrigin: '12px 12px' }}
      />
      {/* Small top-right star */}
      <motion.path
        d="M5 3v4"
        animate={{
          opacity: active ? [1, 0.2, 1] : 1,
          scale: active ? [1, 1.3, 1] : 1
        }}
        transition={{ duration: 0.4, delay: 0.1 }}
      />
      <motion.path
        d="M19 17v4"
        animate={{
          opacity: active ? [1, 0.2, 1] : 1,
          scale: active ? [1, 1.3, 1] : 1
        }}
        transition={{ duration: 0.4, delay: 0.2 }}
      />
    </motion.svg>
  );
};

// 4. Animated MapPin (Bouncing pin + ping ground wave)
export const AnimatedMapPin: React.FC<AnimatedIconProps> = ({
  className = '',
  size = 20,
  isHovered
}) => {
  const [internalHover, setInternalHover] = useState(false);
  const active = isHovered ?? internalHover;

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      onMouseEnter={() => setInternalHover(true)}
      onMouseLeave={() => setInternalHover(false)}
    >
      <motion.g
        animate={{
          y: active ? [0, -5, 0, -2, 0] : 0
        }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
        <circle cx="12" cy="10" r="3" />
      </motion.g>
      {/* Ripple wave under pin */}
      {active && (
        <motion.ellipse
          cx="12"
          cy="21.5"
          rx="4"
          ry="1.5"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: [0.8, 0], scale: [0.8, 1.6] }}
          transition={{ duration: 0.5 }}
        />
      )}
    </motion.svg>
  );
};

// 5. Animated Plus (Rotation and pop)
export const AnimatedPlus: React.FC<AnimatedIconProps> = ({
  className = '',
  size = 20,
  isHovered
}) => {
  const [internalHover, setInternalHover] = useState(false);
  const active = isHovered ?? internalHover;

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      onMouseEnter={() => setInternalHover(true)}
      onMouseLeave={() => setInternalHover(false)}
      animate={{
        rotate: active ? [0, 90] : 0,
        scale: active ? [1, 1.2, 1] : 1
      }}
      transition={{ duration: 0.35, ease: 'backOut' }}
      style={{ transformOrigin: '12px 12px' }}
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </motion.svg>
  );
};

// 6. Animated Clock (Ticking clock hands)
export const AnimatedClock: React.FC<AnimatedIconProps> = ({
  className = '',
  size = 20,
  isHovered
}) => {
  const [internalHover, setInternalHover] = useState(false);
  const active = isHovered ?? internalHover;

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      onMouseEnter={() => setInternalHover(true)}
      onMouseLeave={() => setInternalHover(false)}
    >
      <circle cx="12" cy="12" r="10" />
      <motion.line
        x1="12"
        y1="12"
        x2="12"
        y2="6"
        animate={{
          rotate: active ? [0, 360] : 0
        }}
        transition={{ duration: 0.8, ease: 'easeInOut' }}
        style={{ transformOrigin: '12px 12px' }}
      />
      <motion.line
        x1="12"
        y1="12"
        x2="16"
        y2="14"
        animate={{
          rotate: active ? [0, 180] : 0
        }}
        transition={{ duration: 0.8, ease: 'easeInOut' }}
        style={{ transformOrigin: '12px 12px' }}
      />
    </motion.svg>
  );
};

// 7. Animated Flame (Dancing flicker effect)
export const AnimatedFlame: React.FC<AnimatedIconProps> = ({
  className = '',
  size = 20,
  isHovered
}) => {
  const [internalHover, setInternalHover] = useState(false);
  const active = isHovered ?? internalHover;

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      onMouseEnter={() => setInternalHover(true)}
      onMouseLeave={() => setInternalHover(false)}
      animate={{
        scaleY: active ? [1, 1.2, 0.95, 1.15, 1] : [1, 1.06, 1],
        scaleX: active ? [1, 0.9, 1.05, 0.95, 1] : [1, 0.96, 1],
        y: active ? [0, -2, 1, -1, 0] : [0, -1, 0]
      }}
      transition={{
        duration: active ? 0.6 : 2.5,
        repeat: active ? 0 : Infinity,
        ease: 'easeInOut'
      }}
      style={{ transformOrigin: '12px 22px' }}
    >
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </motion.svg>
  );
};

// 8. Animated ShieldCheck (Shield pulse + check drawing)
export const AnimatedShieldCheck: React.FC<AnimatedIconProps> = ({
  className = '',
  size = 20,
  isHovered
}) => {
  const [internalHover, setInternalHover] = useState(false);
  const active = isHovered ?? internalHover;

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      onMouseEnter={() => setInternalHover(true)}
      onMouseLeave={() => setInternalHover(false)}
      animate={{
        scale: active ? [1, 1.12, 1] : 1
      }}
      transition={{ duration: 0.35 }}
    >
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
      <motion.path
        d="m9 12 2 2 4-4"
        animate={{
          pathLength: active ? [0, 1] : 1,
          opacity: active ? [0, 1] : 1
        }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      />
    </motion.svg>
  );
};

// 9. Animated Zap (Electric pulse & flash)
export const AnimatedZap: React.FC<AnimatedIconProps> = ({
  className = '',
  size = 20,
  isHovered
}) => {
  const [internalHover, setInternalHover] = useState(false);
  const active = isHovered ?? internalHover;

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      onMouseEnter={() => setInternalHover(true)}
      onMouseLeave={() => setInternalHover(false)}
      animate={{
        scale: active ? [1, 1.25, 0.95, 1.1, 1] : 1,
        rotate: active ? [0, -10, 10, -5, 0] : 0
      }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
      style={{ transformOrigin: '13px 12px' }}
    >
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </motion.svg>
  );
};

// 10. Animated Search (Zoom in and tilt)
export const AnimatedSearch: React.FC<AnimatedIconProps> = ({
  className = '',
  size = 20,
  isHovered
}) => {
  const [internalHover, setInternalHover] = useState(false);
  const active = isHovered ?? internalHover;

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      onMouseEnter={() => setInternalHover(true)}
      onMouseLeave={() => setInternalHover(false)}
      animate={{
        scale: active ? [1, 1.2, 1] : 1,
        rotate: active ? [0, -15, 15, 0] : 0
      }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      style={{ transformOrigin: '11px 11px' }}
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </motion.svg>
  );
};

// 11. Animated Users (Nod / pop of squad)
export const AnimatedUsers: React.FC<AnimatedIconProps> = ({
  className = '',
  size = 20,
  isHovered
}) => {
  const [internalHover, setInternalHover] = useState(false);
  const active = isHovered ?? internalHover;

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      onMouseEnter={() => setInternalHover(true)}
      onMouseLeave={() => setInternalHover(false)}
    >
      <motion.path
        d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
        animate={{
          y: active ? [0, -2, 0] : 0
        }}
        transition={{ duration: 0.4 }}
      />
      <motion.circle
        cx="9"
        cy="7"
        r="4"
        animate={{
          y: active ? [0, -3, 0] : 0
        }}
        transition={{ duration: 0.4 }}
      />
      <motion.path
        d="M22 21v-2a4 4 0 0 0-3-3.87"
        animate={{
          x: active ? [0, 2, 0] : 0
        }}
        transition={{ duration: 0.4, delay: 0.1 }}
      />
      <motion.path
        d="M16 3.13a4 4 0 0 1 0 7.75"
        animate={{
          x: active ? [0, 2, 0] : 0
        }}
        transition={{ duration: 0.4, delay: 0.1 }}
      />
    </motion.svg>
  );
};

// 12. Animated ArrowRight (Spring translation forward)
export const AnimatedArrowRight: React.FC<AnimatedIconProps> = ({
  className = '',
  size = 20,
  isHovered
}) => {
  const [internalHover, setInternalHover] = useState(false);
  const active = isHovered ?? internalHover;

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      onMouseEnter={() => setInternalHover(true)}
      onMouseLeave={() => setInternalHover(false)}
      animate={{
        x: active ? [0, 4, 0] : 0
      }}
      transition={{ duration: 0.4, ease: 'backOut' }}
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </motion.svg>
  );
};

// 13. Animated CheckCircle (Pop & draw circle)
export const AnimatedCheckCircle: React.FC<AnimatedIconProps> = ({
  className = '',
  size = 20,
  isHovered
}) => {
  const [internalHover, setInternalHover] = useState(false);
  const active = isHovered ?? internalHover;

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      onMouseEnter={() => setInternalHover(true)}
      onMouseLeave={() => setInternalHover(false)}
      animate={{
        scale: active ? [1, 1.2, 1] : 1
      }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <motion.path
        d="m9 11 3 3L22 4"
        animate={{
          pathLength: active ? [0, 1] : 1
        }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      />
    </motion.svg>
  );
};

// 14. Animated Calendar (Page flip / hop)
export const AnimatedCalendar: React.FC<AnimatedIconProps> = ({
  className = '',
  size = 20,
  isHovered
}) => {
  const [internalHover, setInternalHover] = useState(false);
  const active = isHovered ?? internalHover;

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      onMouseEnter={() => setInternalHover(true)}
      onMouseLeave={() => setInternalHover(false)}
      animate={{
        y: active ? [0, -3, 0] : 0,
        rotate: active ? [0, -4, 4, 0] : 0
      }}
      transition={{ duration: 0.4, ease: 'easeInOut' }}
    >
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M3 10h18" />
    </motion.svg>
  );
};

// 15. Animated Layers (Floating vertical slice offset)
export const AnimatedLayers: React.FC<AnimatedIconProps> = ({
  className = '',
  size = 20,
  isHovered
}) => {
  const [internalHover, setInternalHover] = useState(false);
  const active = isHovered ?? internalHover;

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      onMouseEnter={() => setInternalHover(true)}
      onMouseLeave={() => setInternalHover(false)}
    >
      <motion.path
        d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"
        animate={{
          y: active ? [0, -3, 0] : 0
        }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      />
      <motion.path
        d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"
        animate={{
          y: active ? [0, 3, 0] : 0
        }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      />
      <path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" />
    </motion.svg>
  );
};

// 16. Animated User (gentle pop + glow on active, for Profile nav)
export const AnimatedUser: React.FC<AnimatedIconProps> = ({
  className = '',
  size = 20,
  isHovered
}) => {
  const [internalHover, setInternalHover] = useState(false);
  const active = isHovered ?? internalHover;

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      onMouseEnter={() => setInternalHover(true)}
      onMouseLeave={() => setInternalHover(false)}
    >
      <motion.circle
        cx="12"
        cy="8"
        r="4"
        animate={{ scale: active ? [1, 1.18, 1] : 1 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        style={{ transformOrigin: '12px 8px' }}
      />
      <motion.path
        d="M4 21c0-4 4-6 8-6s8 2 8 6"
        animate={{ y: active ? [0, -1, 0] : 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
      />
    </motion.svg>
  );
};
