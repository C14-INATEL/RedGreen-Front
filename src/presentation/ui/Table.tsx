import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import TableDecorations from '@ui/TableDecorations';
import GameCard from '@ui/GameCard';
import SlotMachineIcon from '@ui/SlotMachineIcon';
import CardGameIcon from '@ui/CardGameIcon';
import { paths } from '../../paths';

const Table = () => {
  const Navigate = useNavigate();

  const HandleStartGame = () => {
    const Token = localStorage.getItem('authToken');
    const IsLoggedIn = !!Token;

    if (IsLoggedIn) {
      Navigate('/tables');
      return;
    }

    Navigate(paths.slotmachineroom, {
      state: {
        slotMachineIntroCompleted: false,
      },
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="relative w-full max-w-5xl"
    >
      <div
        className="relative"
        style={{
          border: '3px solid hsl(45 80% 45%)',
          boxShadow:
            '0 0 0 1px hsl(45 60% 30%), 6px 6px 0px rgba(0,0,0,0.6), 0 0 24px hsl(45 80% 35% / 0.25)',
        }}
      >
        <div
          className="relative bg-table-green p-8 md:p-12"
          style={{
            outline: '1px solid hsl(45 60% 30% / 0.5)',
            outlineOffset: '-6px',
          }}
        >
          <TableDecorations />

          <div className="relative z-10 mx-auto flex min-h-[280px] w-full max-w-2xl items-center justify-around gap-8 py-4 md:max-w-3xl md:gap-16">
            <GameCard
              title="Caça-Níquel"
              subtitle="Girar"
              icon={<SlotMachineIcon />}
              delay={0.1}
              onClick={HandleStartGame}
            />
            <GameCard
              title="Cartas"
              subtitle="Em breve"
              icon={<CardGameIcon />}
              delay={0.18}
            />
          </div>

          <div
            className="relative z-10 mt-8 pt-4 flex items-center justify-center"
            style={{ borderTop: '2px solid hsl(45 60% 35% / 0.3)' }}
          >
            <p
              className="text-[11px] tracking-[0.3em] uppercase font-display"
              style={{ color: 'hsl(45 70% 45% / 0.5)' }}
            >
              &nbsp;&nbsp;&nbsp;◆ ESCOLHA SEU JOGO ◆&nbsp;&nbsp;&nbsp;
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Table;
