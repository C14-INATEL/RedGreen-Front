import { motion } from 'framer-motion';

type DeleteTableModalProps = {
  TableName: string;
  TableId: number | null;
  Token: string | null;
  OnClose: () => void;
  OnSuccess: (message: string) => void;
  OnError: (message: string) => void;
  OnTableDeleted: (tableId: number) => void;
};

export const DeleteTableModal = ({
  TableName,
  TableId,
  Token,
  OnClose,
  OnSuccess,
  OnError,
  OnTableDeleted,
}: DeleteTableModalProps) => {
  const HandleDelete = async () => {
    try {
      const Response = await fetch(
        `http://localhost:3000/slot/machine/${TableId}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${Token}` },
        }
      );

      if (!Response.ok)
        throw new Error(
          'Não é possível excluir a mesa pois há sessões ativas.'
        );

      OnTableDeleted(TableId!);
      OnSuccess('Mesa removida com sucesso.');
      OnClose();
    } catch (err) {
      OnError(err instanceof Error ? err.message : 'Erro ao remover mesa.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.97 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md border-[4px] border-[#ff4444] bg-[#1a0f0f] p-6 text-white shadow-[8px_8px_0px_#000]"
        style={{ imageRendering: 'pixelated' }}
      >
        <h2
          className="mb-1 text-center text-[12px] uppercase text-[#ff6b6b]"
          style={{ fontFamily: '"Press Start 2P", monospace' }}
        >
          Excluir Mesa
        </h2>
        <p
          className="mb-6 text-center text-[9px] text-white/50 uppercase tracking-widest"
          style={{ fontFamily: '"Press Start 2P", monospace' }}
        >
          Esta ação é irreversível
        </p>

        <p
          className="mb-6 text-center text-[9px] leading-6 uppercase text-white/80"
          style={{ fontFamily: '"Press Start 2P", monospace' }}
        >
          Deseja realmente excluir a mesa:
          <br />
          <span className="text-[#ff6b6b]">{TableName}</span>?
        </p>

        <div className="flex gap-3">
          <button
            onClick={HandleDelete}
            className="flex-1 border-2 border-[#ff4444] bg-[#ff4444]/20 py-3 text-[10px] uppercase text-[#ff6b6b] hover:bg-[#ff4444]/30 transition-colors"
            style={{ fontFamily: '"Press Start 2P", monospace' }}
          >
            Excluir
          </button>
          <button
            onClick={OnClose}
            className="flex-1 border-2 border-white/20 py-3 text-[10px] uppercase text-white/60 hover:border-white/40 hover:text-white transition-colors"
            style={{ fontFamily: '"Press Start 2P", monospace' }}
          >
            Cancelar
          </button>
        </div>
      </motion.div>
    </div>
  );
};
