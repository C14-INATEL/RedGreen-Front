import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { paths } from '@/paths';
import { useUserChips } from '@/application/hooks/useUserChips';
import { apiClient } from '@/infrastructure/http/client';
import { CreateGambitTableModal } from '../ui/Gambit/CreateGambitModal';
import { EditGambitTableModal } from '../ui/Gambit/EditGambitModal';
import { ResultModal } from '../ui/ResultModal';
import { GambitTableCard } from '../ui/Gambit/GambitTableCard';
import CassinoLogo from '../ui/CassinoLogo';

export type GambitTableFromApi = {
  GambitTableId: number;
  Name: string;
  Description: string;
  MinimumChipsRequired: number;
  CardPrice: number;
  TableMultiplier: number;
  MinimumCardsPurchased: number;
  MaxCardsPurchased: number;
  Active: boolean;
};

export const GambitTablesRoom = () => {
  const Navigate = useNavigate();

  const Token = localStorage.getItem('token');
  const IsLoggedIn = !!Token;
  const User = JSON.parse(localStorage.getItem('user') ?? '{}');
  const IsAdmin = User.UserType === 'Admin';

  const { chips: UserChips, isLoading } = useUserChips(IsLoggedIn);

  const [ApiTables, SetApiTables] = useState<GambitTableFromApi[]>([]);
  const [IsLoadingTables, SetIsLoadingTables] = useState(true);

  const [ShowCreateTableModal, SetShowCreateTableModal] = useState(false);
  const [ShowEditModal, SetShowEditModal] = useState(false);

  const [SelectedTableId, SetSelectedTableId] = useState<number | null>(null);
  const [SelectedTableName, SetSelectedTableName] = useState('');
  const [SelectedTableMinimumChipsRequired, SetSelectedTableMinimumChipsRequired] = useState(0);
  const [SelectedTableCardPrice, SetSelectedTableCardPrice] = useState(0);
  const [SelectedTableMultiplier, SetSelectedTableMultiplier] = useState(0);
  const [SelectedTableMinimumCardsPurchased, SetSelectedTableMinimumCardsPurchased] = useState(0);
  const [SelectedTableMaxCardsPurchased, SetSelectedTableMaxCardsPurchased] = useState(0);
  const [SelectedTableActive, SetSelectedTableActive] = useState(true);

  const [ShowResultModal, SetShowResultModal] = useState(false);
  const [ModalTitle, SetModalTitle] = useState('');
  const [ModalMessage, SetModalMessage] = useState('');
  const [ModalType, SetModalType] = useState<'success' | 'error'>('success');

  useEffect(() => {
    const FetchTables = async () => {
      try {
        const Response = await apiClient.get('/gambit-table');
        SetApiTables(Response.data);
      } catch (err) {
        console.error(err);
      } finally {
        SetIsLoadingTables(false);
      }
    };

    FetchTables();
  }, []);

  const Tables = ApiTables.filter((Table) => Table.Active || IsAdmin).sort(
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
              <GambitTableCard
                key={TableItem.GambitTableId}
                GambitTableId={TableItem.GambitTableId}
                Name={TableItem.Name}
                MinimumChipsRequired={TableItem.MinimumChipsRequired}
                CardPrice={TableItem.CardPrice}
                TableMultiplier={TableItem.TableMultiplier}
                MinimumCardsPurchased={TableItem.MinimumCardsPurchased}
                MaxCardsPurchased={TableItem.MaxCardsPurchased}
                IsLocked={IsLocked}
                IsAdmin={IsAdmin}
                IsActive={TableItem.Active}
                OnClick={() => {
                  if (IsLocked) return;
                  Navigate(paths.minefieldRoom, {
                    state: {
                      GambitTableId: TableItem.GambitTableId,
                      CardPrice: TableItem.CardPrice,
                      TableMultiplier: TableItem.TableMultiplier,
                      MinimumCardsPurchased: TableItem.MinimumCardsPurchased,
                      MaxCardsPurchased: TableItem.MaxCardsPurchased,
                    },
                  });
                }}
                OnEdit={() => {
                  SetSelectedTableId(TableItem.GambitTableId);
                  SetSelectedTableName(TableItem.Name);
                  SetSelectedTableMinimumChipsRequired(TableItem.MinimumChipsRequired);
                  SetSelectedTableCardPrice(TableItem.CardPrice);
                  SetSelectedTableMultiplier(TableItem.TableMultiplier);
                  SetSelectedTableMinimumCardsPurchased(TableItem.MinimumCardsPurchased);
                  SetSelectedTableMaxCardsPurchased(TableItem.MaxCardsPurchased);
                  SetSelectedTableActive(TableItem.Active);
                  SetShowEditModal(true);
                }}
              />
            );
          })
        )}
      </div>

      {ShowCreateTableModal && (
        <CreateGambitTableModal
          OnClose={() => SetShowCreateTableModal(false)}
          OnTableCreated={(NewTable) =>
            SetApiTables((Current) => [...Current, NewTable])
          }
          OnError={(Message) => {
            SetModalTitle('Erro');
            SetModalMessage(Message);
            SetModalType('error');
            SetShowResultModal(true);
          }}
          OnSuccess={(Message) => {
            SetModalTitle('Sucesso');
            SetModalMessage(Message);
            SetModalType('success');
            SetShowResultModal(true);
          }}
        />
      )}

      {ShowEditModal && (
        <EditGambitTableModal
          TableId={SelectedTableId}
          TableName={SelectedTableName}
          TableMinimumChipsRequired={SelectedTableMinimumChipsRequired}
          TableCardPrice={SelectedTableCardPrice}
          TableTableMultiplier={SelectedTableMultiplier}
          TableMinimumCardsPurchased={SelectedTableMinimumCardsPurchased}
          TableMaxCardsPurchased={SelectedTableMaxCardsPurchased}
          TableActive={SelectedTableActive}
          OnClose={() => SetShowEditModal(false)}
          OnTableDeleted={(TableId) =>
            SetApiTables((Current) =>
              Current.filter((Table) => Table.GambitTableId !== TableId)
            )
          }
          OnTableUpdated={(UpdatedTable) =>
            SetApiTables((Current) =>
              Current.map((Table) =>
                Table.GambitTableId === UpdatedTable.GambitTableId
                  ? { ...Table, ...UpdatedTable }
                  : Table
              )
            )
          }
          OnSuccess={(Message) => {
            SetModalTitle('Sucesso');
            SetModalMessage(Message);
            SetModalType('success');
            SetShowResultModal(true);
          }}
          OnError={(Message) => {
            SetModalTitle('Erro');
            SetModalMessage(Message);
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