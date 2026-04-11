"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { MousePointer2, ArrowRight, ChevronDown } from 'lucide-react';

// --- Types ---

interface Particle {
  x: number;
  y: number;
  originX: number;
  originY: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  angle: number; // For some organic oscillation
}

interface BackgroundParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  phase: number;
}

interface MouseState {
  x: number;
  y: number;
  isActive: boolean;
}

// --- Configuration Constants ---

const PARTICLE_DENSITY = 0.00015; // Particles per pixel squared (adjust for density)
const BG_PARTICLE_DENSITY = 0.00005; // Less dense for background
const MOUSE_RADIUS = 180; // Radius of mouse influence
const RETURN_SPEED = 0.08; // How fast particles fly back to origin (spring constant)
const DAMPING = 0.90; // Friction (velocity decay)
const REPULSION_STRENGTH = 1.2; // Multiplier for mouse push force

// --- Helper Functions ---

const randomRange = (min: number, max: number) => Math.random() * (max - min) + min;

// --- Components ---

const AntiGravityCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [debugInfo, setDebugInfo] = useState({ count: 0, fps: 0 });
  
  // Mutable state refs to avoid re-renders during animation loop
  const particlesRef = useRef<Particle[]>([]);
  const backgroundParticlesRef = useRef<BackgroundParticle[]>([]);
  const mouseRef = useRef<MouseState>({ x: -1000, y: -1000, isActive: false });
  const frameIdRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  // Initialize Particles
  const initParticles = useCallback((width: number, height: number) => {
    // 1. Main Interactive Particles
    const particleCount = Math.floor(width * height * PARTICLE_DENSITY);
    const newParticles: Particle[] = [];
    
    for (let i = 0; i < particleCount; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      
      newParticles.push({
        x: x,
        y: y,
        originX: x,
        originY: y,
        vx: 0,
        vy: 0,
        size: randomRange(1, 2.5), 
        color: Math.random() > 0.9 ? '#78611E' : '#ffffff',
        angle: Math.random() * Math.PI * 2,
      });
    }
    particlesRef.current = newParticles;

    // 2. Background Ambient Particles (Stars/Dust)
    const bgCount = Math.floor(width * height * BG_PARTICLE_DENSITY);
    const newBgParticles: BackgroundParticle[] = [];
    
    for (let i = 0; i < bgCount; i++) {
      newBgParticles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 1.2,
        vy: (Math.random() - 0.5) * 1.2,
        size: randomRange(0.5, 4.5),
        alpha: randomRange(0.1, 0.4),
        phase: Math.random() * Math.PI * 2 // For twinkling offset
      });
    }
    backgroundParticlesRef.current = newBgParticles;

    setDebugInfo(prev => ({ ...prev, count: particleCount + bgCount }));
  }, []);

  // Animation Loop
  const animate = useCallback((time: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Calculate Delta Time for smooth animation (optional, but good for FPS calculation)
    const delta = time - lastTimeRef.current;
    lastTimeRef.current = time;
    if (delta > 0) {
        setDebugInfo(prev => ({ ...prev, fps: Math.round(1000 / delta) }));
    }

    // Clear Canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // --- Background Effects ---
    
    // 1. Pulsating Radial Glow
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const pulseSpeed = 0.0008;
    // Oscillates between 0.05 and 0.12 opacity
    const pulseOpacity = Math.sin(time * pulseSpeed) * 0.035 + 0.085; 
    
    const gradient = ctx.createRadialGradient(
        centerX, centerY, 0, 
        centerX, centerY, Math.max(canvas.width, canvas.height) * 0.7
    );
    gradient.addColorStop(0, `rgba(140, 110, 40, ${pulseOpacity})`); // Muted olive-gold glow
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Background Particles (Drifting Stars)
    const bgParticles = backgroundParticlesRef.current;
    ctx.fillStyle = "#ffffff";
    
    for (let i = 0; i < bgParticles.length; i++) {
      const p = bgParticles[i];
      p.x += p.vx;
      p.y += p.vy;
      
      // Wrap around screen
      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;

      // Twinkle effect
      const twinkle = Math.sin(time * 0.002 + p.phase) * 0.5 + 0.5; // 0 to 1
      const currentAlpha = p.alpha * (0.3 + 0.7 * twinkle);

      ctx.globalAlpha = currentAlpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1.0; // Reset alpha for foreground

    // --- Main Foreground Physics ---

    const particles = particlesRef.current;
    const mouse = mouseRef.current;

    // Phase 1: Apply Forces (Mouse & Spring)
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      // 1. Calculate Distance to Mouse
      const dx = mouse.x - p.x;
      const dy = mouse.y - p.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // 2. Mouse Repulsion Force
      if (mouse.isActive && distance < MOUSE_RADIUS) {
        const forceDirectionX = dx / distance;
        const forceDirectionY = dy / distance;
        const force = (MOUSE_RADIUS - distance) / MOUSE_RADIUS; 
        
        const repulsion = force * REPULSION_STRENGTH;
        p.vx -= forceDirectionX * repulsion * 5; 
        p.vy -= forceDirectionY * repulsion * 5;
      }

      // 3. Spring Force (Return to Origin)
      const springDx = p.originX - p.x;
      const springDy = p.originY - p.y;
      
      p.vx += springDx * RETURN_SPEED;
      p.vy += springDy * RETURN_SPEED;
    }

    // Phase 2: Resolve Collisions
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const p1 = particles[i];
        const p2 = particles[j];

        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const distSq = dx * dx + dy * dy;
        const minDist = p1.size + p2.size;

        if (distSq < minDist * minDist) {
          const dist = Math.sqrt(distSq);
          
          if (dist > 0.01) { // Avoid division by zero
            const nx = dx / dist; // Normal X
            const ny = dy / dist; // Normal Y

            // Static Resolution: Push particles apart so they don't overlap
            const overlap = minDist - dist;
            const pushX = nx * overlap * 0.5;
            const pushY = ny * overlap * 0.5;

            p1.x -= pushX;
            p1.y -= pushY;
            p2.x += pushX;
            p2.y += pushY;

            // Dynamic Resolution: Elastic Collision
            // Relative velocity
            const dvx = p1.vx - p2.vx;
            const dvy = p1.vy - p2.vy;

            // Calculate velocity along the normal
            // Dot product of velocity difference and normal direction
            const velocityAlongNormal = dvx * nx + dvy * ny;

            // Only bounce if they are moving towards each other
            if (velocityAlongNormal > 0) {
              const m1 = p1.size; // Use size as mass proxy
              const m2 = p2.size;
              const restitution = 0.85; // Bounciness (1 is perfectly elastic)

              // Impulse scalar
              const impulseMagnitude = (-(1 + restitution) * velocityAlongNormal) / (1/m1 + 1/m2);

              // Apply impulse
              const impulseX = impulseMagnitude * nx;
              const impulseY = impulseMagnitude * ny;

              p1.vx += impulseX / m1;
              p1.vy += impulseY / m1;
              p2.vx -= impulseX / m2;
              p2.vy -= impulseY / m2;
            }
          }
        }
      }
    }

    // Phase 3: Integration & Drawing
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      // Physics Update
      p.vx *= DAMPING;
      p.vy *= DAMPING;

      p.x += p.vx;
      p.y += p.vy;

      // Drawing
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      
      const velocity = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      const opacity = Math.min(0.3 + velocity * 0.1, 1); 
      
      ctx.fillStyle = p.color === '#ffffff' 
        ? `rgba(255, 255, 255, ${opacity})` 
        : p.color;
      
      ctx.fill();
    }

    frameIdRef.current = requestAnimationFrame(animate);
  }, []);

  // Resize Handler
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && canvasRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        
        // Set actual size in memory (scaled to account for extra pixel density)
        canvasRef.current.width = width * dpr;
        canvasRef.current.height = height * dpr;
        
        // Make it visible size
        canvasRef.current.style.width = `${width}px`;
        canvasRef.current.style.height = `${height}px`;

        // Normalize coordinate system to use CSS pixels
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) ctx.scale(dpr, dpr);

        // Re-init particles for new dimensions
        initParticles(width, height);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial call

    return () => window.removeEventListener('resize', handleResize);
  }, [initParticles]);

  // Start Animation
  useEffect(() => {
    frameIdRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameIdRef.current);
  }, [animate]);

  // Mouse Handlers
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    mouseRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      isActive: true,
    };
  };

  const handleMouseLeave = () => {
    mouseRef.current.isActive = false;
  };

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 z-0 overflow-hidden bg-black cursor-crosshair"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <canvas ref={canvasRef} className="block w-full h-full" />
    
    </div>
  );
};

