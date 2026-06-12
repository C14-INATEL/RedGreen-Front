import { useState } from 'react';
import { motion } from 'framer-motion';
import { apiClient } from '@infrastructure/http/client';
import { COLOR_OPTIONS, type TableColor } from '../ui/TableColor';

type SlotMachineFromApi = {
  SlotMachineId: number;
  Name: string;
  Description: string;
  MinimumSpinValue: number;
  MinimumChipsRequired: number;
  MinimumRerollValue: number;
  Active: boolean;
  TableColor: TableColor;
};

type CreateTableModalProps = {
  OnClose: () => void;
  OnTableCreated: (NewTable: SlotMachineFromApi) => void;
  OnError: (Message: string) => void;
  OnSuccess: (Message: string) => void;
};

export const CreateTableModal = ({
  OnClose,
  OnTableCreated,
  OnError,
  OnSuccess,
}: CreateTableModalProps) => {
  const [TableName, SetTableName] = useState('');
  const [MinimumBet, SetMinimumBet] = useState('');
  const [MinimumChips, SetMinimumChips] = useState('');
  const [MinimumRerollValue, SetMinimumRerollValue] = useState('');
  const [SelectedColor, SetSelectedColor] = useState<TableColor>('White');

  const ActiveColor = COLOR_OPTIONS.find((C) => C.Value === SelectedColor)!;

  const HandleCreate = async () => {
    if (!TableName.trim()) {
      OnError('O nome da mesa é obrigatório.');
      return;
    }
    if (!MinimumBet || !MinimumChips || !MinimumRerollValue) {
      OnError('Preencha todos os campos.');
      return;
    }
    if (
      Number(MinimumBet) <= 0 ||
      Number(MinimumRerollValue) <= 0 ||
      Number(MinimumChips) < 0
    ) {
      OnError(
        'A aposta mínima e o valor do reroll devem ser maiores que zero.'
      );
      return;
    }
    if (
      !Number.isInteger(Number(MinimumBet)) ||
      !Number.isInteger(Number(MinimumChips)) ||
      !Number.isInteger(Number(MinimumRerollValue))
    ) {
      OnError(
        'A aposta mínima, fichas mínimas e valor do reroll devem ser números inteiros.'
      );
      return;
    }

    try {
      const Response = await apiClient.post('/slot/machine', {
        Name: TableName,
        Description: 'Mesa criada pelo sistema',
        MinimumSpinValue: Number(MinimumBet),
        MinimumChipsRequired: Number(MinimumChips),
        MinimumRerollValue: Number(MinimumRerollValue),
        TableColor: SelectedColor,
      });

      OnTableCreated(Response.data);
      OnSuccess('Mesa criada com sucesso!');
      OnClose();
    } catch (Err) {
      const ErrorMessage =
        (Err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? (Err instanceof Error ? Err.message : null);
      OnError(ErrorMessage ?? 'Erro ao criar mesa');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.97 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md border-[4px] bg-[#0f1a0f] p-6 text-white shadow-[8px_8px_0px_#000] transition-colors duration-300"
        style={{
          imageRendering: 'pixelated',
          borderColor: ActiveColor.Hex,
        }}
      >
        <h2
          className="mb-1 text-center text-[12px] uppercase transition-colors duration-300"
          style={{
            fontFamily: '"Press Start 2P", monospace',
            color: ActiveColor.Hex,
          }}
        >
          Criar Mesa
        </h2>
        <p
          className="mb-6 text-center text-[9px] text-white/50 uppercase tracking-widest"
          style={{ fontFamily: '"Press Start 2P", monospace' }}
        >
          Preencha os dados da mesa
        </p>

        <div className="space-y-3">
          <div>
            <div className="flex justify-between items-center mb-1">
              <label
                className="text-[8px] uppercase text-white/50"
                style={{ fontFamily: '"Press Start 2P", monospace' }}
              >
                Nome da mesa
              </label>
              <span
                className={`text-[8px] ${TableName.length >= 30 ? 'text-red-400' : 'text-white/40'}`}
                style={{ fontFamily: '"Press Start 2P", monospace' }}
              >
                {TableName.length}/30
              </span>
            </div>
            <input
              placeholder="Nome da mesa"
              value={TableName}
              onChange={(e) => SetTableName(e.target.value)}
              maxLength={30}
              className="auth-input w-full"
            />
          </div>

          {[
            {
              Placeholder: 'Aposta mínima',
              Value: MinimumBet,
              Setter: SetMinimumBet,
            },
            {
              Placeholder: 'Fichas mínimas',
              Value: MinimumChips,
              Setter: SetMinimumChips,
            },
            {
              Placeholder: 'Valor do reroll',
              Value: MinimumRerollValue,
              Setter: SetMinimumRerollValue,
            },
          ].map(({ Placeholder, Value, Setter }) => (
            <input
              key={Placeholder}
              placeholder={Placeholder}
              value={Value}
              onChange={(e) => Setter(e.target.value)}
              className="auth-input w-full"
            />
          ))}

          <div>
            <label
              className="block text-[8px] uppercase text-white/50 mb-3"
              style={{ fontFamily: '"Press Start 2P", monospace' }}
            >
              Cor da mesa
            </label>

            <div className="flex items-center gap-3">
              {COLOR_OPTIONS.map((C) => {
                const IsSelected = SelectedColor === C.Value;
                return (
                  <button
                    key={C.Value}
                    title={C.Label}
                    onClick={() => SetSelectedColor(C.Value)}
                    className="relative flex-1 h-8 border-2 transition-all duration-200"
                    style={{
                      background: C.Hex,
                      borderColor: IsSelected ? '#fff' : 'transparent',
                      boxShadow: IsSelected
                        ? `0 0 10px 3px ${C.Hex}88, 0 0 0 1px #fff`
                        : `0 0 6px 1px ${C.Hex}44`,
                      opacity: IsSelected ? 1 : 0.45,
                    }}
                  >
                    {IsSelected && (
                      <span
                        className="absolute inset-0 flex items-center justify-center text-black text-[8px]"
                        style={{ fontFamily: '"Press Start 2P", monospace' }}
                      >
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <p
              className="mt-2 text-center text-[7px] uppercase transition-colors duration-200"
              style={{
                fontFamily: '"Press Start 2P", monospace',
                color: ActiveColor.Hex,
              }}
            >
              {ActiveColor.Label}
            </p>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={HandleCreate}
            className="flex-1 border-2 py-2 text-[10px] uppercase transition-colors"
            style={{
              fontFamily: '"Press Start 2P", monospace',
              borderColor: ActiveColor.Hex,
              color: ActiveColor.Hex,
              background: `${ActiveColor.Hex}22`,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background =
                `${ActiveColor.Hex}44`;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background =
                `${ActiveColor.Hex}22`;
            }}
          >
            Criar
          </button>
          <button
            onClick={OnClose}
            className="flex-1 border-2 border-white/20 py-2 text-[10px] uppercase text-white/60 hover:border-white/40 hover:text-white transition-colors"
            style={{ fontFamily: '"Press Start 2P", monospace' }}
          >
            Cancelar
          </button>
        </div>
      </motion.div>
    </div>
  );
};
