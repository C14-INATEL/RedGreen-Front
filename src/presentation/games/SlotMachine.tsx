import { SlotMachinePixi } from './SlotMachinePixi';
import { SlotPaytableHUD } from './SlotPaytableHUD';

export const SlotMachine = () => (
  <div className="relative">
    <div className="pointer-events-none absolute left-0 top-1/2 z-10 hidden -translate-x-[calc(100%+18px)] -translate-y-1/2 lg:block">
      <SlotPaytableHUD />
    </div>

    <SlotMachinePixi />
  </div>
);