const Navigation: React.FC = () => {
    return (
        <nav className="absolute top-0 left-0 w-full z-20 flex justify-between items-center p-6 md:p-8">
            <div className="flex items-center space-x-2">
                 <div className="w-8 h-8 border border-white/25 rounded-sm bg-transparent flex items-center justify-center">
                    <span className="font-bold text-white text-xs">SP</span>
                 </div>
                 <span className="text-white font-medium tracking-wide text-lg">ScripturePath</span>
            </div>
            <div className="flex items-center gap-6 ml-auto">
              <div className="hidden md:flex items-center gap-6 text-sm font-medium text-white/70">
                <a href="#" className="hover:text-white transition-colors">Trust</a>
                <a href="#" className="hover:text-white transition-colors">Method</a>
                <a href="#" className="hover:text-white transition-colors">Structure</a>
              </div>

              <button className="relative px-5 py-2 border border-white/25 bg-white/5 text-white/80 font-medium rounded-full text-sm transition-all flex items-center gap-1.5 backdrop-blur-sm shadow-[0_0_12px_rgba(255,255,255,0.08)] hover:shadow-[0_0_24px_rgba(255,255,255,0.18)] hover:border-white/50 hover:text-white">
                Open App
              </button>
        </div>
        </nav>
    )
}

