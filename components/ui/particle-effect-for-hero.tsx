"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronDown, BookOpen, LogOut, LayoutDashboard, Zap } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import UpgradeModal from '@/components/ui/upgrade-modal';

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

export const AntiGravityCanvas: React.FC<{ disableMouseInteraction?: boolean }> = ({ disableMouseInteraction = true }) => {
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
        color: Math.random() > 0.88 ? '#D6A85F' : '#ffffff',
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

      // Mouse Repulsion Force
      if (!disableMouseInteraction && mouse.isActive) {
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < MOUSE_RADIUS) {
          const forceDirectionX = dx / distance;
          const forceDirectionY = dy / distance;
          const force = (MOUSE_RADIUS - distance) / MOUSE_RADIUS;
          const repulsion = force * REPULSION_STRENGTH;
          p.vx -= forceDirectionX * repulsion * 5;
          p.vy -= forceDirectionY * repulsion * 5;
        }
      }

      // Gentle float oscillation
      p.angle += 0.008;
      p.vy += Math.sin(p.angle) * 0.018;

      // Spring Force (Return to Origin)
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
      const velocity = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      const opacity = Math.min(0.3 + velocity * 0.1, 1);

      if (p.color !== '#ffffff') {
        // Gold particle: soft glow halo behind it
        const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3.5);
        glow.addColorStop(0, `rgba(214, 168, 95, ${opacity * 0.45})`);
        glow.addColorStop(1, 'rgba(214, 168, 95, 0)');
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 3.5, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color === '#ffffff'
        ? `rgba(255, 255, 255, ${opacity})`
        : `rgba(214, 168, 95, ${opacity})`;
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

  // Mouse Handlers — only wired up when mouse interaction is enabled
  useEffect(() => {
    if (disableMouseInteraction) return;

    const handleMouseMove = (e: MouseEvent) => {
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

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [disableMouseInteraction]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-0 overflow-hidden bg-black"
    >
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
};

export const Navigation: React.FC<{ showNavLinks?: boolean }> = ({ showNavLinks = true }) => {
    const [firstName, setFirstName] = useState<string | null>(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [isPremium, setIsPremium] = useState(false);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const supabaseRef = useRef(createClient());

    useEffect(() => {
        const supabase = supabaseRef.current;

        supabase.auth.getUser().then(async ({ data: { user } }) => {
            if (user) {
                const fullName: string | undefined = user.user_metadata?.full_name;
                setFirstName(fullName ? fullName.split(' ')[0] : user.email?.split('@')[0] ?? null);
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('subscription_status')
                    .eq('id', user.id)
                    .single();
                setIsPremium(
                    profile?.subscription_status === 'active' ||
                    profile?.subscription_status === 'canceling'
                );
            }
            setAuthLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                const fullName: string | undefined = session.user.user_metadata?.full_name;
                setFirstName(fullName ? fullName.split(' ')[0] : session.user.email?.split('@')[0] ?? null);
            } else {
                setFirstName(null);
                setIsPremium(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSignOut = async () => {
        await supabaseRef.current.auth.signOut();
        setDropdownOpen(false);
        window.location.href = '/';
    };

    return (
        <>
        <nav className="absolute top-6 left-0 right-0 z-20 flex justify-center px-6">
            <div className="flex items-center bg-[#111111] border border-white/10 rounded-full px-2 py-1.5 backdrop-blur-md shadow-[0_4px_32px_rgba(0,0,0,0.4)]">
                {/* Logo */}
                <Link href={firstName ? "/chat" : "/"} className="flex items-center gap-2 pl-2 pr-4 border-r border-white/10 mr-1 hover:opacity-90 transition-opacity">
                    <div
                        className="w-6 h-6 rounded-sm flex items-center justify-center shrink-0"
                        style={{
                            background: 'linear-gradient(135deg, #D6A85F 0%, #a87c3a 100%)',
                            boxShadow: '0 0 8px rgba(214,168,95,0.55), 0 0 2px rgba(214,168,95,0.8)',
                        }}
                    >
                        <BookOpen className="w-3.5 h-3.5 text-black" strokeWidth={2.5} />
                    </div>
                    <span className="font-semibold text-sm" style={{ color: '#D6A85F', textShadow: '0 0 12px rgba(214,168,95,0.45)' }}>ScripturePath</span>
                </Link>

                {/* Nav links */}
                {showNavLinks && !firstName && (
                <div className="hidden md:flex items-center">
                    <button onClick={() => document.getElementById('theological-integrity')?.scrollIntoView({ behavior: 'smooth' })} className="px-4 py-1.5 text-sm font-medium text-white/60 hover:text-white transition-colors rounded-full hover:bg-white/5">Trust</button>
                    <button onClick={() => document.getElementById('whats-inside')?.scrollIntoView({ behavior: 'smooth' })} className="px-4 py-1.5 text-sm font-medium text-white/60 hover:text-white transition-colors rounded-full hover:bg-white/5">Method</button>
                    <button onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })} className="px-4 py-1.5 text-sm font-medium text-white/60 hover:text-white transition-colors rounded-full hover:bg-white/5">Structure</button>
                </div>
                )}

                {/* CTA Button */}
                {authLoading ? (
                    <div className="ml-1 w-20 h-8 rounded-full bg-white/10 animate-pulse" />
                ) : firstName ? (
                    <div className="flex items-center gap-2 ml-1">
                        {!isPremium && (
                            <button
                                onClick={() => setShowUpgradeModal(true)}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all hover:opacity-90 active:scale-95"
                                style={{
                                    background: 'linear-gradient(135deg, #D6A85F 0%, #a87c3a 100%)',
                                    color: '#000',
                                    boxShadow: '0 0 12px rgba(214,168,95,0.4)',
                                }}
                            >
                                <Zap className="w-3.5 h-3.5" />
                                Upgrade to Premium
                            </button>
                        )}
                        <div ref={dropdownRef} className="relative">
                            <button
                                onClick={() => setDropdownOpen(o => !o)}
                                className="px-5 py-2 bg-white text-black font-semibold rounded-full text-sm transition-all flex items-center gap-1.5 hover:bg-white/90 active:scale-95"
                            >
                                {firstName}
                                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {dropdownOpen && (
                                <div className="absolute right-0 mt-2 w-44 bg-[#111111] border border-white/10 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.6)] overflow-hidden">
                                    <Link
                                        href="/dashboard"
                                        onClick={() => setDropdownOpen(false)}
                                        className="w-full flex items-center gap-2 px-4 py-3 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                                    >
                                        <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
                                    </Link>
                                    <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />
                                    <button
                                        onClick={handleSignOut}
                                        className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-white/5 transition-colors"
                                    >
                                        <LogOut className="w-3.5 h-3.5" /> Sign out
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <a href="/signin" className="ml-1 px-5 py-2 bg-white text-black font-semibold rounded-full text-sm transition-all flex items-center gap-1.5 hover:bg-white/90 active:scale-95">
                        Sign in <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                )}
            </div>
        </nav>
        <UpgradeModal open={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />
        </>
    )
}

const CYCLING_WORDS = ['pastors', 'teachers', 'scholars', 'students'];

const HeroContent: React.FC = () => {
    const [wordIndex, setWordIndex] = useState(0);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const id = setInterval(() => {
            setWordIndex(i => (i + 1) % CYCLING_WORDS.length);
        }, 2000);
        return () => clearInterval(id);
    }, []);

    useEffect(() => {
        const supabase = createClient();
        supabase.auth.getUser().then(({ data: { user } }) => {
            setIsLoggedIn(!!user);
        });
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setIsLoggedIn(!!session?.user);
        });
        return () => subscription.unsubscribe();
    }, []);

    return (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none px-4">
            <div className="max-w-4xl w-full text-center space-y-8">
                <div className="inline-block animate-fade-in-up">
                    <span className="whitespace-nowrap py-1 px-3 border border-white/20 rounded-full text-[9px] sm:text-xs font-mono tracking-normal sm:tracking-widest uppercase bg-white/5 backdrop-blur-sm" style={{ color: '#D6A85F' }}>
                        Scripture-First AI · Extended Reasoning · No Hallucinations
                    </span>
                </div>

                <h1 className="max-w-5xl mx-auto text-4xl md:text-6xl lg:text-7xl font-medium tracking-tight leading-[1.1] text-white">
                  Prepare your study in minutes,{" "}
                  <span className="text-white/60">not hours.</span>
                </h1>

                <p className="max-w-2xl mx-auto text-lg md:text-xl text-white/60 font-light leading-relaxed">
                    A research pipeline built for{" "}
                    <span
                        key={wordIndex}
                        className="inline-block text-white font-semibold animate-fade-cycle"
                    >
                        {CYCLING_WORDS[wordIndex]}
                    </span>
                    {" "}— not a chatbot.<br/>
                    <strong className="text-white/80 font-semibold">Scripture never altered.</strong>
                </p>

                <style>{`
                  @keyframes fade-cycle {
                    0%   { opacity: 0; transform: translateY(6px); }
                    15%  { opacity: 1; transform: translateY(0); }
                    85%  { opacity: 1; transform: translateY(0); }
                    100% { opacity: 0; transform: translateY(-6px); }
                  }
                  .animate-fade-cycle {
                    animation: fade-cycle 2s ease-in-out forwards;
                  }
                  @keyframes border-spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                  }
                  @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50%       { transform: translateY(-5px); }
                  }
                  .animate-float {
                    animation: float 3s ease-in-out infinite;
                  }
                `}</style>

                <div className="pt-8 pointer-events-auto flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">

                  <div className="group relative inline-flex flex-col items-center gap-2 transition-all hover:scale-105 active:scale-95">
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
                      <Link href={isLoggedIn ? "/chat" : "/signin"} className="relative inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-black text-white rounded-full font-semibold tracking-wide overflow-hidden transition-all hover:bg-neutral-900">
                        <span className="relative z-10">Generate Your First Study</span>
                        <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
                        <div className="absolute inset-0 bg-white scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300 opacity-5"></div>
                      </Link>
                    </div>
                    <span className="text-xs text-white/35 font-normal tracking-wide">Free · No credit card required</span>
                  </div>

                  <button
                    className="pointer-events-auto transition-colors text-sm flex items-center gap-1 hover:opacity-70 animate-float"
                    style={{ color: '#D6A85F' }}
                    onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
                  >
                    See how it works <ChevronDown className="w-4 h-4" />
                  </button>
                </div>

                <div className="pt-4 flex items-center justify-center gap-6 text-xs font-medium" style={{ color: '#E8C992' }}>
                    <span>Always KJV Verified Scripture</span>
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
