import { SLOT_PAYTABLE_ENTRIES } from './slotPaytable';

const HUD_ROW_CLASSES =
  'flex min-h-[82px] items-center justify-between gap-5 rounded-[8px] border border-[#d9b453]/18 bg-[rgba(6,20,9,0.88)] px-4 py-3.5 shadow-[inset_0_1px_0_rgba(255,236,173,0.06)]';

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

export const SlotPaytableHUD = () => (
  <aside
    aria-label="Tabela visual de combinacoes da Slot Machine"
    className="w-[360px] shrink-0"
  >
    <div className="overflow-hidden rounded-[10px] border border-[#d9b453]/45 bg-[linear-gradient(180deg,rgba(24,43,19,0.98)_0%,rgba(8,20,10,0.98)_100%)] p-5 shadow-[0_0_0_1px_rgba(40,64,25,0.6),8px_8px_0_rgba(0,0,0,0.25)]">
      <div className="mb-4 flex items-center gap-2">
        <span className="font-mono text-[9px] uppercase tracking-[0.24em] text-[#f2d680]">
          Paytable
        </span>
        <span className="h-px flex-1 bg-[#f2d680]/25" />
      </div>

      <div className="space-y-3">
        {SLOT_PAYTABLE_ENTRIES.map(({ id, prize, symbols }) => {
          const { count, isRepeatedSet, symbolSource } =
            getSymbolGroup(symbols);

          return (
            <div
              aria-label={`${prize} com ${symbols.length} simbolo(s)`}
              className={HUD_ROW_CLASSES}
              key={id}
            >
              <div className="flex min-w-0 items-center gap-3.5">
                {isRepeatedSet ? (
                  <>
                    <img
                      alt=""
                      aria-hidden="true"
                      className="block h-[52px] w-auto max-w-none shrink-0 select-none"
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
                      className="block h-[52px] w-auto max-w-none shrink-0 select-none"
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

              <span className="pl-4 font-mono text-[10px] leading-[1.45] text-right text-[#fff2c0]">
                {prize}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  </aside>
);
