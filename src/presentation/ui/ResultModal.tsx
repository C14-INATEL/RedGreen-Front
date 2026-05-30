import { motion } from 'framer-motion';

type ResultModalProps = {
  Title: string;
  Message: string;
  Type: 'success' | 'error';
  OnClose: () => void;
};

export const ResultModal = ({
  Title,
  Message,
  Type,
  OnClose,
}: ResultModalProps) => {
  const IsSuccess = Type === 'success';

  const BorderColor = IsSuccess
    ? 'border-[hsl(120,50%,35%)]'
    : 'border-[#ff4444]';
  const BgColor = IsSuccess ? 'bg-[#0f1a0f]' : 'bg-[#1a0f0f]';
  const TitleColor = IsSuccess ? 'text-[hsl(120,50%,45%)]' : 'text-[#ff6b6b]';
  const ButtonBorder = IsSuccess
    ? 'border-[hsl(120,50%,35%)] bg-[hsl(120,50%,35%)]/20 text-[hsl(120,50%,55%)] hover:bg-[hsl(120,50%,35%)]/30'
    : 'border-[#ff4444] bg-[#ff4444]/20 text-[#ff6b6b] hover:bg-[#ff4444]/30';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.97 }}
        transition={{ duration: 0.3 }}
        className={`w-full max-w-md border-[4px] ${BorderColor} ${BgColor} p-6 text-white shadow-[8px_8px_0px_#000]`}
        style={{ imageRendering: 'pixelated' }}
      >
        <h2
          className={`mb-1 text-center text-[12px] uppercase ${TitleColor}`}
          style={{ fontFamily: '"Press Start 2P", monospace' }}
        >
          {Title}
        </h2>

        <p
          className="mt-4 text-center text-[9px] leading-6 uppercase text-white/80"
          style={{ fontFamily: '"Press Start 2P", monospace' }}
        >
          {Message}
        </p>

        <button
          onClick={OnClose}
          className={`mt-6 w-full border-2 py-3 text-[10px] uppercase transition-colors ${ButtonBorder}`}
          style={{ fontFamily: '"Press Start 2P", monospace' }}
        >
          OK
        </button>
      </motion.div>
    </div>
  );
};
