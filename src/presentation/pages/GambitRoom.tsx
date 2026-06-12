import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { readEnv } from '@infrastructure/env';
import { paths } from '../../paths';
import { Gambit } from '../games/Gambit';
import {
  createGambitSession,
  fetchActiveGambitSession,
  fetchGambitTables,
  type GambitGameplaySource,
} from '../games/GambitGame/gambitGameplayClient';
import type { GambitApiSession } from '../games/GambitGame/gambitApi';
import type { GambitTable } from '../games/GambitGame/gambitTypes';

const DEFAULT_GAMBIT_CARDS_PURCHASED = 5;

const readDefaultTableId = () => {
  const value = Number(readEnv('VITE_GAMBIT_DEFAULT_TABLE_ID'));

  return Number.isInteger(value) && value > 0 ? value : null;
};

const getAuthToken = () => {
  try {
    return window.localStorage.getItem('token');
  } catch {
    return null;
  }
};

const clearAuthToken = () => {
  try {
    window.localStorage.removeItem('token');
  } catch {
    return;
  }
};

const isAxiosStatus = (error: unknown, status: number) =>
  axios.isAxiosError(error) && error.response?.status === status;

const getRoomErrorMessage = (error: unknown) => {
  if (isAxiosStatus(error, 401)) {
    clearAuthToken();
    return 'Sessão expirada. Faça login novamente.';
  }

  if (isAxiosStatus(error, 404)) {
    return 'Rotas de gameplay do Gambit não encontradas. Verifique se o backend está na branch feat/gambit-game-logic.';
  }

  return 'Não foi possível carregar o Gambit agora.';
};

const chooseDefaultTable = (tables: GambitTable[]) => {
  const defaultTableId = readDefaultTableId();

  if (defaultTableId != null) {
    const configuredTable = tables.find(
      (table) => Number(table.GambitTableId) === defaultTableId
    );

    if (configuredTable) {
      return configuredTable;
    }
  }

  return tables.find((table) => table.Active !== false) ?? tables[0] ?? null;
};

