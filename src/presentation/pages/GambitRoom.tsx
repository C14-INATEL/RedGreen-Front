import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Gambit } from '../games/Gambit';
import {
  createGambitSession,
  fetchActiveGambitSession,
  fetchGambitTables,
} from '../games/GambitGame/gambitGameplayClient';
import type { GambitApiSession } from '../games/GambitGame/gambitApi';
import type { GambitTable } from '../games/GambitGame/gambitTypes';
import { GambitBetPanel } from '../ui/GambitBetPanel';

type GambitRoomState = {
  GambitTableId?: number;
  CardPrice?: number;
  TableMultiplier?: number;
  MinimumCardsPurchased?: number;
  MaxCardsPurchased?: number;
};

export const GambitRoom = () => {
  const Navigate = useNavigate();
  const [IsActive, SetIsActive] = useState(true);
  const [Session, SetSession] = useState<GambitApiSession | null>(null);
  const [Tables, SetTables] = useState<GambitTable[]>([]);
  const [IsCreatingSession, SetIsCreatingSession] = useState(false);

  const Location = useLocation();
  const RouteState = Location.state as GambitRoomState | null;
  const FallbackTable = useMemo(
    () => Tables.find((Table) => Table.Active !== false) ?? Tables[0] ?? null,
    [Tables]
  );
  const SelectedTable = useMemo(
    () =>
      RouteState?.GambitTableId == null
        ? FallbackTable
        : (Tables.find(
            (Table) => Number(Table.GambitTableId) === RouteState.GambitTableId
          ) ?? FallbackTable),
    [FallbackTable, RouteState?.GambitTableId, Tables]
  );
  const GambitTableId =
    RouteState?.GambitTableId ??
    (SelectedTable ? Number(SelectedTable.GambitTableId) : null);

  const LoadTables = useCallback(async () => {
    SetTables(await fetchGambitTables());
  }, []);

  const LoadRoom = useCallback(async () => {
    try {
      const ActiveSession = await fetchActiveGambitSession();

      if (ActiveSession?.Status === 'InProgress') {
        SetSession(ActiveSession);
        return;
      }

      SetSession((CurrentSession) => CurrentSession ?? null);
      await LoadTables();
    } catch {
      SetSession((CurrentSession) => CurrentSession ?? null);
    }
  }, [LoadTables]);

  useEffect(() => {
    void LoadRoom();
  }, [LoadRoom]);

  const HandleConfirmBet = async (CardsPurchased: number) => {
    if (GambitTableId == null || IsCreatingSession) {
      return;
    }

    SetIsCreatingSession(true);

    try {
      await createGambitSession({
        CardsPurchased,
        GambitTableId,
      });

      const ActiveSession = await fetchActiveGambitSession();

      SetSession(ActiveSession?.Status === 'InProgress' ? ActiveSession : null);
    } catch {
      SetSession(null);
    } finally {
      SetIsCreatingSession(false);
    }
  };

  const HandleNewGame = async () => {
    SetSession(null);

    if (!Tables.length) {
      try {
        await LoadTables();
      } catch {
        return;
      }
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden suit-pattern px-6 py-20">
      <button onClick={() => Navigate('/')} className="back-button">
        ←
      </button>

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at center, rgba(255,255,255,0.03) 0%, transparent 45%), linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.45) 100%)',
        }}
      />

      <div className="relative z-10 flex items-center justify-center">
        <div className="absolute right-full mr-4 top-0 z-20">
          <GambitBetPanel
            IsActive={IsActive}
            CardPrice={RouteState?.CardPrice ?? SelectedTable?.CardPrice ?? 5}
            TableMultiplier={
              RouteState?.TableMultiplier ?? SelectedTable?.TableMultiplier ?? 1
            }
            MinimumCardsPurchased={
              RouteState?.MinimumCardsPurchased ??
              SelectedTable?.MinimumCardsPurchased ??
              1
            }
            MaxCardsPurchased={
              RouteState?.MaxCardsPurchased ??
              SelectedTable?.MaxCardsPurchased ??
              20
            }
            OnConfirm={(CardsPurchased) => {
              void HandleConfirmBet(CardsPurchased);
            }}
          />
        </div>

        <div
          onClick={() => {
            if (!IsActive) {
              SetIsActive(true);
            }
          }}
        >
          {Session ? (
            <Gambit initialSession={Session} onNewGame={HandleNewGame} />
          ) : null}
        </div>
      </div>
    </main>
  );
};
