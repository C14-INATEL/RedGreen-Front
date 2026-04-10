import { motion } from 'framer-motion';
import CassinoLogo from '@ui/CassinoLogo';
import { LogIn, LogOut } from 'lucide-react';
import type { HUDProps } from '@domain/types';

const HUD = ({
  IsLoggedIn,
  PlayerName,
  Chips,
  OnLogin,
  OnLogout,
}: HUDProps) => {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 h-20 flex items-center justify-between px-6 bg-card/80 backdrop-blur-sm pixel-border"
      style={{ boxShadow: '0 4px 0px rgba(0,0,0,0.8)' }}
    >
      {IsLoggedIn ? (
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-card pixel-border-gold relative flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 16 16" fill="none">
              <rect
                x="5"
                y="2"
                width="6"
                height="6"
                fill="hsl(var(--cassino-gold))"
              />
              <rect
                x="4"
                y="8"
                width="8"
                height="4"
                fill="hsl(var(--cassino-gold))"
              />
              <rect
                x="5"
                y="12"
                width="2"
                height="2"
                fill="hsl(var(--cassino-gold))"
              />
              <rect
                x="9"
                y="12"
                width="2"
                height="2"
                fill="hsl(var(--cassino-gold))"
              />
            </svg>
            <div className="absolute -bottom-0.5 -left-0.5 w-3 h-3 bg-accent-green border-2 border-background" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-foreground font-display">
              {PlayerName}
            </span>
          </div>
        </div>
      ) : (
        <motion.button
          onClick={OnLogin}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-4 py-2 bg-card/60 border-2 border-cassino-gold/30 text-cassino-gold hover:bg-card/80 transition-colors pixel-border"
        >
          <LogIn className="w-5 h-5" />
          <span className="font-display font-bold text-sm">Entrar</span>
        </motion.button>
      )}

      <CassinoLogo />

      {IsLoggedIn && Chips != null && (
        <div className="flex items-center gap-3 bg-card/60 pixel-border-gold px-5 py-3">
          <svg width="28" height="28" viewBox="0 0 16 16" fill="none">
            <rect
              x="4"
              y="2"
              width="8"
              height="2"
              fill="hsl(var(--cassino-gold))"
            />
            <rect
              x="2"
              y="4"
              width="2"
              height="2"
              fill="hsl(var(--cassino-gold))"
            />
            <rect
              x="12"
              y="4"
              width="2"
              height="2"
              fill="hsl(var(--cassino-gold))"
            />
            <rect
              x="2"
              y="6"
              width="12"
              height="4"
              fill="hsl(var(--cassino-gold))"
            />
            <rect
              x="6"
              y="4"
              width="4"
              height="8"
              fill="hsl(var(--cassino-gold) / 0.7)"
            />
            <rect
              x="2"
              y="10"
              width="2"
              height="2"
              fill="hsl(var(--cassino-gold))"
            />
            <rect
              x="12"
              y="10"
              width="2"
              height="2"
              fill="hsl(var(--cassino-gold))"
            />
            <rect
              x="4"
              y="12"
              width="8"
              height="2"
              fill="hsl(var(--cassino-gold))"
            />
            <rect
              x="7"
              y="5"
              width="2"
              height="6"
              fill="hsl(var(--background) / 0.5)"
            />
          </svg>
          <div className="flex flex-col items-end">
            <span className="text-[8px] text-muted-foreground font-body uppercase tracking-wider">
              Fichas
            </span>
            <span className="font-mono text-lg font-bold text-foreground">
              {Chips.toLocaleString('pt-BR')}
            </span>
          </div>
        </div>
      )}

      {IsLoggedIn && (
        <motion.button
          onClick={OnLogout}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-2 text-muted-foreground hover:text-foreground transition-colors"
          title="Sair"
        >
          <LogOut className="w-5 h-5" />
        </motion.button>
      )}
    </motion.header>
  );
};

export default HUD;