const HeroContent: React.FC = () => {
    return (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none px-4">
            <div className="max-w-4xl w-full text-center space-y-8">
                <div className="inline-block animate-fade-in-up">
                    <span className="py-1 px-3 border border-white/20 rounded-full text-xs font-mono text-white/60 tracking-widest uppercase bg-white/5 backdrop-blur-sm">
                        Scripture-First AI · Extended Reasoning · No Hallucinations
                    </span>
                </div>

                <h1 className="max-w-5xl mx-auto text-4xl md:text-6xl lg:text-7xl font-medium tracking-tight leading-[1.1] text-white">
                  Prepare your sermon in minutes,{" "}
                  <span className="text-white/60">not hours.</span>
                </h1>

                <p className="max-w-2xl mx-auto text-lg md:text-xl text-white/60 font-light leading-relaxed">
                    A research pipeline built for pastors — not a chatbot.<br/>
                    <strong className="text-white/80 font-semibold">Scripture never altered.</strong>
                </p>

                <style>{`
                  @keyframes border-spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                  }
                `}</style>

                <div className="pt-8 pointer-events-auto flex items-center justify-center gap-6">

                  <div className="group relative inline-flex transition-all hover:scale-105 active:scale-95">
                    <div
                      className="relative inline-flex rounded-full overflow-hidden"
                      style={{ padding: '1.5px', boxShadow: '0 0 20px rgba(255,255,255,0.08)' }}
                    >
                      {/* Rotating gradient — sharp border line */}
                      <div
                        aria-hidden="true"
                        style={{
                          position: 'absolute',
                          inset: '-100%',
                          width: '300%',
                          height: '300%',
                          background: 'conic-gradient(from 0deg, transparent 72%, rgba(255,255,255,0.95) 79%, transparent 86%)',
                          animation: 'border-spin 3s linear infinite',
                        }}
                      />
                      {/* Rotating gradient — blurred glow copy */}
                      <div
                        aria-hidden="true"
                        style={{
                          position: 'absolute',
                          inset: '-100%',
                          width: '300%',
                          height: '300%',
                          background: 'conic-gradient(from 0deg, transparent 72%, rgba(255,255,255,0.5) 79%, transparent 86%)',
                          animation: 'border-spin 3s linear infinite',
                          filter: 'blur(10px)',
                        }}
                      />

                      {/* BUTTON */}
                      <Link href="/chat" className="relative inline-flex items-center gap-2 px-8 py-4 bg-black text-white rounded-full font-semibold tracking-wide overflow-hidden transition-all hover:bg-neutral-900">
                        <span className="relative z-10">Generate Your First Study</span>
                        <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
                        <div className="absolute inset-0 bg-white scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300 opacity-5"></div>
                      </Link>
                    </div>
                  </div>

                  <button
                    className="pointer-events-auto text-white/60 hover:text-white/90 transition-colors text-sm flex items-center gap-1"
                    onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
                  >
                    See how it works <ChevronDown className="w-4 h-4" />
                  </button>
                </div>

                <div className="pt-4 flex items-center justify-center gap-6 text-xs text-white/40 font-medium">
                    <span>ESV · NIV · NASB Verified</span>
                    <span>No Fabricated Theology</span>
                    <span>Christ-Centered Always</span>
                </div>
            </div>
        </div>
    );
};

// --- Main App Component ---

export default function App() {
  return (
    <div className="relative w-full h-screen bg-black overflow-hidden selection:bg-white/15 selection:text-white">
      <AntiGravityCanvas />
      <Navigation />
      <HeroContent />
    </div>
  );
}
