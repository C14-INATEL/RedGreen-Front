import { useState } from 'react';
import { motion } from 'framer-motion';
import { apiClient } from '@infrastructure/http/client';

type SlotMachineFromApi = {
  SlotMachineId: number;
  Name: string;
  Description: string;
  MinimumSpinValue: number;
  MinimumChipsRequired: number;
  MinimumRerollValue: number;
  Active: boolean;
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
        MaxRerolls: 5,
        Active: true,
      });

      const NewTable = Response.data;
      OnTableCreated(NewTable);
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
        className="w-full max-w-md border-[4px] border-[hsl(120,50%,35%)] bg-[#0f1a0f] p-6 text-white shadow-[8px_8px_0px_#000]"
        style={{ imageRendering: 'pixelated' }}
      >
        <h2
          className="mb-1 text-center text-[12px] uppercase text-[hsl(120,50%,45%)]"
          style={{ fontFamily: '"Press Start 2P", monospace' }}
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
              className="auth-input"
            />
          ))}
        </div>

        <div className="mt-6 flex gap-3">
          <button onClick={HandleCreate} className="auth-button flex-1">
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
