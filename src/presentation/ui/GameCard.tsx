import { motion } from 'framer-motion';
import { useState } from 'react';
import type { ReactNode } from 'react';

interface GameCardProps {
  title: string;
  subtitle: string;
  icon: ReactNode;
  delay?: number;
  onClick?: () => void;
}

const GameCard = ({
  title,
  subtitle,
  icon,
  delay = 0,
  onClick,
}: GameCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className="group flex flex-col items-center gap-4 cursor-pointer"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <h2 className="font-display text-sm font-bold tracking-widest uppercase text-cassino-red">
        {title}
      </h2>

      <motion.div
        className="text-accent-green"
        animate={isHovered ? { y: [0, -4, 0] } : { y: 0 }}
        transition={{
          duration: 1,
          repeat: isHovered ? Infinity : 0,
          ease: 'easeInOut',
        }}
      >
        {icon}
      </motion.div>

      <button className="text-[8px] text-muted-foreground font-body uppercase tracking-widest hover:text-foreground transition-colors duration-200 border-2 border-border px-4 py-2 hover:border-cassino-gold hover:text-cassino-gold pixel-border active:translate-x-[2px] active:translate-y-[2px]">
        {subtitle}
      </button>
    </motion.div>
  );
};

export default GameCard;
