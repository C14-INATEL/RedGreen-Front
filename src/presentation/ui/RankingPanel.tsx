import { X, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRanking } from '@application/hooks/useRanking';

interface RankingPanelProps {
  IsOpen: boolean;
  OnClose: () => void;
  OnExitComplete?: () => void;
}

const RankingPanel = ({
  IsOpen,
  OnClose,
  OnExitComplete,
}: RankingPanelProps) => {
  const { Players, IsLoading, Error } = useRanking(IsOpen);

  const FormatChips = (Chips: number) => {
    if (Chips >= 1000000) return (Chips / 1000000).toFixed(1) + 'M';
    if (Chips >= 1000) return (Chips / 1000).toFixed(1) + 'k';
    return Chips.toLocaleString('pt-BR');
  };

  return (
    <AnimatePresence onExitComplete={OnExitComplete}>
      {IsOpen && (
        <motion.div
          initial={{ x: 16, scale: 0.98 }}
          animate={{ x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 16, scale: 0.98 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="fixed top-28 right-6 w-72 z-50 transform-gpu"
        >
          <div
            className="relative overflow-hidden bg-card/95 backdrop-blur-md pixel-border"
            style={{ boxShadow: 'var(--shadow-active)' }}
          >
            <div className="flex items-center gap-2 px-4 py-3 border-b-2 border-border">
              <Trophy className="w-5 h-5 text-cassino-gold" />
              <span className="text-foreground font-display font-bold text-sm tracking-wider uppercase flex-1">
                Ranking
              </span>
              <button
                onClick={OnClose}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="divide-y-2 divide-border overflow-hidden">
              {IsLoading && (
                <div className="p-4 text-center text-sm font-body text-muted-foreground">
                  Carregando ranking...
                </div>
              )}

              {!IsLoading && Error && (
                <div className="p-4 text-center text-sm font-body text-muted-foreground">
                  Nao foi possivel carregar o ranking.
                </div>
              )}

              {!IsLoading && !Error && Players.length === 0 && (
                <div className="p-4 text-center text-sm font-body text-muted-foreground">
                  Ranking vazio.
                </div>
              )}

              {!IsLoading &&
                !Error &&
                Players.map((Player, I) => (
                  <motion.div
                    key={`${Player.Position}-${Player.Nickname}`}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: 0.06 + I * 0.03,
                      duration: 0.18,
                      ease: 'easeOut',
                    }}
                    className={`flex items-center justify-between p-3 ${I === 0 ? 'bg-cassino-gold/10' : ''}`}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span
                        className={`text-sm w-5 shrink-0 text-center font-display ${
                          I === 0
                            ? 'text-cassino-gold'
                            : 'text-muted-foreground'
                        }`}
                      >
                        {Player.Position}
                      </span>
                      <span className="text-foreground text-sm font-medium font-body truncate">
                        {Player.Nickname}
                      </span>
                    </div>
                    <span
                      className={`ml-3 text-sm font-mono shrink-0 ${
                        I === 0 ? 'text-cassino-gold' : 'text-accent-green'
                      }`}
                    >
                      {FormatChips(Player.ChipBalance)}
                    </span>
                  </motion.div>
                ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RankingPanel;
