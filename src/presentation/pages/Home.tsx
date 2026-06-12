import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Table from '@ui/Table';
import HUD from '@ui/HUD';
import RankingPanel from '@ui/RankingPanel';
import DailyBonusPanel from '@ui/DailyBonusPanel';
import { motion } from 'framer-motion';
import { Trophy, Gift } from 'lucide-react';
import { useUserProfile } from '@application/hooks/useUserProfile';
import { useUserChips } from '@application/hooks/useUserChips';
import { UseDailyLogin } from '@application/hooks/useDailyLogin';
import { useRanking } from '@application/hooks/useRanking';
import { getToken, removeToken } from '@/infrastructure/Cookies';
import { paths } from '../../paths';

const Home = () => {
  const Navigate = useNavigate();
  const Token = getToken();

  const [IsLoggedIn, SetIsLoggedIn] = useState(!!Token);
  const {
    user,
    nickname,
    isLoading: profileLoading,
  } = useUserProfile(IsLoggedIn);
  const { chips, mutate: MutateChips } = useUserChips(IsLoggedIn);

  const PlayerName =
    nickname ??
    user?.Nickname ??
    (IsLoggedIn && profileLoading
      ? 'Carregando...'
      : IsLoggedIn
        ? 'Jogador Logado'
        : 'Convidado');
  const Chips = chips ?? (IsLoggedIn ? 0 : 10000);

  const [RankingOpen, SetRankingOpen] = useState(false);
  const [CanShowRankingButton, SetCanShowRankingButton] = useState(true);
  const [DailyBonusOpen, SetDailyBonusOpen] = useState(false);
  const {
    Players: RankingPlayers,
    IsLoading: IsRankingLoading,
    Error: RankingError,
  } = useRanking(RankingOpen);
  const HasAutoOpenedDailyBonus = useRef(false);
  const {
    DailyState,
    CanClaimToday,
    IsLoading: IsDailyBonusLoading,
  } = UseDailyLogin(IsLoggedIn);

  useEffect(() => {
    if (!IsLoggedIn) {
      SetDailyBonusOpen(false);
      HasAutoOpenedDailyBonus.current = false;
      return;
    }

    if (
      HasAutoOpenedDailyBonus.current ||
      IsDailyBonusLoading ||
      !DailyState ||
      !CanClaimToday
    ) {
      return;
    }

    HasAutoOpenedDailyBonus.current = true;
    SetDailyBonusOpen(true);
  }, [CanClaimToday, DailyState, IsDailyBonusLoading, IsLoggedIn]);

  const HandleLogin = () => {
    Navigate(paths.login);
  };

  const HandleLogout = () => {
    removeToken();
    SetIsLoggedIn(false);
    Navigate('/');
  };

  const HandleOpenRanking = () => {
    SetCanShowRankingButton(false);
    SetRankingOpen(true);
  };

  const HandleCloseRanking = () => {
    SetRankingOpen(false);
  };

  const RankingRows =
    IsRankingLoading || RankingError || RankingPlayers.length === 0
      ? 1
      : RankingPlayers.length;
  const DailyBonusTop = RankingOpen ? `${10.75 + RankingRows * 3}rem` : '11rem';

  return (
    <div className="relative h-screen w-screen overflow-hidden suit-pattern">
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

      <main className="relative flex h-full items-center justify-center px-6 pb-10 pt-24 md:px-16">
        <Table />

        {IsLoggedIn && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 0 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            transition={{
              duration: 0.22,
              ease: [0.22, 1, 0.36, 1],
            }}
            onClick={() => SetDailyBonusOpen(true)}
            className={`fixed right-6 hidden h-10 w-10 items-center justify-center border-2 border-cassino-gold/30 bg-card/60 text-cassino-gold transition-colors hover:bg-card/80 lg:flex pixel-border shadow-[3px_3px_0px_rgba(0,0,0,0.4)] ${
              RankingOpen ? 'z-40' : 'z-50'
            }`}
            style={{ top: DailyBonusTop }}
          >
            <Gift className="h-4 w-4" />
          </motion.button>
        )}
      </main>

      <RankingPanel
        IsOpen={RankingOpen}
        OnClose={HandleCloseRanking}
        OnExitComplete={() => SetCanShowRankingButton(true)}
      />

      {!RankingOpen && CanShowRankingButton && (
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.1, ease: 'easeOut' }}
          onClick={HandleOpenRanking}
          className="fixed right-4 z-50 flex h-10 w-10 items-center justify-center border-2 border-cassino-gold/30 bg-card/60 text-cassino-gold transition-colors hover:bg-card/80 sm:right-6 pixel-border"
          style={{ top: '7rem' }}
        >
          <Trophy className="h-5 w-5" />
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
        IsLoggedIn={IsLoggedIn}
        OnClose={() => SetDailyBonusOpen(false)}
        MutateChips={MutateChips}
      />
    </div>
  );
};

export default Home;
