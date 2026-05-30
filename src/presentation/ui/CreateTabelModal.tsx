import { useState } from 'react';
import { motion } from 'framer-motion';

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
  Token: string | null;
  OnClose: () => void;
  OnTableCreated: (newTable: SlotMachineFromApi) => void;
  OnError: (message: string) => void;
  OnSuccess: (message: string) => void;
};

export const CreateTableModal = ({
  Token,
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
      const Response = await fetch('http://localhost:3000/slot/machine', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${Token}`,
        },
        body: JSON.stringify({
          Name: TableName,
          Description: 'Mesa criada pelo sistema',
          MinimumSpinValue: Number(MinimumBet),
          MinimumChipsRequired: Number(MinimumChips),
          MinimumRerollValue: Number(MinimumRerollValue),
          MaxRerolls: 5,
          Active: true,
        }),
      });

      if (!Response.ok) {
        const ErrorData = await Response.json();
        throw new Error(ErrorData.message ?? 'Erro ao criar mesa');
      }

      const NewTable = await Response.json();
      OnTableCreated(NewTable);
      OnSuccess('Mesa criada com sucesso!');
      OnClose();
    } catch (err) {
      OnError(err instanceof Error ? err.message : 'Erro ao criar mesa');
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
          {[
            {
              placeholder: 'Nome da mesa',
              value: TableName,
              setter: SetTableName,
              type: 'text',
            },
            {
              placeholder: 'Aposta mínima',
              value: MinimumBet,
              setter: SetMinimumBet,
            },
            {
              placeholder: 'Fichas mínimas',
              value: MinimumChips,
              setter: SetMinimumChips,
            },
            {
              placeholder: 'Valor do reroll',
              value: MinimumRerollValue,
              setter: SetMinimumRerollValue,
            },
          ].map(({ placeholder, value, setter, type }) => (
            <input
              key={placeholder}
              type={type}
              placeholder={placeholder}
              value={value}
              onChange={(e) => setter(e.target.value)}
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
