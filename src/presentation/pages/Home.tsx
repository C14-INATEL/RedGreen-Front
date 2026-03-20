import { useState } from 'react';
import Table from '@presentation/ui/Table';
import HUD from '@presentation/ui/HUD';
import RankingPanel from '@presentation/ui/RankingPanel';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';

const Home = () => {
  const MockPlayerName = 'Apostador';
  const MockChips = 25000;
  const [RankingOpen, SetRankingOpen] = useState(true);

  return (
    <div className="relative w-screen h-screen overflow-hidden suit-pattern">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, hsl(150 35% 16% / 0.6) 0%, transparent 70%)',
        }}
      />

      <HUD PlayerName={MockPlayerName} Chips={MockChips} />

      <main className="relative flex items-center justify-center h-full px-6 md:px-16 pt-20 pb-10">
        <Table />
      </main>
      <RankingPanel
        IsOpen={RankingOpen}
        OnClose={() => SetRankingOpen(false)}
      />

      {!RankingOpen && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={() => SetRankingOpen(true)}
          className="fixed top-24 right-6 z-40 w-10 h-10 bg-card/60 border-2 border-cassino-gold/30 items-center justify-center text-cassino-gold hover:bg-card/80 transition-colors hidden lg:flex pixel-border"
        >
          <Trophy className="w-5 h-5" />
        </motion.button>
      )}

      <div
        className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none"
        style={{
          background:
            'linear-gradient(to top, hsl(210 40% 2% / 0.4), transparent)',
        }}
      />
    </div>
  );
};

export default Home;
