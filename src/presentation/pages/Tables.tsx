import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fetchActiveSlotSession } from '../games/SlotMachineGame/slotMachineApi';
import { paths } from '@/paths';
import { useUserChips } from '@/application/hooks/useUserChips';

import CassinoLogo from '../ui/CassinoLogo';

type SlotMachineFromApi = {
  SlotMachineId: number;
  Name: string;
  Description: string;
  MinimumSpinValue: number;
  MinimumChipsRequired: number;
  MinimumRerollValue: number;
  MaxRerolls: number;
  Active: boolean;
};

const GetTableStyle = () => {
  return {
    border: 'border-border',
    text: 'text-foreground',
    hoverBg: '',
  };
};

export const SlotMachineTablesRoom = () => {
  const [ShowSessionWarning, SetShowSessionWarning] = useState(false);

  const [PendingMachineName, SetPendingMachineName] = useState('');

  const Navigate = useNavigate();

  const Token = localStorage.getItem('authToken');

  const IsLoggedIn = !!Token;

  const { chips: UserChips, isLoading } = useUserChips(IsLoggedIn);

  const [ApiTables, SetApiTables] = useState<SlotMachineFromApi[]>([]);

  const [IsLoadingTables, SetIsLoadingTables] = useState(true);

  useEffect(() => {
    const FetchTables = async () => {
      try {
        const Response = await fetch('http://localhost:3000/slot/machine');

        const Data = await Response.json();

        SetApiTables(Data);
      } catch (Error) {
        console.error(Error);
      } finally {
        SetIsLoadingTables(false);
      }
    };

    FetchTables();
  }, []);

  const Tables = ApiTables.filter((Table) => Table.Active).sort(
    (a, b) => a.MinimumChipsRequired - b.MinimumChipsRequired
  );

  return (
    <main className="relative flex min-h-screen flex-col items-center overflow-y-auto suit-pattern">
      <div className="absolute top-6 left-1/2 z-20 -translate-x-1/2">
        <CassinoLogo />
      </div>

      <button onClick={() => Navigate('/')} className="back-button">
        ←
      </button>

      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at center, rgba(255,255,255,0.03) 0%, transparent 45%), linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.45) 100%)',
        }}
      />

      <h1 className="z-10 mt-32 mb-10 font-display text-3xl font-bold text-foreground">
        Escolha sua mesa
      </h1>

      <div className="z-10 pb-16 grid w-full max-w-7xl grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-6 px-4">
        {Tables.map((TableItem) => {
          const Style = GetTableStyle();

          const Bet = TableItem.MinimumSpinValue;

          const MinChips = TableItem.MinimumChipsRequired;

          const SlotMachineId = TableItem.SlotMachineId;

          const IsLocked =
            !IsLoggedIn ||
            isLoading ||
            IsLoadingTables ||
            UserChips === undefined ||
            UserChips < MinChips;

          return (
            <motion.div
              key={SlotMachineId}
              whileHover={{
                scale: IsLocked ? 1 : 1.05,
              }}
              className={`relative w-52 pixel-border p-4 text-center transition-all
                ${
                  IsLocked
                    ? 'cursor-not-allowed opacity-40'
                    : `cursor-pointer bg-card/60 backdrop-blur-sm ${Style.border} ${Style.hoverBg}`
                }
              `}
              onClick={async () => {
                if (IsLocked) return;

                try {
                  const ActiveSession = await fetchActiveSlotSession();

                  if (
                    ActiveSession &&
                    ActiveSession.SlotMachineId !== SlotMachineId
                  ) {
                    const CurrentMachine = Tables.find(
                      (Table) =>
                        Table.SlotMachineId === ActiveSession.SlotMachineId
                    );

                    SetPendingMachineName(
                      CurrentMachine?.Name ?? 'Mesa desconhecida'
                    );

                    SetShowSessionWarning(true);

                    return;
                  }

                  Navigate(paths.slotmachineroom, {
                    state: {
                      bet: Bet,
                      slotMachineId: SlotMachineId,
                    },
                  });
                } catch (Error) {
                  console.error(Error);
                }
              }}
            >
              <h2
                className={`mb-2 min-h-[56px] font-bold leading-tight ${Style.text} break-words line-clamp-2`}
              >
                {TableItem.Name}
              </h2>

              <p className={`text-sm ${Style.text}`}>
                Aposta: {Bet.toLocaleString('pt-BR')}
              </p>

              <p className={`mt-2 text-xs ${Style.text}`}>
                Fichas necessárias: {MinChips.toLocaleString('pt-BR')}
              </p>

              {IsLocked && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                  <span className="text-xs font-bold text-red-400">
                    BLOQUEADO
                  </span>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
      {ShowSessionWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="w-full max-w-md border-[4px] border-yellow-400 bg-[#1a1a1a] p-6 text-white shadow-[8px_8px_0px_#000]"
            style={{
              imageRendering: 'pixelated',
            }}
          >
            <h2
              className="mb-6 text-center text-[12px] uppercase text-yellow-300"
              style={{
                fontFamily: '"Press Start 2P", monospace',
              }}
            >
              Jogo em andamento!
            </h2>

            <p
              className="whitespace-pre-line text-center text-[9px] leading-6 uppercase text-white/90"
              style={{
                fontFamily: '"Press Start 2P", monospace',
              }}
            >
              {`VOCÊ AINDA POSSUI FICHAS NA MESA:\n\n${PendingMachineName}\n\nREALIZE O CASH OUT ANTES DE ENTRAR EM OUTRA MESA.`}
            </p>

            <button
              onClick={() => SetShowSessionWarning(false)}
              className="mt-6 w-full border-2 border-yellow-400 bg-yellow-500/20 py-3 text-[10px] uppercase text-yellow-200 transition-all hover:bg-yellow-500/30"
              style={{
                fontFamily: '"Press Start 2P", monospace',
              }}
            >
              Entendi
            </button>
          </motion.div>
        </div>
      )}
    </main>
  );
};
