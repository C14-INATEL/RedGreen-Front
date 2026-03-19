import { motion } from 'framer-motion';
import TableDecorations from '@presentation/ui/TableDecorations';

const Table = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="relative w-full max-w-5xl"
    >
      <div
        className="rounded-3xl p-[3px]"
        style={{ background: 'hsl(210 20% 8%)' }}
      >
        <div
          className="rounded-[22px] p-[3px]"
          style={{
            background:
              'linear-gradient(135deg, hsl(35 80% 45%), hsl(25 90% 50%), hsl(35 80% 45%))',
          }}
        >
          <div
            className="rounded-[20px] p-[3px]"
            style={{ background: 'hsl(210 20% 8%)' }}
          >
            <div
              className="relative rounded-[18px] px-8 py-10 md:px-16 md:py-14 overflow-hidden"
              style={{ background: 'hsl(150 38% 14%)' }}
            >
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    'radial-gradient(ellipse at 50% 40%, hsl(150 35% 18% / 0.5) 0%, transparent 60%)',
                }}
              />

              <TableDecorations />

              <div className="relative z-10 flex items-center justify-center h-32">
                <p className="text-muted-foreground/50 text-sm">jogos</p>
              </div>

              <div className="relative z-10 flex items-center justify-center mt-8 pt-4 border-t border-foreground/5">
                <p className="text-muted-foreground/50 text-[11px] tracking-[0.3em] uppercase font-display">
                  ♠&nbsp;&nbsp;&nbsp;Escolha seu Jogo&nbsp;&nbsp;&nbsp;♠
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
