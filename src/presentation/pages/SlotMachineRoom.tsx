import { useNavigate } from 'react-router-dom';
import { SlotMachine } from '../games/SlotMachine';
import { useUserProfile } from '@application/hooks/useUserProfile';
import { useUserChips } from '@application/hooks/useUserChips';

type StoredUserSnapshot = {
  ChipBalance?: number;
  chips?: number;
  Nickname?: string;
  nickname?: string;
};

export const SlotMachineRoom = () => {
  const navigate = useNavigate();

  const Token =
    localStorage.getItem('token') ?? localStorage.getItem('authToken');

  const StoredUserValue = localStorage.getItem('user');
  let StoredUser: StoredUserSnapshot | null = null;

  if (StoredUserValue) {
    try {
      StoredUser = JSON.parse(StoredUserValue) as StoredUserSnapshot;
    } catch {
      StoredUser = null;
    }
  }

  const IsLoggedIn = !!Token;

  const { nickname, isLoading: profileLoading } = useUserProfile(IsLoggedIn);
  const { chips } = useUserChips(IsLoggedIn);

  const LocalNickname = StoredUser?.Nickname || StoredUser?.nickname;
  const LocalChips = StoredUser?.ChipBalance ?? StoredUser?.chips;

  const PlayerName =
    nickname ??
    LocalNickname ??
    (IsLoggedIn && profileLoading
      ? 'Carregando...'
      : IsLoggedIn
        ? 'Jogador Logado'
        : 'Convidado');

  const Chips = chips ?? LocalChips ?? (IsLoggedIn ? 0 : 10000);

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden suit-pattern">
      <button
        onClick={() => navigate('/')}
        className="back-button"
      >
        ← Voltar
      </button>

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at center, rgba(255,255,255,0.03) 0%, transparent 45%), linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.45) 100%)',
        }}
      />

      <div className="absolute top-6 right-6 z-20 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-12 h-12 bg-card pixel-border-gold relative flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 16 16" fill="none">
              <rect x="5" y="2" width="6" height="6" fill="hsl(var(--cassino-gold))" />
              <rect x="4" y="8" width="8" height="4" fill="hsl(var(--cassino-gold))" />
              <rect x="5" y="12" width="2" height="2" fill="hsl(var(--cassino-gold))" />
              <rect x="9" y="12" width="2" height="2" fill="hsl(var(--cassino-gold))" />
            </svg>

            <div className="absolute -bottom-0.5 -left-0.5 w-3 h-3 bg-accent-green border-2 border-background" />
          </div>

          <span className="text-sm font-bold text-foreground font-display">
            {PlayerName}
          </span>
        </div>

        <div className="flex items-center gap-3 bg-card/60 pixel-border-gold px-5 py-3 backdrop-blur-sm">
          <svg width="28" height="28" viewBox="0 0 16 16" fill="none">
            <rect x="4" y="2" width="8" height="2" fill="hsl(var(--cassino-gold))" />
            <rect x="2" y="4" width="2" height="2" fill="hsl(var(--cassino-gold))" />
            <rect x="12" y="4" width="2" height="2" fill="hsl(var(--cassino-gold))" />
            <rect x="2" y="6" width="12" height="4" fill="hsl(var(--cassino-gold))" />
            <rect x="6" y="4" width="4" height="8" fill="hsl(var(--cassino-gold) / 0.7)" />
            <rect x="2" y="10" width="2" height="2" fill="hsl(var(--cassino-gold))" />
            <rect x="12" y="10" width="2" height="2" fill="hsl(var(--cassino-gold))" />
            <rect x="4" y="12" width="8" height="2" fill="hsl(var(--cassino-gold))" />
            <rect x="7" y="5" width="2" height="6" fill="hsl(var(--background) / 0.5)" />
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

      <div className="relative z-10 flex items-center justify-center">
        <SlotMachine />
      </div>
    </main>
  );
};