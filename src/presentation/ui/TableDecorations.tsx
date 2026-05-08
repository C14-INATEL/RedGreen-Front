import { motion } from 'framer-motion';

const TableDecorations = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">

      {/* Ficha vermelha grande - canto superior esquerdo */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.8 }}
        className="absolute top-6 left-8 md:top-8 md:left-12"
      >
        <svg width="40" height="40" viewBox="0 0 40 40" className="opacity-20">
          <circle cx="20" cy="20" r="16" fill="hsl(0 70% 42%)" stroke="hsl(0 60% 60% / 0.4)" strokeWidth="2" />
          <circle cx="20" cy="20" r="10" stroke="hsl(0 0% 100% / 0.3)" strokeWidth="1" fill="none" />
          <circle cx="20" cy="20" r="3" fill="hsl(0 0% 100% / 0.4)" />
        </svg>
      </motion.div>

      {/* Ficha azul pequena - canto superior esquerdo */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.8 }}
        className="absolute top-12 left-16 md:top-14 md:left-24"
      >
        <svg width="32" height="32" viewBox="0 0 40 40" className="opacity-15 rotate-12">
          <circle cx="20" cy="20" r="16" fill="hsl(220 70% 35%)" stroke="hsl(220 60% 60% / 0.35)" strokeWidth="2" />
          <circle cx="20" cy="20" r="10" stroke="hsl(0 0% 100% / 0.25)" strokeWidth="1" fill="none" />
          <circle cx="20" cy="20" r="3" fill="hsl(0 0% 100% / 0.3)" />
        </svg>
      </motion.div>

      {/* Ficha vermelha média - canto superior direito */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.8 }}
        className="absolute top-4 right-10 md:top-6 md:right-16"
      >
        <svg width="36" height="36" viewBox="0 0 40 40" className="opacity-15 -rotate-6">
          <circle cx="20" cy="20" r="16" fill="hsl(0 70% 42%)" stroke="hsl(0 60% 60% / 0.4)" strokeWidth="2" />
          <circle cx="20" cy="20" r="10" stroke="hsl(0 0% 100% / 0.3)" strokeWidth="1" fill="none" />
          <circle cx="20" cy="20" r="3" fill="hsl(0 0% 100% / 0.4)" />
        </svg>
      </motion.div>

      {/* Ficha azul pequena - canto superior direito */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.8 }}
        className="absolute top-10 right-6 md:top-12 md:right-10"
      >
        <svg width="28" height="28" viewBox="0 0 40 40" className="opacity-12 rotate-20">
          <circle cx="20" cy="20" r="16" fill="hsl(220 70% 35%)" stroke="hsl(220 60% 60% / 0.35)" strokeWidth="2" />
          <circle cx="20" cy="20" r="10" stroke="hsl(0 0% 100% / 0.25)" strokeWidth="1" fill="none" />
          <circle cx="20" cy="20" r="3" fill="hsl(0 0% 100% / 0.3)" />
        </svg>
      </motion.div>

      {/* Carta A de copas - canto inferior esquerdo */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.0, duration: 0.8 }}
        className="absolute bottom-10 left-6 md:bottom-12 md:left-10"
      >
        <svg width="36" height="48" viewBox="0 0 36 48" className="opacity-10 rotate-[-15deg]">
          <rect x="2" y="2" width="32" height="44" rx="4" fill="hsl(0 0% 98% / 0.08)" stroke="hsl(0 0% 100% / 0.2)" strokeWidth="1.5" />
          <text x="8" y="16" fontSize="10" fill="hsl(0 0% 100% / 0.3)" fontFamily="serif">A</text>
          <text x="10" y="32" fontSize="14" fill="hsl(0 70% 50% / 0.4)" fontFamily="serif">♥</text>
        </svg>
      </motion.div>

      {/* Carta K de espadas - canto inferior esquerdo */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1, duration: 0.8 }}
        className="absolute bottom-14 left-14 md:bottom-16 md:left-20"
      >
        <svg width="30" height="42" viewBox="0 0 36 48" className="opacity-8 rotate-[8deg]">
          <rect x="2" y="2" width="32" height="44" rx="4" fill="hsl(0 0% 98% / 0.06)" stroke="hsl(0 0% 100% / 0.15)" strokeWidth="1.5" />
          <text x="8" y="16" fontSize="10" fill="hsl(0 0% 100% / 0.25)" fontFamily="serif">K</text>
          <text x="10" y="32" fontSize="14" fill="hsl(0 0% 100% / 0.25)" fontFamily="serif">♠</text>
        </svg>
      </motion.div>

      {/* Dado 5 - canto inferior direito */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="absolute bottom-8 right-8 md:bottom-10 md:right-14"
      >
        <svg width="28" height="28" viewBox="0 0 28 28" className="opacity-12 rotate-[12deg]">
          <rect x="2" y="2" width="24" height="24" rx="4" fill="hsl(0 0% 96% / 0.1)" stroke="hsl(0 0% 100% / 0.2)" strokeWidth="1.5" />
          <circle cx="9" cy="9" r="2" fill="hsl(0 0% 20% / 0.4)" />
          <circle cx="19" cy="9" r="2" fill="hsl(0 0% 20% / 0.4)" />
          <circle cx="14" cy="14" r="2" fill="hsl(0 0% 20% / 0.4)" />
          <circle cx="9" cy="19" r="2" fill="hsl(0 0% 20% / 0.4)" />
          <circle cx="19" cy="19" r="2" fill="hsl(0 0% 20% / 0.4)" />
        </svg>
      </motion.div>

      {/* Dado 2 - canto inferior direito */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3, duration: 0.8 }}
        className="absolute bottom-16 right-4 md:bottom-18 md:right-8"
      >
        <svg width="22" height="22" viewBox="0 0 28 28" className="opacity-8 rotate-[-20deg]">
          <rect x="2" y="2" width="24" height="24" rx="4" fill="hsl(0 0% 96% / 0.08)" stroke="hsl(0 0% 100% / 0.15)" strokeWidth="1.5" />
          <circle cx="9" cy="9" r="2" fill="hsl(0 0% 20% / 0.35)" />
          <circle cx="19" cy="19" r="2" fill="hsl(0 0% 20% / 0.35)" />
        </svg>
      </motion.div>

    </div>
  );
};

export default TableDecorations;