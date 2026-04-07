import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Table from '@ui/Table';
import HUD from '@ui/HUD';
import RankingPanel from '@ui/RankingPanel';
import DailyBonusPanel from '@ui/DailyBonusPanel';
import { motion } from 'framer-motion';
import { Trophy, Gift } from 'lucide-react';
import { useUserProfile } from '@application/hooks/useUserProfile';
import { useUserChips } from '@application/hooks/useUserChips';

const Home = () => {
  const Navigate = useNavigate();

  const Token = localStorage.getItem('token');
  const storedUserValue = localStorage.getItem('user');
  let StoredUser = null;

  if (storedUserValue) {
    try {
      StoredUser = JSON.parse(storedUserValue);
    } catch {
      StoredUser = null;
    }
  }

  const [IsLoggedIn, SetIsLoggedIn] = useState(!!Token);

  const { nickname, isLoading: profileLoading } = useUserProfile(IsLoggedIn);
  const { chips, mutate: MutateChips } = useUserChips(IsLoggedIn);

  const localNickname = StoredUser?.Nickname || StoredUser?.nickname;
  const localChips = StoredUser?.ChipBalance ?? StoredUser?.chips;

  const PlayerName =
    nickname ??
    localNickname ??
    (IsLoggedIn && profileLoading ? 'Carregando...' : 'Convidado');
  const Chips = chips ?? localChips ?? (IsLoggedIn ? 0 : 10000);

  const [RankingOpen, SetRankingOpen] = useState(false);
  const [DailyBonusOpen, SetDailyBonusOpen] = useState(false);

  const HandleLogin = () => {
    Navigate('/Login');
  };

  const HandleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    SetIsLoggedIn(false);
    Navigate('/');
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden suit-pattern">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, hsl(150 35% 16% / 0.6) 0%, transparent 70%)',
        }}
      />

      <HUD
        IsLoggedIn={IsLoggedIn}
        PlayerName={PlayerName}
        Chips={Chips}
        OnLogin={HandleLogin}
        OnLogout={HandleLogout}
      />

      <main className="relative flex items-center justify-center h-full px-6 md:px-16 pt-20 pb-10">
        <Table />

        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={() => SetDailyBonusOpen(true)}
          className="fixed right-6 z-50 w-10 h-10 bg-card/60 border-2 border-cassino-gold/30 items-center justify-center text-cassino-gold hover:bg-card/80 transition-colors hidden lg:flex pixel-border shadow-[3px_3px_0px_rgba(0,0,0,0.4)]"
          style={{ top: RankingOpen ? 'calc(6rem + 320px)' : '10rem' }}
        >
          <Gift className="w-4 h-4" />
        </motion.button>
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
          className="fixed right-6 z-50 w-10 h-10 bg-card/60 border-2 border-cassino-gold/30 items-center justify-center text-cassino-gold hover:bg-card/80 transition-colors hidden lg:flex pixel-border"
          style={{ top: '6rem' }}
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

      <DailyBonusPanel
        IsOpen={DailyBonusOpen}
        OnClose={() => SetDailyBonusOpen(false)}
        MutateChips={MutateChips}
      />
    </div>
  );
};

export default Home;
