import { useEffect, useRef } from 'react';

interface Sphere {
  x: number;
  y: number;
  angle: number;
  radius: number;
  color: string;
  originalX: number;
  originalY: number;
  brightness: number;
}

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  twinkleSpeed: number;
  twinkleOffset: number;
  color: string;
  floatSpeedX: number;
  floatSpeedY: number;
  floatOffsetX: number;
  floatOffsetY: number;
}

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const animationRef = useRef<number>();
  const lastMouseMoveRef = useRef<number>(Date.now());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // DNA helix parameters
    const helixRadius = 80;
    const helixWidth = canvas.width * 0.8;
    const sphereCount = 20;
    const spheres: Sphere[] = [];

    // Create DNA spheres (two strands) - horizontal orientation
    for (let i = 0; i < sphereCount; i++) {
      const t = (i / sphereCount) * Math.PI * 4;
      const progress = i / sphereCount;
      
      // Add slight randomness to sphere sizes
      const randomRadius = 12 + (Math.random() - 0.5) * 3;  // 10.5 to 13.5
      
      // Add randomness to helix radius for imperfection
      const radiusVariation = helixRadius + (Math.random() - 0.5) * 30; // ±15 pixels
      
      // Add slight positional offset for imperfection
      const xOffset = (Math.random() - 0.5) * 40;
      const yOffset = (Math.random() - 0.5) * 20;
      
      // First strand
      spheres.push({
        x: (i / sphereCount) * helixWidth - helixWidth / 2 + xOffset,
        y: Math.cos(t) * radiusVariation + yOffset,
        angle: t,
        radius: randomRadius,
        color: interpolateColor(progress),
        originalX: (i / sphereCount) * helixWidth - helixWidth / 2 + xOffset,
        originalY: Math.cos(t) * radiusVariation + yOffset,
        brightness: 1,
      });

      // Second strand (opposite side) - different random size
      const randomRadius2 = 12 + (Math.random() - 0.5) * 3;  // 10.5 to 13.5
      const radiusVariation2 = helixRadius + (Math.random() - 0.5) * 30;
      const xOffset2 = (Math.random() - 0.5) * 40;
      const yOffset2 = (Math.random() - 0.5) * 20;
      
      spheres.push({
        x: (i / sphereCount) * helixWidth - helixWidth / 2 + xOffset2,
        y: Math.cos(t + Math.PI) * radiusVariation2 + yOffset2,
        angle: t + Math.PI,
        radius: randomRadius2,
        color: interpolateColor(progress),
        originalX: (i / sphereCount) * helixWidth - helixWidth / 2 + xOffset2,
        originalY: Math.cos(t + Math.PI) * radiusVariation2 + yOffset2,
        brightness: 1,
      });
    }
    
    // Add random spheres scattered within the helix area for ambiguity
    const randomSphereCount = 15;
    for (let i = 0; i < randomSphereCount; i++) {
      const randomProgress = Math.random();
      const randomRadius = 8 + Math.random() * 6; // 8 to 14
      
      spheres.push({
        x: (Math.random() - 0.5) * helixWidth,
        y: (Math.random() - 0.5) * helixRadius * 3,
        angle: Math.random() * Math.PI * 2,
        radius: randomRadius,
        color: interpolateColor(randomProgress),
        originalX: (Math.random() - 0.5) * helixWidth,
        originalY: (Math.random() - 0.5) * helixRadius * 3,
        brightness: 1,
      });
    }

    // Create background stars with pink-to-blue colors, concentrated towards center
    const starCount = 120;
    const stars: Star[] = [];
    for (let i = 0; i < starCount; i++) {
      const colorProgress = Math.random();
      
      // Use gaussian distribution to concentrate stars towards horizontal center
      const gaussianRandom = () => {
        let u = 0, v = 0;
        while(u === 0) u = Math.random();
        while(v === 0) v = Math.random();
        return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
      };
      
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      // Much tighter horizontal spread, looser vertical spread
      const spreadX = canvas.width / 6; // Reduced from /3 to /6 for tighter horizontal concentration
      const spreadY = canvas.height / 2.5; // Slightly increased vertical spread
      
      stars.push({
        x: centerX + gaussianRandom() * spreadX,
        y: centerY + gaussianRandom() * spreadY,
        size: Math.random() * 4 + 0.3,  // Increased range: 0.3 to 4.3 (more variation)
        opacity: Math.random() * 0.5 + 0.3,
        twinkleSpeed: Math.random() * 0.02 + 0.01,
        twinkleOffset: Math.random() * Math.PI * 2,
        color: interpolateColor(colorProgress),
        floatSpeedX: Math.random() * 0.0008 + 0.0002,
        floatSpeedY: Math.random() * 0.0008 + 0.0002,
        floatOffsetX: Math.random() * Math.PI * 2,
        floatOffsetY: Math.random() * Math.PI * 2,
      });
    }

    // Color interpolation from pink to blue
    function interpolateColor(t: number): string {
      const pink = { r: 255, g: 20, b: 147 };  // Deeper hot pink
      const blue = { r: 0, g: 191, b: 255 };   // Vibrant deep sky blue
      
      const r = Math.round(pink.r + (blue.r - pink.r) * t);
      const g = Math.round(pink.g + (blue.g - pink.g) * t);
      const b = Math.round(pink.b + (blue.b - blue.b) * t);
      
      return `rgb(${r}, ${g}, ${b})`;
    }

    // Apply brightness to color
    function applyBrightness(color: string, brightness: number): string {
      const [r, g, b] = color.match(/\d+/g)?.map(Number) || [0, 0, 0];
      const brightenedR = Math.min(255, Math.round(r * brightness));
      const brightenedG = Math.min(255, Math.round(g * brightness));
      const brightenedB = Math.min(255, Math.round(b * brightness));
      return `rgb(${brightenedR}, ${brightenedG}, ${brightenedB})`;
    }

    // Mouse tracking
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
      lastMouseMoveRef.current = Date.now();
    };
    window.addEventListener('mousemove', handleMouseMove);

    let rotation = 0;

    // Animation loop
    const animate = () => {
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      rotation += 0.005;

      // Draw background stars
      stars.forEach((star, index) => {
        const twinkle = Math.sin(Date.now() * star.twinkleSpeed + star.twinkleOffset);
        const currentOpacity = star.opacity + twinkle * 0.2;
        
        const [r, g, b] = star.color.match(/\d+/g)?.map(Number) || [0, 0, 0];
        
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${currentOpacity})`;
        ctx.fill();
        
        // Add glow
        const gradient = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.size * 3);
        gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${currentOpacity * 0.3})`);
        gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size * 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Apply floating effect
        star.x += Math.sin(Date.now() * star.floatSpeedX + star.floatOffsetX) * 0.5;
        star.y += Math.sin(Date.now() * star.floatSpeedY + star.floatOffsetY) * 0.5;
      });

      // Update sphere positions with rotation
      spheres.forEach((sphere, index) => {
        // Only apply rotation to the first 40 spheres (the helix strands)
        // Random spheres (index >= 40) will drift slowly
        if (index < sphereCount * 2) {
          const t = (index / 2 / sphereCount) * Math.PI * 4 + rotation;
          const isFirstStrand = index % 2 === 0;
          const offset = isFirstStrand ? 0 : Math.PI;
          
          // Add slight wobble to the rotation
          const wobble = Math.sin(Date.now() * 0.001 + index) * 10;
          
          sphere.originalY = Math.cos(t + offset) * helixRadius + wobble;
          
          // Calculate brightness based on sine (simulates z-depth)
          // sin(angle) gives -1 to 1, we map to 0.3 to 1 for brightness
          const zDepth = Math.sin(t + offset);
          sphere.brightness = 0.3 + (zDepth + 1) / 2 * 0.7;
          
          // Smoothly return to original position with slight variation
          sphere.y += (sphere.originalY - sphere.y) * (0.08 + Math.random() * 0.04);
        } else {
          // Random spheres drift slowly
          const drift = Math.sin(Date.now() * 0.0005 + index) * 0.3;
          sphere.y += drift;
          sphere.x += Math.cos(Date.now() * 0.0003 + index) * 0.2;
          
          // Random spheres have varying brightness
          sphere.brightness = 0.4 + Math.sin(Date.now() * 0.002 + index) * 0.3;
        }
      });

      // Find center for mouse interaction and rendering
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Check if mouse has been inactive (resting)
      const timeSinceLastMove = Date.now() - lastMouseMoveRef.current;
      const restThreshold = 2000; // 2 seconds of rest
      const isResting = timeSinceLastMove > restThreshold;

      // Apply drag effect to multiple spheres within influence radius
      const influenceRadius = 250;
      
      spheres.forEach((sphere, index) => {
        const screenX = centerX + sphere.x;
        const screenY = centerY + sphere.y;
        const dist = Math.sqrt(
          Math.pow(mouseRef.current.x - screenX, 2) +
          Math.pow(mouseRef.current.y - screenY, 2)
        );
        
        // If resting, gradually return to original helix position
        if (isResting) {
          // Calculate how long we've been resting beyond threshold
          const restDuration = Math.min(timeSinceLastMove - restThreshold, 3000); // Cap at 3 seconds
          const returnStrength = (restDuration / 3000) * 0.08; // Gradual increase to 0.08
          
          sphere.x += (sphere.originalX - sphere.x) * returnStrength;
          // Y position already returns via rotation update above
        } else if (dist < influenceRadius) {
          // Apply drag to all spheres within influence radius when mouse is active
          const targetX = mouseRef.current.x - centerX;
          const targetY = mouseRef.current.y - centerY;
          
          // Smoother falloff curve using quadratic easing
          const normalizedDist = dist / influenceRadius;
          const falloff = 1 - (normalizedDist * normalizedDist);
          const dragStrength = falloff * 0.5;
          
          sphere.x += (targetX - sphere.x) * dragStrength * 0.15;
          sphere.y += (targetY - sphere.y) * dragStrength * 0.15;
        }
      });

      // Sort spheres by brightness for proper rendering (darker first)
      const sortedSpheres = [...spheres].sort((a, b) => a.brightness - b.brightness);

      // Draw DNA spheres
      sortedSpheres.forEach((sphere) => {
        const screenX = centerX + sphere.x;
        const screenY = centerY + sphere.y;
        
        const scaledRadius = sphere.radius;
        
        // Apply brightness to color
        const brightenedColor = applyBrightness(sphere.color, sphere.brightness);
        
        // Draw glow - subtly decreased
        const glowRadius = scaledRadius * 4;
        const gradient = ctx.createRadialGradient(screenX, screenY, 0, screenX, screenY, glowRadius);
        gradient.addColorStop(0, brightenedColor);
        gradient.addColorStop(0.2, brightenedColor.replace('rgb', 'rgba').replace(')', `, ${0.4 * sphere.brightness})`));
        gradient.addColorStop(0.5, brightenedColor.replace('rgb', 'rgba').replace(')', `, ${0.2 * sphere.brightness})`));
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(screenX, screenY, glowRadius, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw sphere
        const sphereGradient = ctx.createRadialGradient(
          screenX - scaledRadius * 0.3,
          screenY - scaledRadius * 0.3,
          0,
          screenX,
          screenY,
          scaledRadius
        );
        sphereGradient.addColorStop(0, brightenedColor);
        sphereGradient.addColorStop(0.4, brightenedColor);
        sphereGradient.addColorStop(1, brightenedColor.replace('rgb', 'rgba').replace(')', `, ${0.7 * sphere.brightness})`));
        
        ctx.fillStyle = sphereGradient;
        ctx.beginPath();
        ctx.arc(screenX, screenY, scaledRadius, 0, Math.PI * 2);
        ctx.fill();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div className="w-full h-screen overflow-hidden">
      <canvas
        ref={canvasRef}
        className="block"
        style={{ cursor: 'none' }}
      />
    </div>
  );
}