import type { CSSProperties } from 'react';
import { SlotMachineReels } from './SlotMachineReels';

const SLOT_MACHINE_CONFIG = {
  frameMaxWidthPx: 960,
  reelArea: {
    leftRatio: 928 / 4096,
    topRatio: 608 / 4096,
    widthRatio: 2200 / 4096,
    heightRatio: 728 / 4096,
  },
} as const;

const reelAreaStyle: CSSProperties = {
  left: `${SLOT_MACHINE_CONFIG.reelArea.leftRatio * 100}%`,
  top: `${SLOT_MACHINE_CONFIG.reelArea.topRatio * 100}%`,
  width: `${SLOT_MACHINE_CONFIG.reelArea.widthRatio * 100}%`,
  height: `${SLOT_MACHINE_CONFIG.reelArea.heightRatio * 100}%`,
};

export const SlotMachinePixi = () => (
  <div
    className="relative w-full shrink-0"
    style={{ maxWidth: `${SLOT_MACHINE_CONFIG.frameMaxWidthPx}px` }}
  >
    <img
      alt="Caça-níquel de teste"
      className="block w-full select-none"
      draggable={false}
      src="/SlotMachine/SpriteSlotMachine.png"
    />

    <SlotMachineReels
      className="pointer-events-none absolute"
      style={reelAreaStyle}
    />
  </div>
);
