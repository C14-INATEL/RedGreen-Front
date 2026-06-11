import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiClient } from '@infrastructure/http/client';

type EditTableModalProps = {
  TableId: number | null;
  TableName: string;
  TableMinimumSpinValue: number;
  TableMinimumChipsRequired: number;
  TableMinimumRerollValue: number;
  TableActive: boolean;
  OnClose: () => void;
  OnSuccess: (Message: string) => void;
  OnError: (Message: string) => void;
  OnTableDeleted: (TableId: number) => void;
  OnTableUpdated: (UpdatedTable: {
    SlotMachineId: number;
    Name: string;
    MinimumSpinValue: number;
    MinimumChipsRequired: number;
    MinimumRerollValue: number;
    Active: boolean;
  }) => void;
};

type DeactivateConfirmModalProps = {
  TableName: string;
  ActiveSessions: { SlotSessionId: number }[];
  OnConfirm: () => void;
  OnCancel: () => void;
};

const DeactivateConfirmModal = ({
  TableName,
  OnConfirm,
  OnCancel,
}: DeactivateConfirmModalProps) => (
  <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 px-4">
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="w-full max-w-sm border-[4px] border-orange-500 bg-[#1a0e00] p-6 text-white shadow-[8px_8px_0px_#000]"
      style={{ imageRendering: 'pixelated' }}
    >
      <div className="flex justify-center mb-4">
        <div className="w-10 h-10 border-2 border-orange-500 flex items-center justify-center">
          <span
            className="text-orange-400 text-[14px]"
            style={{ fontFamily: '"Press Start 2P", monospace' }}
          >
            !
          </span>
        </div>
      </div>

      <h3
        className="mb-3 text-center text-[11px] uppercase text-orange-400"
        style={{ fontFamily: '"Press Start 2P", monospace' }}
      >
        Desativar Mesa
      </h3>

      <p
        className="mb-2 text-center text-[8px] uppercase text-white/70 leading-5"
        style={{ fontFamily: '"Press Start 2P", monospace' }}
      >
        A mesa <span className="text-[#FFD700]">{TableName}</span> possui
        sessões ativas.
      </p>

      <p
        className="mb-6 text-center text-[8px] uppercase text-orange-300/80 leading-5"
        style={{ fontFamily: '"Press Start 2P", monospace' }}
      >
        Todos receberão cash-out automático ao desativar.
      </p>

      <div className="flex flex-col gap-3">
        <button
          onClick={OnConfirm}
          className="w-full border-2 border-orange-500 bg-orange-500/20 py-3 text-[9px] uppercase text-orange-400 hover:bg-orange-500/30 transition-colors"
          style={{ fontFamily: '"Press Start 2P", monospace' }}
        >
          Confirmar e Desativar
        </button>
        <button
          onClick={OnCancel}
          className="w-full border-2 border-white/20 py-3 text-[9px] uppercase text-white/60 hover:border-white/40 hover:text-white transition-colors"
          style={{ fontFamily: '"Press Start 2P", monospace' }}
        >
          Cancelar
        </button>
      </div>
    </motion.div>
  </div>
);