export const GambitRoom = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<GambitApiSession | null>(null);
  const [gameplaySource, setGameplaySource] =
    useState<GambitGameplaySource>('backend');
  const [tables, setTables] = useState<GambitTable[]>([]);
  const [selectedTableId, setSelectedTableId] = useState<number | null>(null);
  const [cardsPurchased, setCardsPurchased] = useState(
    DEFAULT_GAMBIT_CARDS_PURCHASED
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasToken, setHasToken] = useState(() => Boolean(getAuthToken()));

  const selectedTable = useMemo(
    () =>
      selectedTableId == null
        ? null
        : (tables.find(
            (table) => Number(table.GambitTableId) === selectedTableId
          ) ?? null),
    [selectedTableId, tables]
  );

  const loadRoom = async () => {
    const token = getAuthToken();

    setHasToken(Boolean(token));
    setErrorMessage(null);

    if (!token) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const activeSessionResult = await fetchActiveGambitSession();

      setGameplaySource(activeSessionResult.source);

      if (activeSessionResult.session) {
        setSession(activeSessionResult.session);
        setTables([]);
        setIsLoading(false);
        return;
      }

      const gambitTables = await fetchGambitTables();
      const defaultTable = chooseDefaultTable(gambitTables);

      setSession(null);
      setTables(gambitTables);
      setSelectedTableId(
        defaultTable ? Number(defaultTable.GambitTableId) : null
      );

      if (defaultTable) {
        setCardsPurchased(
          Math.max(
            defaultTable.MinimumCardsPurchased ?? 1,
            Math.min(
              DEFAULT_GAMBIT_CARDS_PURCHASED,
              defaultTable.MaxCardsPurchased
            )
          )
        );
      }
    } catch (error) {
      setErrorMessage(getRoomErrorMessage(error));
      setSession(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadRoom();
  }, []);

  const handleCreateSession = async () => {
    if (selectedTableId == null) {
      setErrorMessage('Nenhuma mesa Gambit disponível para iniciar partida.');
      return;
    }

    setIsCreatingSession(true);
    setErrorMessage(null);

    try {
      await createGambitSession({
        CardsPurchased: cardsPurchased,
        GambitTableId: selectedTableId,
      });

      const activeSessionResult = await fetchActiveGambitSession();

      setGameplaySource(activeSessionResult.source);
      setSession(activeSessionResult.session);
    } catch (error) {
      setErrorMessage(getRoomErrorMessage(error));
    } finally {
      setIsCreatingSession(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden suit-pattern px-6 py-20">
      <button
        className="back-button"
        onClick={() => navigate(paths.home)}
        type="button"
      >
        ←
      </button>

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at center, rgba(255,255,255,0.03) 0%, transparent 45%), linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.45) 100%)',
        }}
      />

      <div className="relative z-10 flex w-full max-w-4xl items-center justify-center">
        {!hasToken ? (
          <div className="w-[min(94vw,520px)] bg-card px-6 py-5 text-center pixel-border-gold">
            <p className="font-display text-xs font-bold uppercase tracking-widest text-cassino-gold">
              Faça login para jogar Gambit
            </p>
            <button
              className="mt-4 bg-cassino-gold px-4 py-3 font-display text-xs font-bold uppercase tracking-widest text-background pixel-border"
              onClick={() => navigate(paths.login)}
              type="button"
            >
              Entrar
            </button>
          </div>
        ) : isLoading ? (
          <div className="w-[min(94vw,520px)] bg-card px-6 py-5 text-center pixel-border-gold">
            <p className="font-display text-xs font-bold uppercase tracking-widest text-cassino-gold">
              Carregando Gambit...
            </p>
          </div>
        ) : session ? (
          <Gambit gameplaySource={gameplaySource} initialSession={session} />
        ) : (
          <div className="w-[min(94vw,520px)] bg-card px-6 py-5 pixel-border-gold">
            <h1 className="font-display text-sm font-bold uppercase tracking-widest text-cassino-gold">
              Iniciar partida Gambit
            </h1>

            <div className="mt-5 grid gap-4">
              <label className="grid gap-2">
                <span className="font-display text-[10px] font-bold uppercase tracking-widest text-white/60">
                  Mesa
                </span>
                <select
                  className="bg-background px-3 py-3 font-mono text-sm text-foreground pixel-border"
                  disabled={!tables.length || isCreatingSession}
                  onChange={(event) =>
                    setSelectedTableId(Number(event.target.value))
                  }
                  value={selectedTableId ?? ''}
                >
                  {tables.map((table) => (
                    <option
                      key={String(table.GambitTableId)}
                      value={Number(table.GambitTableId)}
                    >
                      {table.Name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-2">
                <span className="font-display text-[10px] font-bold uppercase tracking-widest text-white/60">
                  Cards Purchased
                </span>
                <input
                  className="bg-background px-3 py-3 font-mono text-sm text-foreground pixel-border"
                  disabled={isCreatingSession}
                  max={selectedTable?.MaxCardsPurchased ?? 25}
                  min={selectedTable?.MinimumCardsPurchased ?? 1}
                  onChange={(event) =>
                    setCardsPurchased(Number(event.target.value))
                  }
                  type="number"
                  value={cardsPurchased}
                />
              </label>

              {errorMessage ? (
                <p className="font-mono text-xs font-bold uppercase text-red-200">
                  {errorMessage}
                </p>
              ) : null}

              <button
                className="bg-cassino-gold px-4 py-3 font-display text-xs font-bold uppercase tracking-widest text-background pixel-border disabled:cursor-not-allowed disabled:opacity-50"
                disabled={
                  isCreatingSession || selectedTableId == null || !tables.length
                }
                onClick={handleCreateSession}
                type="button"
              >
                {isCreatingSession ? 'Iniciando...' : 'Iniciar'}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};
