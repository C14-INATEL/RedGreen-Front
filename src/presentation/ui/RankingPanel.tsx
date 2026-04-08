import { X, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const topPlayers = [
  { Name: 'HighRoller', Chips: 152300 },
  { Name: 'LuckyAce', Chips: 98750 },
  { Name: 'CardShark', Chips: 87200 },
  { Name: 'BluffMaster', Chips: 64500 },
  { Name: 'ChipKing', Chips: 51800 },
];

interface RankingPanelProps {
  IsOpen: boolean;
  OnClose: () => void;
}

const RankingPanel = ({ IsOpen, OnClose }: RankingPanelProps) => {
  const FormatChips = (Chips: number) => {
    if (Chips >= 1000000) return (Chips / 1000000).toFixed(1) + 'k';
    if (Chips >= 1000) return (Chips / 1000).toFixed(1) + 'k';
    return Chips.toLocaleString('pt-BR');
  };

  return (
    <AnimatePresence>
      {IsOpen && (
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 40 }}
          transition={{ duration: 0.3 }}
          className="fixed top-24 right-6 w-72 z-40"
        >
          <div
            className="bg-card/90 backdrop-blur-md pixel-border overflow-hidden"
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

            <div className="divide-y-2 divide-border max-h-96 overflow-y-auto">
              {topPlayers.map((player, i) => (
                <motion.div
                  key={player.Name}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className={`flex items-center justify-between p-3 ${i === 0 ? 'bg-cassino-gold/10' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-sm w-5 text-center font-display ${
                        i === 0 ? 'text-cassino-gold' : 'text-muted-foreground'
                      }`}
                    >
                      {i === 0 ? '♛' : i + 1}
                    </span>
                    <span className="text-foreground text-sm font-medium font-body truncate">
                      {player.Name}
                    </span>
                  </div>
                  <span
                    className={`text-sm font-mono shrink-0 ${
                      i === 0 ? 'text-cassino-gold' : 'text-accent-green'
                    }`}
                  >
                    {FormatChips(player.Chips)}
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
