import type { CSSProperties, HTMLAttributes } from 'react';
import { useEffect, useRef } from 'react';
import { Application, Container, Graphics, Text, TextStyle } from 'pixi.js';

const SLOT_SYMBOLS = ['7', 'BAR', 'STAR', 'CHERRY', 'LEMON', 'BONUS'] as const;
const SYMBOL_COLORS = [
  0xf43f5e, 0xf59e0b, 0x22c55e, 0x3b82f6, 0xa855f7, 0xef4444,
] as const;
const REEL_COUNT = 4;
const VISIBLE_ROWS = 3;
const BUFFER_ROWS = 2;
const REEL_WIDTH_RATIO = 376 / 2200;
const REEL_GAP_RATIO = 232 / 2200;

type SlotMachineReelsProps = Pick<
  HTMLAttributes<HTMLDivElement>,
  'className' | 'style'
>;

type ReelSymbol = {
  container: Container;
  label: Text;
  background: Graphics;
  accent: Graphics;
};

type ReelState = {
  reelWidth: number;
  symbols: ReelSymbol[];
  symbolHeight: number;
  speed: number;
  viewHeight: number;
};

const getSymbolIndex = (seed: number) => seed % SLOT_SYMBOLS.length;

const updateSymbolAppearance = (
  symbol: ReelSymbol,
  width: number,
  height: number,
  seed: number
) => {
  const symbolIndex = getSymbolIndex(seed);
  const fillColor = SYMBOL_COLORS[symbolIndex];

  symbol.background.clear();
  symbol.background.beginFill(0xffffff, 0.96);
  symbol.background.lineStyle(6, fillColor, 0.85);
  symbol.background.drawRoundedRect(
    0,
    0,
    width,
    height,
    Math.min(width, height) * 0.16
  );
  symbol.background.endFill();

  symbol.accent.clear();
  symbol.accent.beginFill(fillColor, 0.14);
  symbol.accent.drawRoundedRect(
    width * 0.08,
    height * 0.08,
    width * 0.84,
    height * 0.2,
    Math.min(width, height) * 0.1
  );
  symbol.accent.endFill();

  symbol.label.text = SLOT_SYMBOLS[symbolIndex];
  symbol.label.style = new TextStyle({
    align: 'center',
    dropShadow: true,
    dropShadowAlpha: 0.16,
    dropShadowBlur: 8,
    dropShadowColor: 0x0f172a,
    dropShadowDistance: 6,
    fill: fillColor,
    fontFamily: 'Georgia',
    fontSize: Math.min(width, height) * 0.24,
    fontStyle: 'italic',
    fontWeight: '700',
    letterSpacing: width * 0.02,
    stroke: 0x0f172a,
    strokeThickness: Math.max(2, Math.round(width * 0.018)),
  });
  symbol.label.anchor.set(0.5);
  symbol.label.position.set(width / 2, height / 2);
};

const createSymbol = (
  width: number,
  height: number,
  seed: number
): ReelSymbol => {
  const container = new Container();
  const background = new Graphics();
  const accent = new Graphics();
  const label = new Text('');

  container.addChild(background);
  container.addChild(accent);
  container.addChild(label);

  const symbol = { accent, background, container, label };
  updateSymbolAppearance(symbol, width, height, seed);

  return symbol;
};

const destroyChildren = (container: Container) => {
  container.removeChildren().forEach((child) => {
    child.destroy({ children: true });
  });
};