export const EditTableModal = ({
  TableId,
  TableName,
  TableMinimumSpinValue,
  TableMinimumChipsRequired,
  TableMinimumRerollValue,
  TableActive,
  OnClose,
  OnSuccess,
  OnError,
  OnTableDeleted,
  OnTableUpdated,
}: EditTableModalProps) => {
  const [Name, SetName] = useState(TableName);
  const [MinimumSpinValue, SetMinimumSpinValue] = useState(
    String(TableMinimumSpinValue)
  );
  const [MinimumChipsRequired, SetMinimumChipsRequired] = useState(
    String(TableMinimumChipsRequired)
  );
  const [MinimumRerollValue, SetMinimumRerollValue] = useState(
    String(TableMinimumRerollValue)
  );

  const [ShowDeactivateConfirm, SetShowDeactivateConfirm] = useState(false);
  const [ActiveSessions, SetActiveSessions] = useState<
    { SlotSessionId: number }[]
  >([]);
  const [IsTogglingActive, SetIsTogglingActive] = useState(false);

  const HandleSave = async () => {
    if (TableId === null) {
      OnError('Mesa inválida.');
      return;
    }
    if (!Name.trim()) {
      OnError('O nome da mesa é obrigatório.');
      return;
    }
    if (!MinimumSpinValue || !MinimumChipsRequired || !MinimumRerollValue) {
      OnError('Preencha todos os campos.');
      return;
    }
    if (
      Number(MinimumSpinValue) <= 0 ||
      Number(MinimumRerollValue) <= 0 ||
      Number(MinimumChipsRequired) < 0
    ) {
      OnError(
        'A aposta mínima e o valor do reroll devem ser maiores que zero.'
      );
      return;
    }
    if (
      !Number.isInteger(Number(MinimumSpinValue)) ||
      !Number.isInteger(Number(MinimumChipsRequired)) ||
      !Number.isInteger(Number(MinimumRerollValue))
    ) {
      OnError('Os valores devem ser números inteiros.');
      return;
    }

    try {
      const Response = await apiClient.put(`/slot/machine/${TableId}`, {
        Name,
        Description: 'Mesa criada pelo sistema',
        MinimumSpinValue: Number(MinimumSpinValue),
        MinimumChipsRequired: Number(MinimumChipsRequired),
        MinimumRerollValue: Number(MinimumRerollValue),
      });

      OnTableUpdated(Response.data);
      OnSuccess('Mesa atualizada com sucesso!');
      OnClose();
    } catch (err) {
      OnError(err instanceof Error ? err.message : 'Erro ao atualizar mesa.');
    }
  };

  const HandleToggleActiveClick = async () => {
    if (TableId === null) {
      OnError('Mesa inválida.');
      return;
    }

    if (!TableActive) {
      void ExecuteToggle([]);
      return;
    }

    SetIsTogglingActive(true);
    try {
      const Response = await apiClient.get<
        { SlotSessionId: number; Status: string }[]
      >(`/slot-machines/${TableId}/sessions`);
      const InProgress = Response.data.filter((S) => S.Status === 'InProgress');

      SetActiveSessions(InProgress);

      if (InProgress.length > 0) {
        SetShowDeactivateConfirm(true);
        SetIsTogglingActive(false);
      } else {
        void ExecuteToggle([]);
      }
    } catch {
      SetActiveSessions([]);
      SetShowDeactivateConfirm(true);
      SetIsTogglingActive(false);
    }
  };

  const ExecuteToggle = async (
    SessionsToCashOut: { SlotSessionId: number }[]
  ) => {
    if (TableId === null) return;

    SetIsTogglingActive(true);
    try {
      if (SessionsToCashOut.length > 0) {
        await Promise.all(
          SessionsToCashOut.map((S) =>
            apiClient.post(
              `/slot-machines/${TableId}/sessions/${S.SlotSessionId}/cash-out`
            )
          )
        );
      }

      await apiClient.patch(`/slot/machine/${TableId}/deactivate`);

      OnTableUpdated({
        SlotMachineId: TableId,
        Name,
        MinimumSpinValue: Number(MinimumSpinValue),
        MinimumChipsRequired: Number(MinimumChipsRequired),
        MinimumRerollValue: Number(MinimumRerollValue),
        Active: !TableActive,
      });

      OnSuccess(
        TableActive
          ? 'Mesa desativada com sucesso!'
          : 'Mesa ativada com sucesso!'
      );
      OnClose();
    } catch (err) {
      OnError(
        err instanceof Error ? err.message : 'Erro ao alterar status da mesa.'
      );
    } finally {
      SetIsTogglingActive(false);
    }
  };

  const HandleDelete = async () => {
    if (TableId === null) {
      OnError('Mesa inválida.');
      return;
    }

    try {
      await apiClient.delete(`/slot/machine/${TableId}`);
      OnTableDeleted(TableId);
      OnSuccess('Mesa removida com sucesso.');
      OnClose();
    } catch (err) {
      const HasApiResponse = Boolean((err as { response?: unknown })?.response);
      OnError(
        HasApiResponse
          ? 'Não é possível excluir a mesa pois há sessões ativas.'
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
                Label: 'Aposta mínima',
                Value: MinimumSpinValue,
                Setter: SetMinimumSpinValue,
              },
              {
                Label: 'Fichas mínimas',
                Value: MinimumChipsRequired,
                Setter: SetMinimumChipsRequired,
              },
              {
                Label: 'Valor do reroll',
                Value: MinimumRerollValue,
                Setter: SetMinimumRerollValue,
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

            <button
              onClick={HandleToggleActiveClick}
              disabled={IsTogglingActive}
              className={`w-full border-2 py-3 text-[10px] uppercase transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                ${
                  TableActive
                    ? 'border-orange-500 bg-orange-500/20 text-orange-400 hover:bg-orange-500/30'
                    : 'border-[hsl(120,50%,35%)] bg-[hsl(120,50%,35%)]/20 text-[hsl(120,50%,45%)] hover:bg-[hsl(120,50%,35%)]/30'
                }`}
              style={{ fontFamily: '"Press Start 2P", monospace' }}
            >
              {IsTogglingActive
                ? 'Aguarde...'
                : TableActive
                  ? 'Desativar'
                  : 'Ativar'}
            </button>

            <div className="relative group w-full">
              <button
                onClick={HandleDelete}
                disabled={TableActive}
                className={`w-full border-2 py-3 text-[10px] uppercase transition-colors
                  ${
                    TableActive
                      ? 'border-white/10 text-white/20 cursor-not-allowed'
                      : 'border-[#ff4444] bg-[#ff4444]/20 text-[#ff6b6b] hover:bg-[#ff4444]/30 cursor-pointer'
                  }`}
                style={{ fontFamily: '"Press Start 2P", monospace' }}
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

      <AnimatePresence>
        {ShowDeactivateConfirm && (
          <DeactivateConfirmModal
            TableName={TableName}
            ActiveSessions={ActiveSessions}
            OnConfirm={() => {
              SetShowDeactivateConfirm(false);
              void ExecuteToggle(ActiveSessions);
            }}
            OnCancel={() => SetShowDeactivateConfirm(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};
