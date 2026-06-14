import { motion } from 'framer-motion';

export default function NetworkErrorIllustration() {
  return (
    <div className="relative w-64 h-64 mx-auto select-none">
      {/* Animated Server & Cable SVG */}
      <motion.svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="w-full h-full"
      >
        {/* Glow Shadow beneath */}
        <ellipse 
          cx="100" 
          cy="180" 
          rx="45" 
          ry="7" 
          fill="#ef4444" 
          opacity="0.1" 
        />

        {/* Server Block */}
        <rect x="50" y="70" width="100" height="70" rx="16" fill="#1e293b" stroke="#475569" strokeWidth="4" />
        <rect x="50" y="70" width="100" height="24" rx="16" fill="#334155" opacity="0.4" />
        
        {/* Server Slots / Lines */}
        <line x1="65" y1="82" x2="85" y2="82" stroke="#64748b" strokeWidth="4" strokeLinecap="round" />
        <line x1="65" y1="105" x2="115" y2="105" stroke="#64748b" strokeWidth="4" strokeLinecap="round" />
        <line x1="65" y1="120" x2="95" y2="120" stroke="#64748b" strokeWidth="4" strokeLinecap="round" />

        {/* Pulsing Red Warning node */}
        <motion.circle 
          cx="140" 
          cy="82" 
          r="4" 
          fill="#ef4444"
          animate={{ opacity: [1, 0.2, 1], scale: [1, 1.3, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        
        {/* Disconnected plug swing */}
        <motion.g
          animate={{ rotate: [0, 6, -6, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* Socket Plug */}
          <path d="M100 140 V155" stroke="#475569" strokeWidth="4" strokeLinecap="round" />
          <rect x="94" y="152" width="12" height="12" rx="3" fill="#64748b" />
          <line x1="97" y1="164" x2="97" y2="168" stroke="#ef4444" strokeWidth="2" />
          <line x1="103" y1="164" x2="103" y2="168" stroke="#ef4444" strokeWidth="2" />
        </motion.g>

        {/* Signal Waves (fading offline red) */}
        <motion.g opacity="0.6">
          <motion.path 
            d="M75 50 C90 40, 110 40, 125 50" 
            stroke="#ef4444" 
            strokeWidth="3" 
            strokeLinecap="round"
            animate={{ opacity: [0.2, 1, 0.2] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0 }}
          />
          <motion.path 
            d="M60 35 C85 20, 115 20, 140 35" 
            stroke="#ef4444" 
            strokeWidth="3" 
            strokeLinecap="round"
            animate={{ opacity: [0.2, 1, 0.2] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
          />
        </motion.g>

      </motion.svg>
    </div>
  );
}
