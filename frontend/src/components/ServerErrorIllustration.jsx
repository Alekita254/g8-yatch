import React from 'react';
import { motion } from 'framer-motion';

export default function ServerErrorIllustration() {
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
        <ellipse cx="100" cy="180" rx="35" ry="6" fill="#ef4444" opacity="0.15" />

        {/* Broken System Gear */}
        <motion.g
          animate={{ rotate: [0, 45, 90, 135, 180, 225, 270, 315, 360] }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          style={{ originX: "100px", originY: "100px" }}
        >
          <circle cx="100" cy="100" r="30" fill="#1e293b" stroke="#ef4444" strokeWidth="4" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
            <g key={i} transform={`rotate(${angle} 100 100)`}>
              <rect x="94" y="60" width="12" height="15" rx="3" fill="#1e293b" stroke="#ef4444" strokeWidth="4" />
            </g>
          ))}
          <circle cx="100" cy="100" r="10" fill="#ef4444" opacity="0.2" />
        </motion.g>

        {/* Floating Sparks */}
        <motion.circle 
          cx="60" cy="80" r="3" fill="#ef4444"
          animate={{ scale: [1, 1.8, 1], opacity: [0.2, 1, 0.2] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
        />
        <motion.circle 
          cx="140" cy="120" r="2.5" fill="#f59e0b"
          animate={{ scale: [1, 2, 1], opacity: [0.2, 1, 0.2] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: 0.5 }}
        />
        <motion.circle 
          cx="135" cy="70" r="3" fill="#ef4444"
          animate={{ scale: [1, 1.5, 1], opacity: [0.2, 1, 0.2] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
        />

      </motion.svg>
    </div>
  );
}
