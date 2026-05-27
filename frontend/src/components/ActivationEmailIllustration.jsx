import React from 'react';
import { motion } from 'framer-motion';

export default function ActivationEmailIllustration() {
  return (
    <div className="relative w-64 h-64 mx-auto select-none">
      <motion.svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="w-full h-full"
      >
        {/* Glow Shadow beneath envelope */}
        <ellipse cx="100" cy="180" rx="35" ry="6" fill="#10b981" opacity="0.15" />

        {/* Floating Mail Envelope */}
        <motion.g
          animate={{ rotate: [0, 4, -4, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* Glowing Green Checkmark Wings */}
          <motion.path 
            d="M50 100 L30 80 M50 100 L80 60" 
            stroke="#10b981" 
            strokeWidth="5" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            animate={{ rotateY: [0, 35, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.path 
            d="M150 100 L170 80 M150 100 L120 60" 
            stroke="#10b981" 
            strokeWidth="5" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            animate={{ rotateY: [0, -35, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Envelope Body */}
          <rect x="50" y="80" width="100" height="64" rx="8" fill="#1e293b" stroke="#cbd5e1" strokeWidth="4" />
          {/* Flap Open */}
          <path d="M50 82 L100 115 L150 82" stroke="#cbd5e1" strokeWidth="4" strokeLinejoin="round" />
        </motion.g>

        {/* Small floating glowing green email particles */}
        <motion.circle 
          cx="45" cy="60" r="3.5" fill="#10b981"
          animate={{ scale: [1, 1.8, 1], opacity: [0.2, 1, 0.2] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        <motion.circle 
          cx="155" cy="150" r="2.5" fill="#10b981"
          animate={{ scale: [1, 2, 1], opacity: [0.2, 1, 0.2] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: 0.5 }}
        />

      </motion.svg>
    </div>
  );
}
