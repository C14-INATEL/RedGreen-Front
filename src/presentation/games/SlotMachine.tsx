import { motion } from 'framer-motion';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { SlotMachinePixi } from './SlotMachineGame/SlotMachinePixi';
import { SlotPaytableHUD } from './SlotMachineGame/SlotPaytableHUD';

const MACHINE_ENTRY_TRANSITION = {
  duration: 0.65,
  ease: [0.22, 1, 0.36, 1],
} as const;

type SlotMachineRouteState = {
  slotMachineIntroCompleted?: boolean;
};

export const SlotMachine = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const routeState = location.state as SlotMachineRouteState | null;
  const [hasEnteredMachineView, setHasEnteredMachineView] = useState(
    routeState?.slotMachineIntroCompleted === true
  );

  return (
    <div className="relative">
      <motion.div
        animate={
          hasEnteredMachineView
            ? { opacity: 1, scale: 1, y: 0 }
            : { opacity: 0.88, scale: 0.66, y: 46 }
        }
        className="origin-center"
        initial={false}
        transition={MACHINE_ENTRY_TRANSITION}
      >
        <SlotMachinePixi animateMachineSprite={hasEnteredMachineView} />
      </motion.div>

      <div className="pointer-events-none absolute left-0 top-3 z-10 hidden -translate-x-[calc(100%+18px)] lg:block">
        <motion.div
          animate={
            hasEnteredMachineView
              ? { opacity: 1, x: 0 }
              : { opacity: 0, x: -120 }
          }
          initial={false}
          transition={{
            ...MACHINE_ENTRY_TRANSITION,
            delay: hasEnteredMachineView ? 0.08 : 0,
          }}
        >
          <SlotPaytableHUD />
        </motion.div>
      </div>

      {!hasEnteredMachineView ? (
        <button
          aria-label="Aproximar da Slot Machine"
          className="absolute inset-0 z-20 cursor-zoom-in bg-transparent"
          onClick={() => {
            setHasEnteredMachineView(true);
            navigate(
              {
                hash: location.hash,
                pathname: location.pathname,
                search: location.search,
              },
              {
                replace: true,
                state: {
                  ...routeState,
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
