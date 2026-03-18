import type { CSSProperties } from 'react';
import { SlotMachineReels } from './SlotMachineReels';

const SLOT_MACHINE_REEL_AREA = {
  left: 928 / 4096,
  top: 608 / 4096,
  width: 2200 / 4096,
  height: 728 / 4096,
} as const;

const reelAreaStyle: CSSProperties = {
  left: `${SLOT_MACHINE_REEL_AREA.left * 100}%`,
  top: `${SLOT_MACHINE_REEL_AREA.top * 100}%`,
  width: `${SLOT_MACHINE_REEL_AREA.width * 100}%`,
  height: `${SLOT_MACHINE_REEL_AREA.height * 100}%`,
};

export const SlotMachinePixi = () => (
  <div className="relative w-full max-w-[960px] shrink-0">
    <img
      alt="Caça-níquel de teste"
      className="block w-full select-none"
      draggable={false}
      src="/CacaNiquel.png"
    />

    <SlotMachineReels
      className="pointer-events-none absolute"
      style={reelAreaStyle}
    />
  </div>
);
