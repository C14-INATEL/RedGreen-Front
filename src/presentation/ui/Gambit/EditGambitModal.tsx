import { useState } from 'react';
import { motion } from 'framer-motion';
import { apiClient } from '@infrastructure/http/client';
import type { GambitTableFromApi } from '../../pages/GambitTablesRoom';

type EditGambitTableModalProps = {
  TableId: number | null;
  TableName: string;
  TableMinimumChipsRequired: number;
  TableCardPrice: number;
  TableTableMultiplier: number;
  TableMinimumCardsPurchased: number;
  TableMaxCardsPurchased: number;
  TableActive: boolean;
  OnClose: () => void;
  OnSuccess: (Message: string) => void;
  OnError: (Message: string) => void;
  OnTableDeleted: (TableId: number) => void;
  OnTableUpdated: (UpdatedTable: GambitTableFromApi) => void;
};

export const EditGambitTableModal = ({
  TableId,
  TableName,
  TableMinimumChipsRequired,
  TableCardPrice,
  TableTableMultiplier,
  TableMinimumCardsPurchased,
  TableMaxCardsPurchased,
  TableActive,
  OnClose,
  OnSuccess,
  OnError,
  OnTableDeleted,
  OnTableUpdated,
}: EditGambitTableModalProps) => {
  const [Name, SetName] = useState(TableName);
  const [MinimumChips, SetMinimumChips] = useState(
    String(TableMinimumChipsRequired)
  );
  const [CardPrice, SetCardPrice] = useState(String(TableCardPrice));
  const [TableMultiplier, SetTableMultiplier] = useState(
    String(TableTableMultiplier)
  );
  const [MinimumCardsPurchased, SetMinimumCardsPurchased] = useState(
    String(TableMinimumCardsPurchased)
  );
  const [MaxCardsPurchased, SetMaxCardsPurchased] = useState(
    String(TableMaxCardsPurchased)
  );

  const HandleSave = async () => {
    if (TableId === null) {
      OnError('Mesa inválida.');
      return;
    }
    if (!Name.trim()) {
      OnError('O nome da mesa é obrigatório.');
      return;
    }
    if (
      !MinimumChips ||
      !CardPrice ||
      !TableMultiplier ||
      !MinimumCardsPurchased ||
      !MaxCardsPurchased
    ) {
      OnError('Preencha todos os campos.');
      return;
    }
    if (
      Number(MinimumChips) < 0 ||
      Number(CardPrice) <= 0 ||
      Number(TableMultiplier) <= 0
    ) {
      OnError('Os valores devem ser maiores que zero.');
      return;
    }
    if (Number(MinimumCardsPurchased) >= Number(MaxCardsPurchased)) {
      OnError('O máximo de cartas deve ser maior que o mínimo.');
      return;
    }
    if (Number(MaxCardsPurchased) > 25) {
      OnError('O máximo de cartas não pode ultrapassar 25.');
      return;
    }
    if (
      !Number.isInteger(Number(MinimumChips)) ||
      !Number.isInteger(Number(CardPrice)) ||
      !Number.isInteger(Number(MinimumCardsPurchased)) ||
      !Number.isInteger(Number(MaxCardsPurchased))
    ) {
      OnError('Os valores devem ser números inteiros.');
      return;
    }

    try {
      const Response = await apiClient.patch(`/gambit-table/${TableId}`, {
        Name,
        Description: 'Mesa criada pelo sistema',
        MinimumChipsRequired: Number(MinimumChips),
        CardPrice: Number(CardPrice),
        TableMultiplier: Number(TableMultiplier),
        MinimumCardsPurchased: Number(MinimumCardsPurchased),
        MaxCardsPurchased: Number(MaxCardsPurchased),
      });

      OnTableUpdated(Response.data);
      OnSuccess('Mesa atualizada com sucesso!');
      OnClose();
    } catch (err) {
      OnError(err instanceof Error ? err.message : 'Erro ao atualizar mesa.');
    }
  };

  const HandleDelete = async () => {
    if (TableId === null) {
      OnError('Mesa inválida.');
      return;
    }

    try {
      await apiClient.delete(`/gambit-table/${TableId}`);
      OnTableDeleted(TableId);
      OnSuccess('Mesa removida com sucesso.');
      OnClose();
    } catch (err) {
      const HasApiResponse = Boolean((err as { response?: unknown })?.response);
      OnError(
        HasApiResponse
          ? 'Desative a mesa antes de excluir.'
          : 'Erro ao remover mesa.'
      );
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.97 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md border-[4px] border-[#FFD700] bg-[#1a1500] p-6 text-white shadow-[8px_8px_0px_#000]"
          style={{ imageRendering: 'pixelated' }}
        >
          <h2
            className="mb-1 text-center text-[12px] uppercase text-[#FFD700]"
            style={{ fontFamily: '"Press Start 2P", monospace' }}
          >
            Editar Mesa
          </h2>
          <p
            className="mb-6 text-center text-[9px] text-white/50 uppercase tracking-widest"
            style={{ fontFamily: '"Press Start 2P", monospace' }}
          >
            {TableName}
          </p>

          <div className="space-y-3 mb-6">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label
                  className="text-[8px] uppercase text-white/50"
                  style={{ fontFamily: '"Press Start 2P", monospace' }}
                >
                  Nome da mesa
                </label>
                <span
                  className={`text-[8px] ${Name.length >= 30 ? 'text-red-400' : 'text-white/40'}`}
                  style={{ fontFamily: '"Press Start 2P", monospace' }}
                >
                  {Name.length}/30
                </span>
              </div>
              <input
                value={Name}
                onChange={(e) => SetName(e.target.value)}
                maxLength={30}
                className="auth-input w-full"
              />
            </div>

            {[
              {
                Label: 'Fichas mínimas',
                Value: MinimumChips,
                Setter: SetMinimumChips,
              },
              {
                Label: 'Preço por carta',
                Value: CardPrice,
                Setter: SetCardPrice,
              },
              {
                Label: 'Multiplicador da mesa',
                Value: TableMultiplier,
                Setter: SetTableMultiplier,
              },
              {
                Label: 'Mínimo de cartas',
                Value: MinimumCardsPurchased,
                Setter: SetMinimumCardsPurchased,
              },
              {
                Label: 'Máximo de cartas',
                Value: MaxCardsPurchased,
                Setter: SetMaxCardsPurchased,
              },
            ].map(({ Label, Value, Setter }) => (
              <div key={Label}>
                <label
                  className="block text-[8px] uppercase text-white/50 mb-1"
                  style={{ fontFamily: '"Press Start 2P", monospace' }}
                >
                  {Label}
                </label>
                <input
                  value={Value}
                  onChange={(e) => Setter(e.target.value)}
                  className="auth-input w-full"
                />
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={HandleSave}
              className="w-full border-2 border-[#FFD700] bg-[#FFD700]/20 py-3 text-[10px] uppercase text-[#FFD700] hover:bg-[#FFD700]/30 transition-colors"
              style={{ fontFamily: '"Press Start 2P", monospace' }}
            >
              Salvar
            </button>

            <div className="relative group w-full">
              <button
                disabled={TableActive}
                className={`w-full border-2 py-3 text-[10px] uppercase transition-colors
                  ${
                    TableActive
                      ? 'border-white/10 text-white/20 cursor-not-allowed'
                      : 'border-[#ff4444] bg-[#ff4444]/20 text-[#ff6b6b] hover:bg-[#ff4444]/30 cursor-pointer'
                  }`}
                style={{ fontFamily: '"Press Start 2P", monospace' }}
                onClick={HandleDelete}
              >
                Excluir
              </button>

              {TableActive && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                  <div
                    className="bg-[#1a1a1a] border border-white/20 px-3 py-2 text-[7px] uppercase text-white/60 whitespace-nowrap"
                    style={{ fontFamily: '"Press Start 2P", monospace' }}
                  >
                    Desative a mesa primeiro
                  </div>
                  <div className="w-2 h-2 bg-[#1a1a1a] border-r border-b border-white/20 rotate-45 mx-auto -mt-1" />
                </div>
              )}
            </div>

            <button
              onClick={OnClose}
              className="w-full border-2 border-white/20 py-3 text-[10px] uppercase text-white/60 hover:border-white/40 hover:text-white transition-colors"
              style={{ fontFamily: '"Press Start 2P", monospace' }}
            >
              Cancelar
            </button>
          </div>
        </motion.div>
      </div>
    </>
  );
};
