import { motion } from 'framer-motion';
import { type TableColor, TABLE_COLOR_MAP } from '../ui/TableColor';

type SlotMachineCardProps = {
  SlotMachineId: number;
  Name: string;
  MinimumSpinValue: number;
  MinimumChipsRequired: number;
  MinimumRerollValue: number;
  IsLocked: boolean;
  IsAdmin: boolean;
  IsActive: boolean;
  TableColor?: TableColor;
  OnClick: () => void;
  OnEdit: () => void;
};

const DEFAULT_COLOR = TABLE_COLOR_MAP.White;

export const SlotMachineCard = ({
  Name,
  MinimumSpinValue,
  MinimumChipsRequired,
  MinimumRerollValue,
  IsLocked,
  IsAdmin,
  OnClick,
  OnEdit,
  IsActive,
  TableColor,
}: SlotMachineCardProps) => {
  const color =
    TableColor && TABLE_COLOR_MAP[TableColor]
      ? TABLE_COLOR_MAP[TableColor]
      : DEFAULT_COLOR;

  const isInteractive = !IsLocked && IsActive;

  return (
    <motion.div
      whileHover={isInteractive ? { scale: 1.03 } : {}}
      transition={{ duration: 0.15 }}
      className="relative w-52 border-[3px] p-4 text-center shadow-[4px_4px_0px_#000] transition-all duration-200"
      style={{
        imageRendering: 'pixelated',
        cursor: isInteractive ? 'pointer' : 'not-allowed',
        borderColor: isInteractive ? color.border : 'rgba(255,255,255,0.10)',
        background: isInteractive
          ? 'rgba(20,20,30,0.60)'
          : 'rgba(20,20,30,0.30)',
        opacity: IsLocked && !IsAdmin ? 0.4 : 1,
        backdropFilter: 'blur(4px)',
      }}
      whileFocus={{}}
      onMouseEnter={(e) => {
        if (!isInteractive) return;
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = color.hex;
        el.style.boxShadow = `0 0 18px 4px ${color.glow}, 6px 6px 0px #000`;
        el.style.background = color.bg;
      }}
      onMouseLeave={(e) => {
        if (!isInteractive) return;
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = color.border;
        el.style.boxShadow = '4px 4px 0px #000';
        el.style.background = 'rgba(20,20,30,0.60)';
      }}
      onClick={OnClick}
    >
      <h2
        className="mb-4 min-h-[48px] text-[9px] leading-5 uppercase text-foreground break-words line-clamp-2"
        style={{ fontFamily: '"Press Start 2P", monospace' }}
      >
        {Name}
      </h2>

      <div className="flex flex-col gap-2 text-left">
        <div className="flex items-center justify-between gap-2">
          <span
            className="text-[7px] uppercase text-white/50 whitespace-nowrap shrink-0"
            style={{ fontFamily: '"Press Start 2P", monospace' }}
          >
            Aposta
          </span>
          <span
            className="text-[9px] text-cassino-gold text-right min-w-0 break-all"
            style={{ fontFamily: '"Press Start 2P", monospace' }}
          >
            {MinimumSpinValue.toLocaleString('pt-BR')}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <span
            className="text-[7px] uppercase text-white/50 whitespace-nowrap shrink-0"
            style={{ fontFamily: '"Press Start 2P", monospace' }}
          >
            Reroll
          </span>
          <span
            className="text-[9px] text-cassino-gold text-right min-w-0 break-all"
            style={{ fontFamily: '"Press Start 2P", monospace' }}
          >
            {MinimumRerollValue.toLocaleString('pt-BR')}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <span
            className="text-[7px] uppercase text-white/50 whitespace-nowrap shrink-0"
            style={{ fontFamily: '"Press Start 2P", monospace' }}
          >
            Fichas mín.
          </span>
          <span
            className="text-[9px] text-white/90 text-right min-w-0 break-all"
            style={{ fontFamily: '"Press Start 2P", monospace' }}
          >
            {MinimumChipsRequired.toLocaleString('pt-BR')}
          </span>
        </div>
      </div>

      {IsLocked && (
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
          className="relative z-10 mt-4 w-full border px-2 py-2 text-[8px] uppercase transition-colors opacity-90"
          style={{
            fontFamily: '"Press Start 2P", monospace',
            borderColor: color.hex,
            color: color.hex,
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background =
              `${color.hex}33`;
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = 'transparent';
          }}
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
