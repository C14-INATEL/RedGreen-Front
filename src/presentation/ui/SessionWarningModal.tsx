import { motion } from 'framer-motion';

type SessionWarningModalProps = {
  MachineName: string;
  OnClose: () => void;
};

export const SessionWarningModal = ({
  MachineName,
  OnClose,
}: SessionWarningModalProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.97 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md border-[4px] border-yellow-400 bg-[#1a180a] p-6 text-white shadow-[8px_8px_0px_#000]"
        style={{ imageRendering: 'pixelated' }}
      >
        <h2
          className="mb-1 text-center text-[12px] uppercase text-yellow-300"
          style={{ fontFamily: '"Press Start 2P", monospace' }}
        >
          Jogo em andamento!
        </h2>

        <p
          className="text-center text-[9px] leading-6 uppercase text-white/80"
          style={{ fontFamily: '"Press Start 2P", monospace' }}
        >
          Você ainda possui uma sessão ativa na mesa:
        </p>

        <p
          className="mt-3 text-center text-[9px] leading-6 uppercase text-yellow-300 break-all"
          style={{ fontFamily: '"Press Start 2P", monospace' }}
        >
          {MachineName}
        </p>

        <p
          className="mt-3 text-center text-[9px] leading-6 uppercase text-white/80"
          style={{ fontFamily: '"Press Start 2P", monospace' }}
        >
          Realize o cash out antes de entrar em outra mesa.
        </p>

        <button
          onClick={OnClose}
          className="mt-6 w-full border-2 border-yellow-400 bg-yellow-500/20 py-3 text-[10px] uppercase text-yellow-200 transition-colors hover:bg-yellow-500/30"
          style={{ fontFamily: '"Press Start 2P", monospace' }}
        >
          Entendi
        </button>
      </motion.div>
    </div>
  );
};