const createReels = (width: number, height: number) => {
  const root = new Container();
  const reels: ReelState[] = [];
  const reelWidth = width * REEL_WIDTH_RATIO;
  const reelGap = width * REEL_GAP_RATIO;
  const symbolHeight = height / VISIBLE_ROWS;
  const totalSymbols = VISIBLE_ROWS + BUFFER_ROWS * 2;

  for (let reelIndex = 0; reelIndex < REEL_COUNT; reelIndex += 1) {
    const reelFrame = new Container();
    reelFrame.x = reelIndex * (reelWidth + reelGap);

    const mask = new Graphics();
    mask.beginFill(0xffffff);
    mask.drawRoundedRect(
      0,
      0,
      reelWidth,
      height,
      Math.min(reelWidth, height) * 0.08
    );
    mask.endFill();

    const reelContent = new Container();
    reelContent.mask = mask;

    const gloss = new Graphics();
    gloss.beginFill(0xffffff, 0.08);
    gloss.drawRoundedRect(
      reelWidth * 0.08,
      height * 0.04,
      reelWidth * 0.84,
      height * 0.12,
      Math.min(reelWidth, height) * 0.06
    );
    gloss.endFill();

    const symbols = Array.from({ length: totalSymbols }, (_, symbolIndex) => {
      const symbol = createSymbol(
        reelWidth,
        symbolHeight,
        reelIndex * totalSymbols + symbolIndex
      );

      symbol.container.y = (symbolIndex - BUFFER_ROWS) * symbolHeight;
      reelContent.addChild(symbol.container);

      return symbol;
    });

    reelFrame.addChild(reelContent);
    reelFrame.addChild(mask);
    reelFrame.addChild(gloss);
    root.addChild(reelFrame);

    reels.push({
      reelWidth,
      speed: (height / 240) * (1 + reelIndex * 0.14),
      symbolHeight,
      symbols,
      viewHeight: height,
    });
  }

  return { reels, root };
};

const updateReels = (reels: ReelState[], deltaTime: number) => {
  reels.forEach((reel, reelIndex) => {
    reel.symbols.forEach((symbol) => {
      symbol.container.y += reel.speed * deltaTime;

      if (symbol.container.y >= reel.viewHeight + reel.symbolHeight) {
        const highestSymbolY = Math.min(
          ...reel.symbols.map(({ container }) => container.y)
        );

        symbol.container.y = highestSymbolY - reel.symbolHeight;
        updateSymbolAppearance(
          symbol,
          reel.reelWidth,
          reel.symbolHeight,
          reelIndex +
            Math.round(Math.abs(symbol.container.y / reel.symbolHeight))
        );
      }
    });
  });
};

export const SlotMachineReels = ({
  className,
  style,
}: SlotMachineReelsProps) => {
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const host = hostRef.current;

    if (!host) {
      return undefined;
    }

    let app: Application | null = null;
    let root: Container | null = null;
    let observer: ResizeObserver | null = null;
    let isDisposed = false;
    let reels: ReelState[] = [];

    const rebuild = () => {
      if (!root) {
        return;
      }

      const width = host.clientWidth;
      const height = host.clientHeight;

      if (!width || !height) {
        return;
      }

      destroyChildren(root);

      const scene = createReels(width, height);
      root.addChild(scene.root);
      reels = scene.reels;
    };

    const handleTick = () => {
      if (!app || !reels.length) {
        return;
      }

      updateReels(reels, app.ticker.deltaTime);
    };

    const setup = async () => {
      const nextApp = new Application({
        antialias: true,
        autoDensity: true,
        backgroundAlpha: 0,
        resolution: window.devicePixelRatio || 1,
        resizeTo: host,
      });

      if (isDisposed) {
        nextApp.destroy(true, { children: true });
        return;
      }

      app = nextApp;

      const canvas = nextApp.view as HTMLCanvasElement;
      canvas.style.display = 'block';
      canvas.style.height = '100%';
      canvas.style.width = '100%';

      host.appendChild(canvas);

      root = new Container();
      nextApp.stage.addChild(root);

      observer =
        typeof ResizeObserver === 'undefined'
          ? null
          : new ResizeObserver(() => {
              rebuild();
            });

      observer?.observe(host);
      rebuild();
      nextApp.ticker.add(handleTick);
    };

    void setup();

    return () => {
      isDisposed = true;
      observer?.disconnect();
      app?.ticker.remove(handleTick);

      if (root) {
        destroyChildren(root);
      }

      app?.destroy(true, { children: true });
    };
  }, []);

  const combinedStyle: CSSProperties = {
    ...style,
  };

  return (
    <div
      className={className ? `overflow-hidden ${className}` : 'overflow-hidden'}
      ref={hostRef}
      style={combinedStyle}
    />
  );
};
