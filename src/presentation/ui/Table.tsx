import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import TableDecorations from '@ui/TableDecorations';
import GameCard from '@ui/GameCard';
import MinefieldIcon from '@ui/MinefieldIcon';
import SlotMachineIcon from '@ui/SlotMachineIcon';
import { paths } from '../../paths';

const Table = () => {
  const Navigate = useNavigate();

  const handleStartSlotMachine = () => {
    Navigate(paths.slotmachineroom, {
      state: {
        slotMachineIntroCompleted: false,
      },
    });
  };

  const handleStartMinefield = () => {
    Navigate(paths.minefieldRoom);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="relative w-full max-w-5xl"
    >
      <div className="p-1 bg-border pixel-shadow">
        <div className="p-1 bg-card">
          <div className="p-1 bg-border">
            <div className="relative bg-table-green p-8 md:p-12">
              <TableDecorations />

              <div className="relative z-10 flex min-h-[280px] flex-wrap items-center justify-center gap-12 py-4">
                <GameCard
                  title="Caça-Niquel"
                  subtitle="Girar"
                  icon={<SlotMachineIcon />}
                  delay={0.1}
                  onClick={handleStartSlotMachine}
                />

                <GameCard
                  title="Campo Minado"
                  subtitle="Abrir"
                  icon={<MinefieldIcon />}
                  delay={0.18}
                  onClick={handleStartMinefield}
                />
              </div>

              <div className="relative z-10 mt-8 pt-4 border-t-2 border-border flex items-center justify-center">
                <p className="text-muted-foreground/50 text-[11px] tracking-[0.3em] uppercase font-display">
                  &nbsp;&nbsp;&nbsp;◆ ESCOLHA SEU JOGO ◆&nbsp;&nbsp;&nbsp;
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Table;
