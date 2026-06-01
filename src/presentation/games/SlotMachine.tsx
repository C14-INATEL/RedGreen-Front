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
  slotMachineIntroCompleted?: boolean;
  slotMachineId?: number;
};

export const SlotMachine = () => {
  const Location = useLocation();
  const Navigate = useNavigate();
  const RouteState = Location.state as SlotMachineRouteState | null;
  const SelectedSlotMachineId = RouteState?.slotMachineId;
  const [HasEnteredMachineView, SetHasEnteredMachineView] = useState(
    RouteState?.slotMachineIntroCompleted === true
  );

  return (
    <div className="relative">
      <motion.div
        initial={false}
        animate={
          HasEnteredMachineView
            ? { opacity: 1, scale: 1, y: 0 }
            : { opacity: 0.88, scale: 0.66, y: 46 }
        }
        className="origin-center"
        transition={MACHINE_ENTRY_TRANSITION}
      >
        <SlotMachinePixi
          animateMachineSprite={HasEnteredMachineView}
          slotMachineId={SelectedSlotMachineId}
        />
      </motion.div>

      <div className="pointer-events-none absolute left-0 top-3 z-10 hidden -translate-x-[calc(100%+18px)] lg:block">
        <motion.div
          initial={false}
          animate={
            HasEnteredMachineView
              ? { opacity: 1, x: 0 }
              : { opacity: 0, x: -120 }
          }
          transition={{
            ...MACHINE_ENTRY_TRANSITION,
            delay: HasEnteredMachineView ? 0.08 : 0,
          }}
        >
          <SlotPaytableHUD />
        </motion.div>
      </div>

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
                  slotMachineIntroCompleted: true,
                },
              }
            );
          }}
          type="button"
        />
      ) : null}
    </div>
  );
};
