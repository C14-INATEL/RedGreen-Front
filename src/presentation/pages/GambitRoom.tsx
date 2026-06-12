import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { Gambit } from '../games/Gambit';
import {
  createGambitSession,
  fetchActiveGambitSession,
  fetchGambitTables,
} from '../games/GambitGame/GambitGameplayClient';
import type { GambitApiSession } from '../games/GambitGame/GambitApi';
import type { GambitSession } from '../games/GambitGame/GambitTypes';
import { GambitBetPanel } from '../ui/GambitBetPanel';
import { useUserProfile } from '@application/hooks/useUserProfile';
import { useUserChips } from '@application/hooks/useUserChips';
import { getToken } from '@/infrastructure/Cookies';
import RankingPanel from '@ui/RankingPanel';

type GambitRoomState = {
  GambitTableId?: number;
  CardPrice?: number;
  TableMultiplier?: number;
  MinimumCardsPurchased?: number;
  MaxCardsPurchased?: number;
};

const ToGambitSession = (Api: GambitApiSession): GambitSession => ({
  AccumulatedPoints: Api.AccumulatedPoints ?? 0,
  BurnSlotsAvailable: Api.BurnSlotsAvailable ?? 0,
  BurnsRemaining: Api.BurnsRemaining,
  CardsPurchased: Api.CardsPurchased ?? 0,
  CreatedAt: Api.CreatedAt,
  CurrentGridSnapshot: Api.CurrentGridSnapshot ?? null,
  FirstEventFlip: Api.FirstEventFlip,
  GambitSessionId: Api.GambitSessionId,
  GambitTable: Api.GambitTable ?? null,
  GambitTableId: Api.GambitTableId,
  Grid: Api.Grid ?? null,
  ManualFlipsCount: Api.ManualFlipsCount ?? 0,
  NextEffect: Api.NextEffect ?? null,
  Result: Api.Result ?? null,
  SecondEventFlip: Api.SecondEventFlip,
  Status: Api.Status ?? 'InProgress',
  UpdatedAt: Api.UpdatedAt,
  UserId: Api.UserId,
});

export const GambitRoom = () => {
  const Navigate = useNavigate();
  const Location = useLocation();
  const RouteState = Location.state as GambitRoomState | null;

  const Token = getToken();
  const IsLoggedIn = !!Token;

  const { nickname: Nickname, isLoading: ProfileLoading } =
    useUserProfile(IsLoggedIn);
  const { chips: ChipsFromHook, mutate: MutateChips } =
    useUserChips(IsLoggedIn);

  const PlayerName = Nickname ?? (ProfileLoading ? 'Carregando...' : 'Jogador');
  const Chips = ChipsFromHook ?? (IsLoggedIn ? 0 : 10000);

  const [Session, SetSession] = useState<GambitSession | null>(null);
  const [IsCreatingSession, SetIsCreatingSession] = useState(false);
  const [IsLoadingRoom, SetIsLoadingRoom] = useState(true);
  const [RankingOpen, SetRankingOpen] = useState(false);
  const [CanShowRankingButton, SetCanShowRankingButton] = useState(true);

  const CardPrice = RouteState?.CardPrice ?? 5;
  const TableMultiplier = RouteState?.TableMultiplier ?? 1;
  const MinimumCardsPurchased = RouteState?.MinimumCardsPurchased ?? 1;
  const MaxCardsPurchased = RouteState?.MaxCardsPurchased ?? 20;
  const GambitTableId = RouteState?.GambitTableId ?? null;

  const LoadRoom = useCallback(async () => {
    SetIsLoadingRoom(true);
    try {
      const ActiveSession = await fetchActiveGambitSession();
      if (ActiveSession) {
        SetSession(ToGambitSession(ActiveSession));
      } else {
        await fetchGambitTables();
      }
    } finally {
      SetIsLoadingRoom(false);
    }
  }, []);

  useEffect(() => {
    void LoadRoom();
  }, [LoadRoom]);

  const HandleConfirmBet = async (CardsPurchased: number) => {
    if (GambitTableId == null || IsCreatingSession) return;

    SetIsCreatingSession(true);

    try {
      const Response = await createGambitSession({
        CardsPurchased,
        GambitTableId,
      });

      const RawSession =
        (Response as Record<string, unknown> & { session?: GambitApiSession })
          .session ?? Response;
      SetSession(ToGambitSession(RawSession));
    } catch {
      try {
        const ActiveSession = await fetchActiveGambitSession();
        if (ActiveSession) SetSession(ToGambitSession(ActiveSession));
      } catch {
        SetSession(null);
      }
    } finally {
      SetIsCreatingSession(false);
    }
  };

  const HandleNewGame = () => {
    SetSession(null);
  };

  const HandleOpenRanking = () => {
    SetCanShowRankingButton(false);
    SetRankingOpen(true);
  };

  const HandleCloseRanking = () => {
    SetRankingOpen(false);
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden suit-pattern px-6 py-20">
      <button onClick={() => Navigate(-1)} className="back-button">
        ←
      </button>

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at center, rgba(255,255,255,0.03) 0%, transparent 45%), linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.45) 100%)',
        }}
      />

      {IsLoggedIn && (
        <div className="absolute right-4 top-4 z-50 flex w-[min(calc(100vw-2rem),29rem)] flex-col items-end gap-3 sm:right-6 sm:w-auto">
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 60 }}
              transition={{ duration: 0.3 }}
              className="w-full sm:w-auto"
            >
              <div className="flex w-full items-center justify-between gap-3 bg-card/60 px-3 py-3 backdrop-blur-sm pixel-border sm:w-auto sm:gap-6 sm:px-5">
                <div className="flex items-center gap-2">
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
                  <span className="text-sm font-bold text-foreground font-display">
                    {PlayerName}
                  </span>
                </div>

                <div className="flex items-center gap-3 bg-card/60 px-5 py-3">
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
                    <span className="text-[8px] text-muted-foreground uppercase tracking-wider">
                      Fichas
                    </span>
                    <span className="font-mono text-lg font-bold text-foreground">
                      {Chips.toLocaleString('pt-BR')}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

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
              className="flex h-10 w-10 items-center justify-center border-2 border-cassino-gold/30 bg-card/60 text-cassino-gold transition-colors hover:bg-card/80 pixel-border"
            >
              <Trophy className="h-5 w-5" />
            </motion.button>
          )}
        </div>
      )}

      <div className="relative z-10 flex items-center justify-center">
        <div className="absolute right-full top-0 mr-4 z-20">
          <GambitBetPanel
            IsActive={!IsLoadingRoom}
            CardPrice={CardPrice}
            TableMultiplier={TableMultiplier}
            MinimumCardsPurchased={MinimumCardsPurchased}
            MaxCardsPurchased={MaxCardsPurchased}
            IsLoading={IsCreatingSession}
            OnConfirm={(CardsPurchased) =>
              void HandleConfirmBet(CardsPurchased)
            }
          />
        </div>

        <Gambit
          initialSession={Session ?? undefined}
          onNewGame={HandleNewGame}
          onSessionEnd={() => void MutateChips()}
        />
      </div>
    </main>
  );
};
