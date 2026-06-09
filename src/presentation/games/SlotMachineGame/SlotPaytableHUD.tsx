import { SLOT_PAYTABLE_ENTRIES } from './SlotPaytable';

const HUD_ROW_CLASSES =
  'flex min-h-[54px] items-center justify-between gap-2 rounded-[7px] border border-[#d9b453]/18 bg-[rgba(6,20,9,0.88)] px-2.5 py-2 shadow-[inset_0_1px_0_rgba(255,236,173,0.06)]';

type SlotPaytableHUDProps = {
  isCollapsed: boolean;
  onToggleCollapsed: () => void;
};

const getSymbolGroup = (symbols: readonly string[]) => {
  const [firstSymbol] = symbols;
  const isRepeatedSet =
    symbols.length > 1 && symbols.every((symbol) => symbol === firstSymbol);

  return {
    count: symbols.length,
    isRepeatedSet,
    symbolSource: firstSymbol ?? '',
  };
};

export const SlotPaytableHUD = ({
  isCollapsed,
  onToggleCollapsed,
}: SlotPaytableHUDProps) => {
  if (isCollapsed) {
    return (
      <aside
        aria-label="Tabela visual de combinacoes da Slot Machine"
        className="-translate-x-[100%]"
      >
        <button
          aria-label="Expandir tabela de prêmios"
          className="min-h-[90px] rounded-[8px] border border-[#d9b453]/45 bg-[linear-gradient(180deg,rgba(24,43,19,0.98)_0%,rgba(8,20,10,0.98)_100%)] px-2.5 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-[#f2d680] shadow-[0_0_0_1px_rgba(40,64,25,0.6),5px_5px_0_rgba(0,0,0,0.22)] [writing-mode:horizontal-rl]"
          onClick={onToggleCollapsed}
          type="button"
        >
          Prêmios
        </button>
      </aside>
    );
  }

  return (
    <aside
      aria-label="Tabela visual de combinacoes da Slot Machine"
      className="w-[280px] shrink-0"
    >
      <div className="overflow-hidden rounded-[10px] border border-[#d9b453]/45 bg-[linear-gradient(180deg,rgba(24,43,19,0.98)_0%,rgba(8,20,10,0.98)_100%)] p-3 shadow-[0_0_0_1px_rgba(40,64,25,0.6),6px_6px_0_rgba(0,0,0,0.22)]">
        <div className="mb-2.5 flex items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#f2d680]">
            Tabela de Prêmios
          </span>
          <span className="h-px flex-1 bg-[#f2d680]/25" />
          <button
            aria-label="Minimizar tabela de prêmios"
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[6px] border border-[#d9b453]/35 bg-[#14240f] font-mono text-[12px] leading-none text-[#f2d680] transition-colors hover:bg-[#203819]"
            onClick={onToggleCollapsed}
            type="button"
          >
            -
          </button>
        </div>

        <div className="space-y-1.5">
          {SLOT_PAYTABLE_ENTRIES.map(({ id, prize, symbols }) => {
            const { count, isRepeatedSet, symbolSource } =
              getSymbolGroup(symbols);

            return (
              <div
                aria-label={`${prize} com ${symbols.length} simbolo(s)`}
                className={HUD_ROW_CLASSES}
                key={id}
              >
                <div className="flex min-w-0 items-center gap-2">
                  {isRepeatedSet ? (
                    <>
                      <img
                        alt=""
                        aria-hidden="true"
                        className="block h-[50px] w-auto max-w-none shrink-0 select-none"
                        draggable={false}
                        src={symbolSource}
                        style={{
                          imageRendering: 'pixelated',
                          objectFit: 'contain',
                        }}
                      />
                      <span className="font-mono text-[10px] text-[#f2d680]">
                        x{count}
                      </span>
                    </>
                  ) : (
                    symbols.map((symbolSourceItem, index) => (
                      <img
                        alt=""
                        aria-hidden="true"
                        className="block h-[36px] w-auto max-w-none shrink-0 select-none"
                        draggable={false}
                        key={`${id}-${symbolSourceItem}-${index}`}
                        src={symbolSourceItem}
                        style={{
                          imageRendering: 'pixelated',
                          objectFit: 'contain',
                        }}
                      />
                    ))
                  )}
                </div>

                <span className="pl-2 font-mono text-[10px] leading-[1.25] text-right text-[#fff2c0]">
                  {prize}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
};
