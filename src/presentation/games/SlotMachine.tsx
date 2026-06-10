import { motion } from 'framer-motion';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { SlotMachinePixi } from './SlotMachineGame/SlotMachinePixi';
import { SlotPaytableHUD } from './SlotMachineGame/SlotPaytableHUD';

const MACHINE_ENTRY_TRANSITION = {
  duration: 0.65,
  ease: [0.22, 1, 0.36, 1],
} as const;

export type SlotMachineFromApi = {
  SlotMachineId: number;
  Name: string;
  Description: string;
  MinimumSpinValue: number;
  MinimumChipsRequired: number;
  MinimumRerollValue: number;
  Active: boolean;
};

type SlotMachineRouteState = {
  SlotMachineIntroCompleted?: boolean;
  SlotMachineId?: number;
};

export const SlotMachine = () => {
  const Location = useLocation();
  const Navigate = useNavigate();

  const RouteState = Location.state as SlotMachineRouteState | null;

  const SelectedSlotMachineId = RouteState?.SlotMachineId;

  const [HasEnteredMachineView, SetHasEnteredMachineView] = useState(
    RouteState?.SlotMachineIntroCompleted === true
  );
  const [IsPaytableCollapsed, SetIsPaytableCollapsed] = useState(false);

  return (
    <div className="relative flex w-full items-start justify-center">
      <motion.div
        initial={false}
        animate={
          HasEnteredMachineView ? { opacity: 1, x: 0 } : { opacity: 0, x: -120 }
        }
        className="absolute -left-64 top-3 z-10 hidden lg:block"
        transition={{
          ...MACHINE_ENTRY_TRANSITION,
          delay: HasEnteredMachineView ? 0.08 : 0,
        }}
      >
        <SlotPaytableHUD
          isCollapsed={IsPaytableCollapsed}
          onToggleCollapsed={() => SetIsPaytableCollapsed((value) => !value)}
        />
      </motion.div>

      <motion.div
        initial={false}
        animate={
          HasEnteredMachineView
            ? { opacity: 1, scale: 1, y: 0 }
            : { opacity: 0.88, scale: 0.66, y: 46 }
        }
        className="relative origin-center shrink-0"
        transition={MACHINE_ENTRY_TRANSITION}
      >
        <SlotMachinePixi
          animateMachineSprite={HasEnteredMachineView}
          slotMachineId={SelectedSlotMachineId}
        />

        {!HasEnteredMachineView ? (
          <button
            aria-label="Aproximar da Slot Machine"
            className="absolute inset-0 z-20 cursor-zoom-in bg-transparent"
            onClick={() => {
              SetHasEnteredMachineView(true);

              Navigate(
                {
                  hash: Location.hash,
                  pathname: Location.pathname,
                  search: Location.search,
                },
                {
                  replace: true,
                  state: {
                    ...RouteState,
                    SlotMachineIntroCompleted: true,
                  },
                }
              );
            }}
            type="button"
          />
        ) : null}
      </motion.div>
    </div>
  );
};
