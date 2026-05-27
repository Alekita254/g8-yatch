import React from 'react';
import { motion } from 'framer-motion';

export default function AccessDeniedIllustration() {
  return (
    <div className="relative w-64 h-64 mx-auto select-none">
      <motion.svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="w-full h-full"
      >
        {/* Glow Shadow */}
        <ellipse cx="100" cy="180" rx="35" ry="6" fill="#f59e0b" opacity="0.15" />

        {/* Shield Frame */}
        <path 
          d="M100 30 L150 50 V110 C150 145, 125 165, 100 175 C75 165, 50 145, 50 110 V50 L100 30 Z" 
          fill="#1e293b" 
          stroke="#f59e0b" 
          strokeWidth="4" 
          strokeLinejoin="round" 
        />
        
        {/* Golden Padlock */}
        <motion.g
          animate={{ x: [0, -2, 2, -2, 2, 0] }}
          transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
        >
          {/* Shackle */}
          <path d="M85 95 V80 C85 70, 115 70, 115 80 V95" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" />
          {/* Lock Body */}
          <rect x="75" y="95" width="50" height="36" rx="8" fill="#f59e0b" />
          <circle cx="100" cy="110" r="4" fill="#1e293b" />
          <path d="M100 114 V122" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
        </motion.g>

      </motion.svg>
    </div>
  );
}
