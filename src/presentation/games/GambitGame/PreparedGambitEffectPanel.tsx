import { getGambitEffectPresentation } from './gambitEffectPresentation';
import type { GambitCardEffect } from './gambitTypes';

type PreparedGambitEffectPanelProps = {
  effect: GambitCardEffect | null;
};

export const PreparedGambitEffectPanel = ({
  effect,
}: PreparedGambitEffectPanelProps) => {
  const presentation = effect ? getGambitEffectPresentation(effect) : null;

  return (
    <aside className="bg-card px-4 py-4 pixel-border-gold">
      <p className="font-display text-xs font-bold uppercase tracking-widest text-cassino-gold">
        Efeito Atual
      </p>

      <div className="mt-4 flex min-h-[14rem] flex-col items-center justify-center gap-3 border border-[#e9d79f33] bg-[rgba(4,8,7,0.58)] px-3 py-4 text-center">
        {presentation ? (
          <>
            <img
              alt={presentation.title}
              className="h-32 w-32 object-contain drop-shadow-[4px_4px_0_rgba(0,0,0,0.48)]"
              src={presentation.spritePath}
              style={{ imageRendering: 'pixelated' }}
            />

            <div className="grid gap-2">
              <strong className="font-display text-sm font-bold uppercase leading-4 text-foreground">
                {presentation.title}
              </strong>
              <span className="font-mono text-[9px] uppercase leading-4 text-[#f0e4bd]">
                {presentation.subtitle}
              </span>
            </div>
          </>
        ) : (
          <div className="flex h-32 w-32 items-center justify-center border border-dashed border-[#e9d79f55] bg-black/20">
            <span className="font-mono text-[10px] font-bold uppercase text-foreground">
              NENHUM
            </span>
          </div>
        )}
      </div>
    </aside>
  );
};
