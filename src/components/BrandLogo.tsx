import React from 'react';
import { motion } from 'motion/react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  variant?: 'primary' | 'secondary';
  className?: string;
  showText?: boolean;
}

export default function BrandLogo({ 
  size = 'md', 
  variant = 'primary', 
  className = '',
  showText = false
}: BrandLogoProps) {
  
  // Unique ID for SVG definitions to prevent interference across instances
  const reactId = React.useId();
  const safeId = reactId.replace(/:/g, '');
  
  // Definitions names
  const shieldGradId = `shieldGrad-${safeId}`;
  const magicGlowId = `magicGlow-${safeId}`;
  const glowFilterId = `glowFilter-${safeId}`;
  const purplePinkGradId = `purplePinkGrad-${safeId}`;
  const magicSparkGradId = `magicSparkGrad-${safeId}`;
  const magicGlowSecondaryId = `magicGlowSecondary-${safeId}`;
  const glassGradId = `glassGrad-${safeId}`;
  const goldGradId = `goldGrad-${safeId}`;

  // Dimensions mapping
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-14 h-14',
    lg: 'w-24 h-24',
    xl: 'w-36 h-36',
    '2xl': 'w-48 h-48',
  };

  const textClasses = {
    sm: 'text-[10px] tracking-wider',
    md: 'text-xs tracking-widest',
    lg: 'text-base tracking-[0.15em] font-bold',
    xl: 'text-xl tracking-[0.2em] font-extrabold',
    '2xl': 'text-2xl tracking-[0.25em] font-black',
  };

  const subtextClasses = {
    sm: 'text-[7px]',
    md: 'text-[8px]',
    lg: 'text-[10px]',
    xl: 'text-xs',
    '2xl': 'text-sm',
  };

  return (
    <div className="flex flex-col items-center justify-center text-center">
      {/* Inject custom highly-polished animations specifically for these SVGs */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes custom-float-${safeId} {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-6px) rotate(1.5deg); }
        }
        @keyframes custom-float-reverse-${safeId} {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(5px) rotate(-1.5deg); }
        }
        @keyframes custom-pulse-glow-${safeId} {
          0%, 100% { opacity: 0.25; filter: drop-shadow(0 0 5px rgba(16,185,129,0.3)); }
          50% { opacity: 0.65; filter: drop-shadow(0 0 20px rgba(16,185,129,0.75)); }
        }
        @keyframes custom-spin-slow-${safeId} {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes custom-spin-reverse-${safeId} {
          0% { transform: rotate(360deg); }
          100% { transform: rotate(0deg); }
        }
        @keyframes custom-shimmer-${safeId} {
          0% { stroke-dashoffset: 400; }
          100% { stroke-dashoffset: 0; }
        }
        .anim-float-${safeId} {
          animation: custom-float-${safeId} 6s ease-in-out infinite;
        }
        .anim-float-reverse-${safeId} {
          animation: custom-float-reverse-${safeId} 7s ease-in-out infinite;
        }
        .anim-spin-slow-${safeId} {
          animation: custom-spin-slow-${safeId} 25s linear infinite;
        }
        .anim-spin-reverse-${safeId} {
          animation: custom-spin-reverse-${safeId} 30s linear infinite;
        }
        .anim-shimmer-${safeId} {
          stroke-dasharray: 120 180;
          animation: custom-shimmer-${safeId} 12s linear infinite;
        }
      `}} />

      <motion.div
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.98 }}
        className={`relative inline-flex items-center justify-center cursor-pointer ${className}`}
      >
        {/* Glow backdrop behind the entire logo container */}
        <div className={`absolute inset-0 rounded-full blur-2xl transition-opacity duration-500 opacity-30 group-hover:opacity-60 bg-gradient-to-tr ${
          variant === 'primary' 
            ? 'from-emerald-500/40 via-teal-500/40 to-cyan-400/40' 
            : 'from-purple-500/40 via-fuchsia-500/40 to-pink-500/40'
        }`} />

        <div className={`${sizeClasses[size]} relative flex items-center justify-center overflow-visible`}>
          {variant === 'primary' ? (
            /* --- PRIMARY LOGO: THE SOCIETY GUARDIAN SHIELD (Saving Society with Magic) --- */
            <svg 
              viewBox="0 0 120 120" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg" 
              className={`w-full h-full filter drop-shadow-[0_10px_25px_rgba(16,185,129,0.2)] anim-float-${safeId}`}
            >
              <defs>
                {/* Emerald-Teal-Cyan Metallic Shield Gradient */}
                <linearGradient id={shieldGradId} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10B981" /> {/* Emerald-500 */}
                  <stop offset="35%" stopColor="#14B8A6" /> {/* Teal-500 */}
                  <stop offset="70%" stopColor="#06B6D4" /> {/* Cyan-500 */}
                  <stop offset="100%" stopColor="#3B82F6" /> {/* Blue-500 */}
                </linearGradient>

                {/* Sparkling Gold Magic Accent Gradient */}
                <linearGradient id={goldGradId} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#F59E0B" /> {/* Amber */}
                  <stop offset="50%" stopColor="#FBBF24" /> {/* Yellow-400 */}
                  <stop offset="100%" stopColor="#10B981" />
                </linearGradient>

                {/* Soft ambient inner shield glass gradient */}
                <linearGradient id={glassGradId} x1="20%" y1="0%" x2="80%" y2="100%">
                  <stop offset="0%" stopColor="#0B1329" stopOpacity="0.95" />
                  <stop offset="100%" stopColor="#020617" stopOpacity="0.9" />
                </linearGradient>

                {/* Premium High-Fidelity Glow Filter */}
                <filter id={glowFilterId} x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="4.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Decorative Tech Ring Behind the Shield */}
              <circle 
                cx="60" 
                cy="60" 
                r="52" 
                stroke="url(#shieldGrad)" 
                strokeWidth="1" 
                strokeOpacity="0.15" 
                strokeDasharray="6 8"
                className={`anim-spin-slow-${safeId}`}
                style={{ transformOrigin: 'center' }}
              />
              <circle 
                cx="60" 
                cy="60" 
                r="48" 
                stroke="url(#shieldGrad)" 
                strokeWidth="0.75" 
                strokeOpacity="0.25"
                className={`anim-spin-reverse-${safeId}`}
                style={{ transformOrigin: 'center' }}
              />

              {/* Outer Glowing Crest Shield Border */}
              <path 
                d="M60 10 C83 10 104 20 104 34 C104 70 80 102 60 112 C40 102 16 70 16 34 C16 20 37 10 60 10 Z" 
                fill="url(#glassGrad)"
                stroke="url(#shieldGrad)" 
                strokeWidth="3.5" 
                strokeLinecap="round"
                strokeLinejoin="round" 
              />

              {/* Shimmering Animated Inner Border representing protection field */}
              <path 
                d="M60 15 C80 15 98 24 98 36 C98 67 76 96 60 105 C44 96 22 67 22 36 C22 24 40 15 60 15 Z" 
                stroke="url(#shieldGrad)" 
                strokeWidth="1.2" 
                strokeOpacity="0.6"
                className={`anim-shimmer-${safeId}`}
              />

              {/* TWO STYLIZED CITIZENS HOLDING HANDS (Forming an architectural infinite bond of society protection) */}
              {/* Left Citizen (Teal / Community Support) */}
              <g className="opacity-95">
                {/* Left Citizen Body */}
                <path 
                  d="M40 76 C40 62 48 57 54 57" 
                  stroke="#06B6D4" 
                  strokeWidth="4" 
                  strokeLinecap="round" 
                />
                {/* Left Citizen Arm reaching to support the magic crystal */}
                <path 
                  d="M42 58 C46 52 50 51 53 52" 
                  stroke="#06B6D4" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                />
                {/* Left Citizen Head */}
                <circle cx="39" cy="41" r="5" fill="#06B6D4" />
                {/* Halo over Left Head representing dedication */}
                <path d="M33 33 C36 30 42 30 45 33" stroke="#22D3EE" strokeWidth="1" fill="none" strokeLinecap="round" />
              </g>

              {/* Right Citizen (Emerald / Magical Salvation) */}
              <g className="opacity-95">
                {/* Right Citizen Body */}
                <path 
                  d="M80 76 C80 62 72 57 66 57" 
                  stroke="#10B981" 
                  strokeWidth="4" 
                  strokeLinecap="round" 
                />
                {/* Right Citizen Arm reaching to support the magic crystal */}
                <path 
                  d="M78 58 C74 52 70 51 67 52" 
                  stroke="#10B981" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                />
                {/* Right Citizen Head */}
                <circle cx="81" cy="41" r="5" fill="#10B981" />
                {/* Halo over Right Head */}
                <path d="M75 33 C78 30 84 30 87 33" stroke="#34D399" strokeWidth="1" fill="none" strokeLinecap="round" />
              </g>

              {/* CENTRAL MAGIC CRYSTAL CORE (Together We Do Magic) */}
              {/* Magic Diamond Core with Glowing Filter */}
              <g filter={`url(#${glowFilterId})`}>
                {/* Inner Bright Diamond */}
                <path 
                  d="M60 40 L65 52 L77 57 L65 62 L60 74 L55 62 L43 57 L55 52 Z" 
                  fill="url(#goldGrad)" 
                />
                
                {/* Magical Light Spark Overlay */}
                <path 
                  d="M60 48 L62 57 L71 57 L62 57 L60 66 L58 57 L49 57 L58 57 Z" 
                  fill="#FFFFFF" 
                  opacity="0.9"
                />
              </g>

              {/* Sparkling Magic Dust and Society Anchors */}
              <circle cx="34" cy="52" r="1.5" fill="#38BDF8" className="animate-pulse" />
              <circle cx="86" cy="52" r="1.5" fill="#34D399" className="animate-pulse" />
              <circle cx="60" cy="24" r="2.5" fill="#FBBF24" filter={`url(#${glowFilterId})`} />
              <circle cx="60" cy="94" r="3" fill="#10B981" className="animate-ping" style={{ transformOrigin: '60px 94px' }} />
              <circle cx="60" cy="94" r="1.5" fill="#34D399" />
              
              {/* Sparkling light flares */}
              <path d="M30 28 L34 28 M32 26 L32 30" stroke="#67E8F9" strokeWidth="0.75" />
              <path d="M88 28 L92 28 M90 26 L90 30" stroke="#FBBF24" strokeWidth="0.75" />
            </svg>
          ) : (
            /* --- SECONDARY LOGO: THE SYNERGY SPARK & MAGIC BEACON (Together We Do Magic) --- */
            <svg 
              viewBox="0 0 120 120" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg" 
              className={`w-full h-full filter drop-shadow-[0_10px_25px_rgba(236,72,153,0.2)] anim-float-reverse-${safeId}`}
            >
              <defs>
                {/* Deep Neon Magic Purple-Fuchsia-Pink Gradient */}
                <linearGradient id={purplePinkGradId} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#A855F7" /> {/* Purple-500 */}
                  <stop offset="50%" stopColor="#D946EF" /> {/* Fuchsia-500 */}
                  <stop offset="100%" stopColor="#EC4899" /> {/* Pink-500 */}
                </linearGradient>

                {/* Hyper-glowing Sparkle Core Gradient */}
                <linearGradient id={magicSparkGradId} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="40%" stopColor="#F472B6" /> {/* Pink-400 */}
                  <stop offset="100%" stopColor="#8B5CF6" /> {/* Purple-500 */}
                </linearGradient>

                {/* Dynamic Secondary Glow Filter */}
                <filter id={magicGlowSecondaryId} x="-40%" y="-40%" width="180%" height="180%">
                  <feGaussianBlur stdDeviation="5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Cosmic Constellation Network Lines (Representing interconnected society) */}
              <g opacity="0.4" stroke="url(#purplePinkGradId)" strokeWidth="0.8">
                <line x1="60" y1="20" x2="30" y2="50" strokeDasharray="3 3" />
                <line x1="60" y1="20" x2="90" y2="50" strokeDasharray="3 3" />
                <line x1="30" y1="50" x2="60" y2="100" strokeDasharray="3 3" />
                <line x1="90" y1="50" x2="60" y2="100" strokeDasharray="3 3" />
                <line x1="30" y1="50" x2="90" y2="50" strokeOpacity="0.2" />
                <line x1="60" y1="20" x2="60" y2="100" strokeOpacity="0.2" />
              </g>

              {/* Interlocking Sacred Circles of Unity (Society & Synergy) */}
              {/* Left Circle (Fuchsia - Magical Energy) */}
              <circle 
                cx="48" 
                cy="60" 
                r="30" 
                stroke="url(#purplePinkGradId)" 
                strokeWidth="3.5" 
                fill="#020617" 
                fillOpacity="0.9" 
                className="transition-all duration-500 group-hover:stroke-fuchsia-400"
              />
              
              {/* Right Circle (Cyan - Collective Actions) */}
              <circle 
                cx="72" 
                cy="60" 
                r="30" 
                stroke="#06B6D4" 
                strokeWidth="3.5" 
                fill="#020617" 
                fillOpacity="0.45" 
                style={{ mixBlendMode: 'screen' }}
                className="transition-all duration-500 group-hover:stroke-cyan-300"
              />

              {/* Interlocking dotted border to represent citizens assembling */}
              <circle 
                cx="60" 
                cy="60" 
                r="42" 
                stroke="#F472B6" 
                strokeWidth="1" 
                strokeOpacity="0.4" 
                strokeDasharray="4 6"
                className={`anim-spin-slow-${safeId}`}
                style={{ transformOrigin: 'center' }}
              />

              {/* Dynamic Outer Orbital Ring representing shielding the society */}
              <path 
                d="M24 45 C32 25 88 25 96 45" 
                stroke="url(#purplePinkGradId)" 
                strokeWidth="1.5" 
                strokeLinecap="round" 
                strokeOpacity="0.7"
              />
              <path 
                d="M96 75 C88 95 32 95 24 75" 
                stroke="#06B6D4" 
                strokeWidth="1.5" 
                strokeLinecap="round" 
                strokeOpacity="0.7"
              />

              {/* THE SHINING BEACON OF HARMONY (The Absolute Magic Core) */}
              <g filter={`url(#${magicGlowSecondaryId})`}>
                {/* 8-Pointed Divine Spark */}
                {/* Main Vertical/Horizontal Cross */}
                <path 
                  d="M60 28 L64 48 L84 52 L64 56 L60 76 L56 56 L36 52 L56 48 Z" 
                  fill="url(#magicSparkGradId)" 
                />
                {/* Diagonal Cross */}
                <path 
                  d="M60 52 L63 43 L72 43 L65 50 L72 57 L63 54 L60 62 L57 54 L48 57 L55 50 L48 43 L57 43 Z" 
                  fill="#FFFFFF" 
                  opacity="0.85"
                />
              </g>

              {/* Orbiting Stardust and Civic Nodes */}
              <circle cx="30" cy="50" r="3" fill="#D946EF" filter={`url(#${magicGlowSecondaryId})`} />
              <circle cx="90" cy="50" r="3" fill="#06B6D4" filter={`url(#${magicGlowSecondaryId})`} />
              <circle cx="60" cy="20" r="2.5" fill="#A855F7" className="animate-pulse" />
              <circle cx="60" cy="100" r="2.5" fill="#EC4899" className="animate-pulse" />
              
              {/* Floating micro particles */}
              <circle cx="45" cy="35" r="1.2" fill="#FFFFFF" className="animate-pulse" />
              <circle cx="75" cy="85" r="1.2" fill="#FFFFFF" className="animate-pulse" />
              <circle cx="40" cy="80" r="1" fill="#F472B6" />
              <circle cx="80" cy="35" r="1" fill="#67E8F9" />
            </svg>
          )}
        </div>
      </motion.div>

      {showText && (
        <div className="flex flex-col items-center gap-1.5 mt-2">
          {/* Main Brand Title */}
          <span className={`font-display font-black tracking-[0.18em] uppercase text-transparent bg-clip-text bg-gradient-to-r ${
            variant === 'primary' 
              ? 'from-emerald-400 via-teal-300 to-cyan-400' 
              : 'from-purple-400 via-fuchsia-300 to-pink-400'
            } ${textClasses[size]}`}
          >
            {variant === 'primary' ? 'SOCIETY GUARDIAN' : 'MAGIC SYNERGY'}
          </span>
          
          {/* Poetic Slogan under each logo to fully realize "Together we can do magic and save our society" */}
          <span className={`font-mono uppercase text-slate-500/80 tracking-widest ${subtextClasses[size]}`}>
            {variant === 'primary' 
              ? '• Guard and Protect Our Citizens •' 
              : '• Together We Create Magic •'
            }
          </span>
        </div>
      )}
    </div>
  );
}
