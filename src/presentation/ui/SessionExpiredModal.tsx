import { motion } from 'framer-motion';

type SessionExpiredModalProps = {
  OnClose: () => void;
};

export const SessionExpiredModal = ({ OnClose }: SessionExpiredModalProps) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-sm border-[4px] border-[#ff4444] bg-[#1a0f0f] p-6 text-white shadow-[8px_8px_0px_#000]"
        style={{ imageRendering: 'pixelated' }}
      >
        <div className="flex justify-center mb-4">
          <div className="w-10 h-10 border-2 border-[#ff4444] flex items-center justify-center">
            <span
              className="text-[#ff6b6b] text-[14px]"
              style={{ fontFamily: '"Press Start 2P", monospace' }}
            >
              !
            </span>
          </div>
        </div>

        <h3
          className="mb-3 text-center text-[11px] uppercase text-[#ff6b6b]"
          style={{ fontFamily: '"Press Start 2P", monospace' }}
        >
          Sessão Expirada
        </h3>

        <p
          className="mb-6 text-center text-[8px] uppercase text-white/70 leading-5"
          style={{ fontFamily: '"Press Start 2P", monospace' }}
        >
          Sua sessão expirou. Faça login novamente para continuar.
        </p>

        <button
          onClick={OnClose}
          className="w-full border-2 border-[#ff4444] bg-[#ff4444]/20 py-3 text-[9px] uppercase text-[#ff6b6b] hover:bg-[#ff4444]/30 transition-colors"
          style={{ fontFamily: '"Press Start 2P", monospace' }}
        >
          Fazer Login
        </button>
      </motion.div>
    </div>
  );
};
