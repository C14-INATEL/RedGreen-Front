import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchActiveSlotSession } from '../games/SlotMachineGame/slotMachineApi';
import { paths } from '@/paths';
import { useUserChips } from '@/application/hooks/useUserChips';
import { apiClient } from '@/infrastructure/http/client';
import { CreateTableModal } from '../ui/CreateTableModal';
import { DeleteTableModal } from '../ui/DeleteTableModal';
import { ResultModal } from '../ui/ResultModal';
import { SessionWarningModal } from '../ui/SessionWarningModal';
import { SlotMachineCard } from '../ui/SlotMachineCard';
import type { SlotMachineFromApi } from '../games/SlotMachine';

import CassinoLogo from '../ui/CassinoLogo';

export const SlotMachineTablesRoom = () => {
  const [ShowSessionWarning, SetShowSessionWarning] = useState(false);

  const [PendingMachineName, SetPendingMachineName] = useState('');

  const Navigate = useNavigate();

  const Token = localStorage.getItem('token');

  const IsLoggedIn = !!Token;

  const User = JSON.parse(localStorage.getItem('user') ?? '{}');

  const IsAdmin = User.UserType === 'Admin';

  const { chips: UserChips, isLoading } = useUserChips(IsLoggedIn);

  const [ApiTables, SetApiTables] = useState<SlotMachineFromApi[]>([]);

  const [IsLoadingTables, SetIsLoadingTables] = useState(true);

  const [ShowCreateTableModal, SetShowCreateTableModal] = useState(false);

  const [ShowDeleteModal, SetShowDeleteModal] = useState(false);

  const [SelectedTableId, SetSelectedTableId] = useState<number | null>(null);

  const [SelectedTableName, SetSelectedTableName] = useState('');

  const [ShowResultModal, SetShowResultModal] = useState(false);

  const [ModalTitle, SetModalTitle] = useState('');

  const [ModalMessage, SetModalMessage] = useState('');

  const [ModalType, SetModalType] = useState<'success' | 'error'>('success');

  useEffect(() => {
    const FetchTables = async () => {
      try {
        const Response = await apiClient.get('/slot/machine');
        const Data = Response.data;

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

      {IsAdmin && (
        <button
          onClick={() => SetShowCreateTableModal(true)}
          className="absolute top-6 right-6 z-30 border-[3px] border-[hsl(120,50%,35%)] bg-card/60 backdrop-blur-sm px-4 py-2 text-[10px] uppercase text-[hsl(120,50%,45%)] shadow-[4px_4px_0px_#000] transition-all hover:bg-[hsl(120,50%,35%)]/10 hover:shadow-[6px_6px_0px_#000]"
          style={{
            fontFamily: '"Press Start 2P", monospace',
            imageRendering: 'pixelated',
          }}
        >
          + Criar Mesa
        </button>
      )}

      <div className="z-10 pb-16 flex flex-wrap justify-center gap-6 px-4 w-full max-w-7xl min-h-[400px] items-center">
        {!IsLoadingTables && Tables.length === 0 ? (
          <div className="flex flex-col items-center gap-4 mt-16">
            <p
              className="text-[12px] uppercase text-white/20 text-center"
              style={{ fontFamily: '"Press Start 2P", monospace' }}
            >
              Nenhuma mesa disponível
            </p>
            <p
              className="text-[9px] uppercase text-white/10 text-center"
              style={{ fontFamily: '"Press Start 2P", monospace' }}
            >
              {IsAdmin ? 'Crie uma mesa para começar.' : 'Volte mais tarde.'}
            </p>
          </div>
        ) : (
          Tables.map((TableItem) => {
            const IsLocked =
              !IsLoggedIn ||
              isLoading ||
              IsLoadingTables ||
              UserChips === undefined ||
              UserChips < TableItem.MinimumChipsRequired;

            return (
              <SlotMachineCard
                key={TableItem.SlotMachineId}
                SlotMachineId={TableItem.SlotMachineId}
                Name={TableItem.Name}
                MinimumSpinValue={TableItem.MinimumSpinValue}
                MinimumChipsRequired={TableItem.MinimumChipsRequired}
                IsLocked={IsLocked}
                IsAdmin={IsAdmin}
                OnClick={async () => {
                  if (IsLocked) return;
                  try {
                    const ActiveSession = await fetchActiveSlotSession();
                    if (
                      ActiveSession &&
                      ActiveSession.SlotMachineId !== TableItem.SlotMachineId
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
                        bet: TableItem.MinimumSpinValue,
                        slotMachineId: TableItem.SlotMachineId,
                      },
                    });
                  } catch (err) {
                    console.error(err);
                  }
                }}
                OnDelete={() => {
                  SetSelectedTableId(TableItem.SlotMachineId);
                  SetSelectedTableName(TableItem.Name);
                  SetShowDeleteModal(true);
                }}
              />
            );
          })
        )}
      </div>
      {ShowSessionWarning && (
        <SessionWarningModal
          MachineName={PendingMachineName}
          OnClose={() => SetShowSessionWarning(false)}
        />
      )}

      {ShowCreateTableModal && (
        <CreateTableModal
          OnClose={() => SetShowCreateTableModal(false)}
          OnTableCreated={(newTable) =>
            SetApiTables((current) => [...current, newTable])
          }
          OnError={(message) => {
            SetModalTitle('Erro');
            SetModalMessage(message);
            SetModalType('error');
            SetShowResultModal(true);
          }}
          OnSuccess={(message) => {
            SetModalTitle('Sucesso');
            SetModalMessage(message);
            SetModalType('success');
            SetShowResultModal(true);
          }}
        />
      )}

      {ShowDeleteModal && (
        <DeleteTableModal
          TableName={SelectedTableName}
          TableId={SelectedTableId}
          OnClose={() => SetShowDeleteModal(false)}
          OnTableDeleted={(tableId) =>
            SetApiTables((current) =>
              current.filter((Table) => Table.SlotMachineId !== tableId)
            )
          }
          OnSuccess={(message) => {
            SetModalTitle('Sucesso');
            SetModalMessage(message);
            SetModalType('success');
            SetShowResultModal(true);
          }}
          OnError={(message) => {
            SetModalTitle('Erro');
            SetModalMessage(message);
            SetModalType('error');
            SetShowResultModal(true);
          }}
        />
      )}

      {ShowResultModal && (
        <ResultModal
          Title={ModalTitle}
          Message={ModalMessage}
          Type={ModalType}
          OnClose={() => SetShowResultModal(false)}
        />
      )}
    </main>
  );
};
