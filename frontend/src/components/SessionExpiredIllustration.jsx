import React from 'react';
import { motion } from 'framer-motion';

export default function SessionExpiredIllustration() {
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
        <ellipse cx="100" cy="180" rx="35" ry="6" fill="var(--color-brand-500)" opacity="0.15" />

        {/* Hourglass Frame */}
        <path d="M70 40 H130 L120 95 H80 L70 40 Z" fill="#1e293b" stroke="#6366f1" strokeWidth="4" />
        <path d="M80 105 H120 L130 160 H70 L80 105 Z" fill="#1e293b" stroke="#6366f1" strokeWidth="4" />
        <line x1="65" y1="40" x2="135" y2="40" stroke="#cbd5e1" strokeWidth="4" strokeLinecap="round" />
        <line x1="65" y1="160" x2="135" y2="160" stroke="#cbd5e1" strokeWidth="4" strokeLinecap="round" />

        {/* Top Sand shrinking */}
        <motion.path 
          d="M85 85 C90 95, 110 95, 115 85 L118 70 H82 L85 85 Z" 
          fill="#818cf8" 
          animate={{ scaleY: [1, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
          style={{ originY: 1 }}
        />

        {/* Bottom Sand piling up */}
        <motion.path 
          d="M75 158 C85 145, 115 145, 125 158 Z" 
          fill="#818cf8"
          animate={{ scaleY: [0.1, 1] }}
          transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
          style={{ originY: 1 }}
        />

        {/* Sand Stream */}
        <motion.line 
          x1="100" y1="95" x2="100" y2="148" 
          stroke="#818cf8" strokeWidth="3" strokeDasharray="4 4"
          animate={{ strokeDashoffset: [0, -10] }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />

      </motion.svg>
    </div>
  );
}
