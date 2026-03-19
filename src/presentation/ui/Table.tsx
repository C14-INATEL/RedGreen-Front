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
      <div className="p-1 bg-border pixel-shadow">
        <div className="p-1 bg-card">
          <div className="p-1 bg-border">
            <div className="relative bg-table-green p-8 md:p-12">
              <TableDecorations />

              <div className="relative z-10 flex items-center justify-center h-32">
                <p className="text-muted-foreground/50 text-sm font-body">
                  jogos
                </p>
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
