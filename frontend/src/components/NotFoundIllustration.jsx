import { motion } from 'framer-motion';

export default function NotFoundIllustration() {
  return (
    <div className="relative w-64 h-64 mx-auto select-none">
      {/* Animated Floating Astronaut */}
      <motion.svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="w-full h-full"
      >
        {/* Glow Shadow beneath astronaut */}
        <ellipse 
          cx="100" 
          cy="180" 
          rx="40" 
          ry="8" 
          fill="var(--color-brand-500)" 
          opacity="0.15" 
        />
        
        {/* Premium HSL Gradients */}
        <defs>
          <linearGradient id="suitGrad" x1="60" y1="50" x2="140" y2="150" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#e2e8f0" />
          </linearGradient>
          <linearGradient id="visorGrad" x1="80" y1="65" x2="120" y2="105" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1e1b4b" />
            <stop offset="50%" stopColor="#312e81" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#4f46e5" />
          </linearGradient>
        </defs>

        {/* Space Dust / Twinkling Stars */}
        <circle cx="30" cy="50" r="2" fill="#ffffff" opacity="0.6" />
        <circle cx="170" cy="80" r="3" fill="#ffffff" opacity="0.4" />
        <circle cx="50" cy="150" r="1.5" fill="#ffffff" opacity="0.8" />
        <circle cx="150" cy="140" r="2" fill="#ffffff" opacity="0.5" />

        {/* Floating Golden Lost Key */}
        <motion.g
          animate={{ rotate: [0, 15, -15, 0], y: [0, 5, -5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          <path 
            d="M145 45 C140 40, 130 40, 125 45 L135 55 M135 55 C140 60, 150 60, 155 55 L165 45" 
            stroke="#f59e0b" 
            strokeWidth="3" 
            strokeLinecap="round" 
            opacity="0.8" 
          />
          <circle 
            cx="150" 
            cy="38" 
            r="5" 
            stroke="#f59e0b" 
            strokeWidth="3" 
            fill="none" 
            opacity="0.8" 
          />
        </motion.g>

        {/* Astronaut Body Suit */}
        <path d="M60 140 C60 120, 140 120, 140 140 L130 170 C130 170, 70 170, 70 170 Z" fill="url(#suitGrad)" />
        <path d="M90 140 H110 V165 H90 Z" fill="#94a3b8" opacity="0.4" />
        <circle cx="100" cy="152" r="4" fill="var(--color-brand-500)" />

        {/* Helmet Base Ring */}
        <ellipse cx="100" cy="122" rx="42" ry="10" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="3" />

        {/* Giant Spherical Helmet */}
        <circle cx="100" cy="90" r="40" fill="url(#suitGrad)" stroke="#cbd5e1" strokeWidth="3" />

        {/* Visor Screen */}
        <ellipse cx="100" cy="92" rx="28" ry="20" fill="url(#visorGrad)" />
        
        {/* Shiny Visor Reflection Sparkle */}
        <path 
          d="M85 82 C95 80, 105 85, 110 92" 
          stroke="#ffffff" 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          opacity="0.6" 
        />
        <circle cx="112" cy="100" r="1.5" fill="#ffffff" opacity="0.8" />

        {/* Red Helmet Antenna */}
        <line x1="100" y1="50" x2="100" y2="35" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
        <circle cx="100" cy="32" r="5" fill="#ef4444" />

      </motion.svg>
    </div>
  );
}
