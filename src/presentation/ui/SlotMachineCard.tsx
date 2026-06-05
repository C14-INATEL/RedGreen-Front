import { motion } from 'framer-motion';

type SlotMachineCardProps = {
  SlotMachineId: number;
  Name: string;
  MinimumSpinValue: number;
  MinimumChipsRequired: number;
  IsLocked: boolean;
  IsAdmin: boolean;
  IsActive: boolean;
  OnClick: () => void;
  OnEdit: () => void;
};

export const SlotMachineCard = ({
  Name,
  MinimumSpinValue,
  MinimumChipsRequired,
  IsLocked,
  IsAdmin,
  OnClick,
  OnEdit,
  IsActive,
}: SlotMachineCardProps) => {
  return (
    <motion.div
      whileHover={{ scale: IsLocked ? 1 : 1.03 }}
      transition={{ duration: 0.15 }}
      className={`relative w-52 border-[3px] p-4 text-center shadow-[4px_4px_0px_#000] transition-all
  ${
    IsLocked && !IsAdmin
      ? 'cursor-not-allowed border-white/10 bg-card/30 opacity-40'
      : IsLocked && IsAdmin
        ? 'cursor-not-allowed border-white/10 bg-card/30'
        : 'cursor-pointer border-[#FFD700] bg-card/60 backdrop-blur-sm hover:shadow-[6px_6px_0px_#000]'
  }`}
      style={{ imageRendering: 'pixelated' }}
      onClick={OnClick}
    >
      <h2
        className="mb-3 min-h-[48px] text-[9px] leading-5 uppercase text-foreground break-words line-clamp-2"
        style={{ fontFamily: '"Press Start 2P", monospace' }}
      >
        {Name}
      </h2>

      <p
        className="text-[8px] uppercase text-white/70"
        style={{ fontFamily: '"Press Start 2P", monospace' }}
      >
        Aposta
      </p>
      <p
        className="mb-2 text-[10px] text-cassino-gold"
        style={{ fontFamily: '"Press Start 2P", monospace' }}
      >
        {MinimumSpinValue.toLocaleString('pt-BR')}
      </p>

      <p
        className="text-[8px] uppercase text-white/70"
        style={{ fontFamily: '"Press Start 2P", monospace' }}
      >
        Fichas mín.
      </p>
      <p
        className="text-[10px] text-white/90"
        style={{ fontFamily: '"Press Start 2P", monospace' }}
      >
        {MinimumChipsRequired.toLocaleString('pt-BR')}
      </p>

      {IsLocked && !IsAdmin && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60">
          <span
            className="text-[9px] uppercase text-red-400"
            style={{ fontFamily: '"Press Start 2P", monospace' }}
          >
            Bloqueado
          </span>
        </div>
      )}

      {!IsActive && IsAdmin && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60">
          <span
            className="text-[9px] uppercase text-orange-400"
            style={{ fontFamily: '"Press Start 2P", monospace' }}
          >
            Desativado
          </span>
        </div>
      )}

      {IsAdmin && (
        <button
          className="relative z-10 mt-4 w-full border border-[#FFD700] px-2 py-2 text-[8px] uppercase text-[#FFD700] hover:bg-[#FFD700]/20 transition-colors opacity-90"
          style={{ fontFamily: '"Press Start 2P", monospace' }}
          onClick={(e) => {
            e.stopPropagation();
            OnEdit();
          }}
        >
          Editar
        </button>
      )}
    </motion.div>
  );
};
