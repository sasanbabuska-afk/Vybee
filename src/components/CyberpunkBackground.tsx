import React, { useEffect, useRef } from 'react';

export const CyberpunkBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let dpr = window.devicePixelRatio || 1;

    // Mouse coordinates
    let rawMouseX = -1000;
    let rawMouseY = -1000;
    let curMouseX = -1000;
    let curMouseY = -1000;
    let isHovering = false;

    // Parallax focal point for the background wave center
    let focalX = 0;
    let focalY = 0;
    let targetFocalX = 0;
    let targetFocalY = 0;

    const resize = () => {
      if (!canvas) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);

      focalX = targetFocalX = width * 0.5;
      focalY = targetFocalY = height * 0.38;
    };

    resize();

    const handleMouseMove = (e: MouseEvent) => {
      rawMouseX = e.clientX;
      rawMouseY = e.clientY;
      isHovering = true;

      // Gentle parallax towards cursor for the background ring
      targetFocalX = width * 0.5 + (rawMouseX - width * 0.5) * 0.18;
      targetFocalY = height * 0.38 + (rawMouseY - height * 0.38) * 0.18;
    };

    const handleMouseLeave = () => {
      isHovering = false;
      targetFocalX = width * 0.5;
      targetFocalY = height * 0.38;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('resize', resize);

    let time = 0;
    const dotSpacing = 16; // Grid spacing in px
    const mouseRadius = 140; // Spotlight interaction radius

    const render = () => {
      // Slower, fluid time step like gentle water waves
      time += 0.008;

      // Smooth mouse interpolation for silky cursor response
      if (isHovering) {
        curMouseX += (rawMouseX - curMouseX) * 0.18;
        curMouseY += (rawMouseY - curMouseY) * 0.18;
      } else {
        curMouseX += (-1000 - curMouseX) * 0.05;
        curMouseY += (-1000 - curMouseY) * 0.05;
      }

      // Smooth focal center lag for organic inertia
      focalX += (targetFocalX - focalX) * 0.035;
      focalY += (targetFocalY - focalY) * 0.035;

      // Deep clean dark background
      ctx.fillStyle = '#050507';
      ctx.fillRect(0, 0, width, height);

      // Subtle ambient radial glow behind the center
      const bgGlowRadius = Math.min(width, height) * 0.65;
      const bgGlow = ctx.createRadialGradient(
        focalX,
        focalY,
        bgGlowRadius * 0.15,
        focalX,
        focalY,
        bgGlowRadius
      );
      bgGlow.addColorStop(0, 'rgba(255, 92, 0, 0.025)');
      bgGlow.addColorStop(0.5, 'rgba(255, 120, 0, 0.012)');
      bgGlow.addColorStop(1, 'rgba(5, 5, 7, 0)');
      ctx.fillStyle = bgGlow;
      ctx.fillRect(0, 0, width, height);

      // Calculate matrix grid dimensions
      const cols = Math.ceil(width / dotSpacing) + 1;
      const rows = Math.ceil(height / dotSpacing) + 1;

      // Dimensions of the circular/elliptical wave
      const ringRadiusX = Math.min(width * 0.38, 440);
      const ringRadiusY = Math.min(height * 0.32, 300);
      const ringThickness = ringRadiusX * 0.52;

      // Render dot matrix wave
      for (let r = 0; r < rows; r++) {
        const y = r * dotSpacing;
        for (let c = 0; c < cols; c++) {
          const x = c * dotSpacing;

          // 1. Normalized distance from water wave center
          const dx = (x - focalX) / ringRadiusX;
          const dy = (y - focalY) / ringRadiusY;
          const dist = Math.sqrt(dx * dx + dy * dy);

          // 2. Slow, layered harmonic water wave calculation (ripples expanding smoothly)
          const primaryWave = Math.sin(dist * 3.4 - time * 1.1);
          const secondaryWave = Math.sin(dist * 2.1 + time * 0.65);
          const waterRipple = primaryWave * 0.7 + secondaryWave * 0.3;

          // 3. Torus halo envelope
          const haloDist = Math.abs(dist - 1.0);
          const haloSpread = ringThickness / ringRadiusX;
          const haloEnvelope = Math.exp(-Math.pow(haloDist / haloSpread, 2));

          // 4. Base background dot opacity
          const baseAlpha = 0.04;

          // 5. Wave-illuminated alpha in background
          const waveAlpha = haloEnvelope * (0.32 + 0.28 * waterRipple);

          // 6. Interactive Cursor Spotlight (Clean, crisp pure white dots on mouse hover)
          let mouseInfluence = 0;
          if (curMouseX > -500 && curMouseY > -500) {
            const mdx = x - curMouseX;
            const mdy = y - curMouseY;
            const mouseDist = Math.sqrt(mdx * mdx + mdy * mdy);
            if (mouseDist < mouseRadius) {
              const ratio = 1 - mouseDist / mouseRadius;
              // Smooth quadratic curve for natural clean illumination
              mouseInfluence = ratio * ratio * (3 - 2 * ratio);
            }
          }

          // Combined alpha
          const combinedAlpha = Math.min(1.0, baseAlpha + waveAlpha + mouseInfluence * 0.9);
          if (combinedAlpha <= 0.025) continue;

          // 7. Dot size: baseline is subtle, water wave crests expand softly, mouse makes it clean & distinct
          const baseRadius = 0.75;
          const waveRadiusBonus = haloEnvelope * (0.45 + 0.35 * Math.max(0, waterRipple));
          const mouseRadiusBonus = mouseInfluence * 1.05; // Expands to clean, sharp dot under cursor
          const finalRadius = baseRadius + waveRadiusBonus + mouseRadiusBonus;

          // 8. Dot Color styling:
          // Under mouse: pure, perfect, ultra-clean bright white (RGB 255, 255, 255)
          // In wave halo: warm luminous light-orange/cream
          // In rest grid: soft cool slate
          if (mouseInfluence > 0.01) {
            // Blend smoothly into pure crisp white
            const whiteAlpha = Math.min(1.0, 0.25 + mouseInfluence * 0.75);
            ctx.fillStyle = `rgba(255, 255, 255, ${whiteAlpha})`;
          } else if (haloEnvelope > 0.15) {
            const brightness = Math.floor(185 + 70 * haloEnvelope);
            const rVal = Math.min(255, brightness + 25);
            const gVal = brightness;
            const bVal = Math.max(140, brightness - 30);
            ctx.fillStyle = `rgba(${rVal}, ${gVal}, ${bVal}, ${combinedAlpha})`;
          } else {
            ctx.fillStyle = `rgba(150, 155, 175, ${combinedAlpha})`;
          }

          ctx.beginPath();
          ctx.arc(x, y, finalRadius, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Soft vignette on the outer perimeter
      const edgeVignette = ctx.createRadialGradient(
        width * 0.5,
        height * 0.5,
        Math.min(width, height) * 0.4,
        width * 0.5,
        height * 0.5,
        Math.max(width, height) * 0.78
      );
      edgeVignette.addColorStop(0, 'rgba(5, 5, 7, 0)');
      edgeVignette.addColorStop(1, 'rgba(5, 5, 7, 0.72)');
      ctx.fillStyle = edgeVignette;
      ctx.fillRect(0, 0, width, height);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div
      id="motion-dot-wave-bg"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block"
      />
    </div>
  );
};
